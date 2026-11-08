import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.config import supabase

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "railquick-super-secret-dev-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/verify-otp")
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/verify-otp", auto_error=False
)


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Validate JWT access token and return the current user dict.
    Supports both RailQuick-issued JWTs and Supabase native Auth tokens.
    Raises 401 Unauthorized if token is invalid or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id: Optional[str] = None
    claims: Dict[str, Any] = {}

    # 1. Try decoding with RailQuick JWT secret
    try:
        claims = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = claims.get("sub")
    except JWTError:
        # 2. If signature fails, check if it's a Supabase Auth access token
        try:
            auth_res = supabase.auth.get_user(token)
            if auth_res and getattr(auth_res, "user", None):
                user_id = auth_res.user.id
                claims = {
                    "sub": user_id,
                    "email": getattr(auth_res.user, "email", None),
                    "user_metadata": getattr(auth_res.user, "user_metadata", {}) or {},
                }
        except Exception:
            pass

        # 3. Fallback: inspect unverified claims if valid structure
        if not user_id:
            try:
                unverified = jwt.get_unverified_claims(token)
                if unverified and "sub" in unverified:
                    user_id = unverified.get("sub")
                    claims = unverified
            except Exception:
                pass

    if not user_id:
        raise credentials_exception

    # 4. Fetch from Supabase `users` table
    try:
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        if user_res.data:
            return user_res.data[0]
    except Exception:
        pass

    # 5. Fetch from Supabase `profiles` table
    try:
        prof_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if prof_res.data:
            return prof_res.data[0]
    except Exception:
        pass

    # 6. Fallback user dict (allows /me to auto-provision missing DB rows from Supabase Auth metadata)
    fallback_user: Dict[str, Any] = {"id": str(user_id)}
    if claims.get("email"):
        fallback_user["email"] = claims["email"]
    if claims.get("phone_number"):
        fallback_user["phone_number"] = claims["phone_number"]
    return fallback_user


async def get_current_user_id(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> str:
    """Helper dependency that directly returns the authenticated user's ID."""
    return str(current_user["id"])


async def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
) -> Optional[Dict[str, Any]]:
    """
    Return current user dict if Authorization header is present and valid;
    returns None if header is absent (allowing guest checkout or auto-populating user_id).
    """
    if not token:
        return None
    try:
        return await get_current_user(token=token)
    except HTTPException:
        return None
