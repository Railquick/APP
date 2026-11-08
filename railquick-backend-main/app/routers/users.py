import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config import supabase
from app.utils.auth_utils import get_current_user

logger = logging.getLogger("railquick.users_router")

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


class UserProfileResponse(BaseModel):
    id: str = Field(..., description="Unique user identifier")
    name: Optional[str] = Field(None, description="User full name")
    email: Optional[str] = Field(None, description="User email address")
    phone: Optional[str] = Field(None, description="10-digit mobile contact number")
    avatar_url: Optional[str] = Field(None, description="User profile avatar image URL")
    created_at: Optional[str] = Field(None, description="User creation timestamp ISO string")


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Updated user full name")
    phone: Optional[str] = Field(None, description="Updated 10-digit mobile contact number")


def sanitize_phone_number(phone_raw: Optional[str]) -> Optional[str]:
    """
    Sanitize and validate a phone number string to a 10-digit format.
    Raises HTTPException(400) if phone format is invalid.
    """
    if phone_raw is None:
        return None
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


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> UserProfileResponse:
    """
    Fetch the authenticated user's profile.
    Checks `profiles` and `users` tables. Fallback gracefully to Supabase Auth
    metadata if dedicated profile row is missing, and insert/upsert default profile record.
    """
    user_id = str(current_user["id"])

    # 1. Query Supabase `profiles` table
    profile_row: Optional[Dict[str, Any]] = None
    try:
        prof_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if prof_res.data:
            profile_row = prof_res.data[0]
    except Exception as exc:
        logger.warning("Failed querying profiles table for user %s: %s", user_id, exc)

    # 2. Query Supabase `users` table
    user_row: Optional[Dict[str, Any]] = None
    try:
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        if user_res.data:
            user_row = user_res.data[0]
    except Exception as exc:
        logger.warning("Failed querying users table for user %s: %s", user_id, exc)

    # 3. Fallback: If dedicated profile row is missing, retrieve Supabase Auth metadata and insert/upsert
    auth_email: Optional[str] = current_user.get("email") or (user_row.get("email") if user_row else None)
    auth_name: Optional[str] = current_user.get("name") or (user_row.get("name") if user_row else None)
    auth_phone: Optional[str] = (
        current_user.get("phone")
        or current_user.get("phone_number")
        or (user_row.get("phone_number") or user_row.get("phone") if user_row else None)
    )
    auth_avatar: Optional[str] = current_user.get("avatar_url") or (user_row.get("avatar_url") if user_row else None)
    auth_created_at: Optional[str] = (
        (user_row.get("created_at") if user_row else None) or current_user.get("created_at")
    )

    if not profile_row:
        au = current_user.get("_auth_user")
        if not au:
            try:
                admin_res = supabase.auth.admin.get_user_by_id(user_id)
                if admin_res and getattr(admin_res, "user", None):
                    au = admin_res.user
            except Exception as exc:
                logger.info("Supabase admin auth check skipped for user %s: %s", user_id, exc)

        if au:
            auth_email = getattr(au, "email", None) or auth_email
            auth_phone = getattr(au, "phone", None) or auth_phone
            if getattr(au, "created_at", None):
                auth_created_at = str(au.created_at)

            user_meta = getattr(au, "user_metadata", {}) or {}
            if isinstance(user_meta, dict):
                auth_name = (
                    user_meta.get("full_name")
                    or user_meta.get("name")
                    or auth_name
                )
                auth_avatar = (
                    user_meta.get("avatar_url")
                    or user_meta.get("picture")
                    or auth_avatar
                )

        default_profile: Dict[str, Any] = {"id": user_id}
        if auth_name:
            default_profile["full_name"] = auth_name
            default_profile["name"] = auth_name
        if auth_phone:
            default_profile["phone"] = auth_phone
        if auth_email:
            default_profile["email"] = auth_email
        if auth_avatar:
            default_profile["avatar_url"] = auth_avatar

        try:
            prof_insert = supabase.table("profiles").upsert(default_profile).execute()
            if prof_insert.data:
                profile_row = prof_insert.data[0]
        except Exception:
            try:
                minimal_profile = {
                    "id": user_id,
                    "full_name": auth_name or "",
                    "phone": auth_phone or "",
                }
                prof_insert = supabase.table("profiles").upsert(minimal_profile).execute()
                if prof_insert.data:
                    profile_row = prof_insert.data[0]
            except Exception as e:
                logger.warning("Could not auto-provision profiles row: %s", e)

        # Also sync to users table if missing
        if not user_row:
            default_user: Dict[str, Any] = {
                "id": user_id,
                "email": auth_email,
                "name": auth_name,
                "phone_number": auth_phone,
                "avatar_url": auth_avatar,
            }
            try:
                u_insert = supabase.table("users").upsert(default_user).execute()
                if u_insert.data:
                    user_row = u_insert.data[0]
            except Exception as e:
                logger.warning("Could not auto-provision users row: %s", e)

    # 4. Synthesize unified profile response
    final_name = (
        (profile_row.get("full_name") or profile_row.get("name")) if profile_row else None
    ) or (user_row.get("name") if user_row else None) or current_user.get("name") or auth_name

    final_email = (
        (user_row.get("email") if user_row else None)
        or (profile_row.get("email") if profile_row else None)
        or current_user.get("email")
        or auth_email
    )

    final_phone = (
        (profile_row.get("phone") or profile_row.get("phone_number")) if profile_row else None
    ) or (user_row.get("phone_number") or user_row.get("phone") if user_row else None) or current_user.get("phone") or current_user.get("phone_number") or auth_phone

    final_avatar = (
        (user_row.get("avatar_url") if user_row else None)
        or (profile_row.get("avatar_url") if profile_row else None)
        or current_user.get("avatar_url")
        or auth_avatar
    )

    final_created_at = (
        (profile_row.get("created_at") if profile_row else None)
        or (user_row.get("created_at") if user_row else None)
        or current_user.get("created_at")
        or auth_created_at
    )

    return UserProfileResponse(
        id=user_id,
        name=final_name,
        email=final_email,
        phone=final_phone,
        avatar_url=final_avatar,
        created_at=str(final_created_at) if final_created_at else None,
    )


@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    payload: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> UserProfileResponse:
    """
    Update user profile details (name and/or phone).
    Upserts the updated values into Supabase and returns the updated UserProfileResponse.
    """
    user_id = str(current_user["id"])

    cleaned_name: Optional[str] = payload.name.strip() if payload.name is not None else None
    cleaned_phone: Optional[str] = sanitize_phone_number(payload.phone) if payload.phone is not None else None

    # Prepare payload for Supabase profiles table
    profile_updates: Dict[str, Any] = {"id": user_id}
    if cleaned_name is not None:
        profile_updates["full_name"] = cleaned_name
        profile_updates["name"] = cleaned_name
    if cleaned_phone is not None:
        profile_updates["phone"] = cleaned_phone

    # Prepare payload for Supabase users table
    user_updates: Dict[str, Any] = {"id": user_id}
    if cleaned_name is not None:
        user_updates["name"] = cleaned_name
    if cleaned_phone is not None:
        user_updates["phone_number"] = cleaned_phone

    # Upsert into profiles
    try:
        supabase.table("profiles").upsert(profile_updates).execute()
    except Exception as exc:
        logger.warning("Error upserting into profiles table: %s. Retrying minimal schema...", exc)
        safe_profile: Dict[str, Any] = {"id": user_id}
        if cleaned_name is not None:
            safe_profile["full_name"] = cleaned_name
        if cleaned_phone is not None:
            safe_profile["phone"] = cleaned_phone
        try:
            supabase.table("profiles").upsert(safe_profile).execute()
        except Exception as e2:
            logger.error("Failed fallback upsert to profiles: %s", e2)

    # Upsert into users table
    try:
        supabase.table("users").upsert(user_updates).execute()
    except Exception as exc:
        logger.warning("Error upserting into users table: %s", exc)

    # Return the refreshed user profile response
    return await get_my_profile(current_user=current_user)
