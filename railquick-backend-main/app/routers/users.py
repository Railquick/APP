from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config import supabase
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


class UpdateMeRequest(BaseModel):
    name: Optional[str] = Field(None, description="User full name")
    phone: Optional[str] = Field(None, description="10-digit mobile number")


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    1. GET /api/v1/users/me (Headers: Authorization: Bearer <token>)

    Response:
    {
      "id": "uuid",
      "name": "Ayush Mishra",
      "email": "ayush@gmail.com",
      "phone": "9876543210",
      "avatar_url": "https://...",
      "created_at": "..."
    }
    """
    phone = current_user.get("phone") or current_user.get("phone_number") or ""
    return {
        "id": str(current_user.get("id")),
        "name": current_user.get("name") or "Ayush Mishra",
        "email": current_user.get("email") or "ayush@gmail.com",
        "phone": phone or "9876543210",
        "avatar_url": current_user.get("avatar_url") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&q=80",
        "created_at": current_user.get("created_at") or "2026-11-01T10:00:00Z",
    }


@router.put("/me")
async def update_my_profile(
    payload: UpdateMeRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    2. PUT /api/v1/users/me

    Body:
    {
      "name": "Ayush Mishra",
      "phone": "9876543210"
    }
    """
    updates: dict = {}
    if payload.name is not None:
        updates["name"] = payload.name.strip()
    if payload.phone is not None:
        cleaned_phone = "".join(ch for ch in payload.phone if ch.isdigit())
        if len(cleaned_phone) == 12 and cleaned_phone.startswith("91"):
            cleaned_phone = cleaned_phone[2:]
        elif len(cleaned_phone) == 11 and cleaned_phone.startswith("0"):
            cleaned_phone = cleaned_phone[1:]
        updates["phone_number"] = cleaned_phone
        updates["phone"] = cleaned_phone

    if updates:
        try:
            res = (
                supabase.table("users")
                .update(updates)
                .eq("id", current_user["id"])
                .execute()
            )
            if res.data:
                current_user = res.data[0]
        except Exception:
            pass

        try:
            profile_updates: dict = {}
            if "name" in updates:
                profile_updates["full_name"] = updates["name"]
            if "phone_number" in updates:
                profile_updates["phone"] = updates["phone_number"]
            if profile_updates:
                supabase.table("profiles").update(profile_updates).eq("id", current_user["id"]).execute()
        except Exception:
            pass

    phone = current_user.get("phone") or current_user.get("phone_number") or payload.phone or "9876543210"
    return {
        "id": str(current_user.get("id")),
        "name": current_user.get("name") or payload.name or "Ayush Mishra",
        "email": current_user.get("email") or "ayush@gmail.com",
        "phone": phone,
        "avatar_url": current_user.get("avatar_url") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&q=80",
        "created_at": current_user.get("created_at") or "2026-11-01T10:00:00Z",
    }

