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
    Raises 401 Unauthorized if token is invalid, expired, or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_res.data:
            raise credentials_exception
        return user_res.data[0]
    except HTTPException:
        raise
    except Exception:
        raise credentials_exception


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
