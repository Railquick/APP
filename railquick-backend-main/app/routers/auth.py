import os
import random
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from app.config import supabase
from app.utils.auth_utils import create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/google/callback"
)
FRONTEND_REDIRECT_URL = os.getenv("FRONTEND_REDIRECT_URL", "")


class SendOTPRequest(BaseModel):
    phone_number: str = Field(..., description="10-digit mobile number")


class VerifyOTPRequest(BaseModel):
    phone_number: str = Field(..., description="10-digit mobile number")
    otp: str = Field(..., description="4-digit OTP code")


def clean_phone_number(phone_raw: str) -> str:
    """
    Sanitize and validate phone number to a standard 10-digit format.
    Handles optional country code (+91 / 91) and leading zeros.
    """
    cleaned = "".join(ch for ch in phone_raw.strip() if ch.isdigit())
    if len(cleaned) == 12 and cleaned.startswith("91"):
        cleaned = cleaned[2:]
    elif len(cleaned) == 11 and cleaned.startswith("0"):
        cleaned = cleaned[1:]

    if len(cleaned) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format. Must be a valid 10-digit number.",
        )
    return cleaned


@router.post("/send-otp")
async def send_otp(payload: SendOTPRequest):
    phone_number = clean_phone_number(payload.phone_number)

    # Use fixed OTP for demo/test number or test environment
    is_test_env = os.getenv("ENVIRONMENT", "").lower() in ("test", "testing")
    if phone_number == "9999999999" or is_test_env:
        otp = "1234"
    else:
        otp = f"{random.randint(1000, 9999)}"

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    # Upsert into phone_otps table
    supabase.table("phone_otps").upsert(
        {
            "phone_number": phone_number,
            "otp_code": otp,
            "expires_at": expires_at.isoformat(),
        }
    ).execute()

    print(f"[DEV AUTH] OTP for {phone_number}: {otp}")

    return {"success": True, "message": "OTP sent successfully"}


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOTPRequest):
    phone_number = clean_phone_number(payload.phone_number)
    submitted_otp = payload.otp.strip()

    # Fetch entry from phone_otps
    otp_res = (
        supabase.table("phone_otps")
        .select("*")
        .eq("phone_number", phone_number)
        .execute()
    )

    if not otp_res.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    otp_entry = otp_res.data[0]

    # Validate OTP code match
    if str(otp_entry.get("otp_code")).strip() != submitted_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    # Validate expiration time
    try:
        exp_dt = datetime.fromisoformat(otp_entry["expires_at"])
        if exp_dt.tzinfo is None:
            exp_dt = exp_dt.replace(tzinfo=timezone.utc)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    if exp_dt <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    # Delete verified entry from phone_otps (single-use token protection)
    supabase.table("phone_otps").delete().eq("phone_number", phone_number).execute()

    # Query users table: fetch existing or insert new user
    user_res = (
        supabase.table("users")
        .select("*")
        .eq("phone_number", phone_number)
        .execute()
    )

    if user_res.data:
        user = user_res.data[0]
    else:
        # Create user record (sync to auth.users and profiles if available for FK compatibility)
        uid = None
        try:
            auth_user = supabase.auth.admin.create_user(
                {"phone": f"+91{phone_number}", "phone_confirm": True}
            )
            if auth_user and auth_user.user:
                uid = auth_user.user.id
        except Exception:
            pass

        user_data = {"phone_number": phone_number}
        if uid:
            user_data["id"] = uid

        new_user_res = (
            supabase.table("users")
            .insert(user_data)
            .execute()
        )
        if not new_user_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account",
            )
        user = new_user_res.data[0]

        try:
            supabase.table("profiles").upsert(
                {"id": user["id"], "phone": phone_number}
            ).execute()
        except Exception:
            pass

    # Generate JWT access token
    access_token = create_access_token(
        data={"sub": str(user["id"]), "phone_number": user["phone_number"]}
    )

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/google")
async def google_token_login(payload: dict):
    """
    Accepts { accessToken: str } from frontend, fetches user profile from Google,
    upserts the user into Supabase 'users' table, and returns a valid Session with access_token and user object.
    """
    access_token = payload.get("accessToken") or payload.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google access token is required",
        )

    userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    async with httpx.AsyncClient() as http_client:
        try:
            userinfo_response = await http_client.get(
                userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Error connecting to Google userinfo endpoint: {str(exc)}",
            )

        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user information from Google",
            )

        userinfo = userinfo_response.json()

    google_email = userinfo.get("email")
    google_name = userinfo.get("name")
    google_avatar = userinfo.get("picture")

    if not google_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account has no email associated",
        )

    # Upsert the user into Supabase 'users' table (email, name, avatar_url, auth_provider="google")
    user_res = (
        supabase.table("users")
        .select("*")
        .eq("email", google_email)
        .execute()
    )

    if user_res.data:
        user = user_res.data[0]
        updates = {"auth_provider": "google"}
        if google_name:
            updates["name"] = google_name
        if google_avatar:
            updates["avatar_url"] = google_avatar

        update_res = (
            supabase.table("users")
            .update(updates)
            .eq("id", user["id"])
            .execute()
        )
        if update_res.data:
            user = update_res.data[0]
    else:
        # Create user record
        uid = None
        try:
            auth_user = supabase.auth.admin.create_user(
                {"email": google_email, "email_confirm": True}
            )
            if auth_user and auth_user.user:
                uid = auth_user.user.id
        except Exception:
            pass

        user_data = {
            "email": google_email,
            "name": google_name,
            "avatar_url": google_avatar,
            "auth_provider": "google",
        }
        if uid:
            user_data["id"] = uid

        new_user_res = (
            supabase.table("users")
            .insert(user_data)
            .execute()
        )
        if not new_user_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account",
            )
        user = new_user_res.data[0]

        try:
            supabase.table("profiles").upsert(
                {
                    "id": user["id"],
                    "phone": user.get("phone_number") or "",
                    "full_name": google_name or "",
                }
            ).execute()
        except Exception:
            pass

    # Issue RailQuick JWT
    jwt_token = create_access_token(
        data={"sub": str(user["id"]), "email": user.get("email")}
    )

    if "phone" not in user and "phone_number" in user:
        user["phone"] = user.get("phone_number")

    return {
        "success": True,
        "token": jwt_token,
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/google/login")
async def google_login():
    """
    Generate Google OAuth 2.0 authorization URL and redirect the client.
    """
    client_id = os.getenv("GOOGLE_CLIENT_ID", GOOGLE_CLIENT_ID)
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", GOOGLE_REDIRECT_URI)

    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth client ID is not configured",
        )

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    authorization_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url=authorization_url)


@router.get("/google/callback")
async def google_callback(
    code: Optional[str] = Query(None, description="Google OAuth authorization code"),
    error: Optional[str] = Query(None, description="OAuth error message if failed"),
) -> Any:
    """
    Google OAuth 2.0 callback endpoint.
    Exchanges code for tokens, retrieves user profile, upserts user, and issues RailQuick JWT.
    """
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google login failed: {error}",
        )

    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code is missing",
        )

    client_id = os.getenv("GOOGLE_CLIENT_ID", GOOGLE_CLIENT_ID)
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", GOOGLE_CLIENT_SECRET)
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", GOOGLE_REDIRECT_URI)

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth credentials are not properly configured on server",
        )

    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri,
    }

    async with httpx.AsyncClient() as http_client:
        try:
            token_response = await http_client.post(token_url, data=token_payload)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Error connecting to Google token endpoint: {str(exc)}",
            )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange authorization code for tokens: {token_response.text}",
            )

        token_data = token_response.json()
        google_access_token = token_data.get("access_token")
        if not google_access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google access token missing in token response",
            )

        # Retrieve user info from Google
        userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        try:
            userinfo_response = await http_client.get(
                userinfo_url,
                headers={"Authorization": f"Bearer {google_access_token}"},
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Error connecting to Google userinfo endpoint: {str(exc)}",
            )

        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user information from Google",
            )

        userinfo = userinfo_response.json()

    google_email = userinfo.get("email")
    google_name = userinfo.get("name")
    google_avatar = userinfo.get("picture")

    if not google_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account has no email associated",
        )

    # Database Upsert / User Lookup
    user_res = (
        supabase.table("users")
        .select("*")
        .eq("email", google_email)
        .execute()
    )

    if user_res.data:
        user = user_res.data[0]
        updates = {}
        if not user.get("name") and google_name:
            updates["name"] = google_name
        if not user.get("avatar_url") and google_avatar:
            updates["avatar_url"] = google_avatar

        if updates:
            update_res = (
                supabase.table("users")
                .update(updates)
                .eq("id", user["id"])
                .execute()
            )
            if update_res.data:
                user = update_res.data[0]
    else:
        # User does not exist: create user record
        uid = None
        try:
            auth_user = supabase.auth.admin.create_user(
                {"email": google_email, "email_confirm": True}
            )
            if auth_user and auth_user.user:
                uid = auth_user.user.id
        except Exception:
            pass

        user_data = {
            "email": google_email,
            "name": google_name,
            "avatar_url": google_avatar,
            "auth_provider": "google",
        }
        if uid:
            user_data["id"] = uid

        new_user_res = (
            supabase.table("users")
            .insert(user_data)
            .execute()
        )
        if not new_user_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account",
            )
        user = new_user_res.data[0]

        try:
            supabase.table("profiles").upsert(
                {
                    "id": user["id"],
                    "phone": user.get("phone_number") or "",
                    "full_name": google_name or "",
                }
            ).execute()
        except Exception:
            pass

    # Issue RailQuick JWT
    access_token = create_access_token(
        data={"sub": str(user["id"]), "email": user["email"]}
    )

    # Check for frontend redirect configuration
    frontend_url = os.getenv("FRONTEND_REDIRECT_URL", FRONTEND_REDIRECT_URL).strip()
    if frontend_url:
        separator = "&" if "?" in frontend_url else "?"
        redirect_target = f"{frontend_url}{separator}token={access_token}"
        return RedirectResponse(url=redirect_target)

    return {
        "success": True,
        "message": "Google authentication successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }
