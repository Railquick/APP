import base64
import hashlib
import json
import logging
import re
import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
import httpx
from pydantic import BaseModel, Field

from app import config as settings
from app.config import (
    PHONEPE_ALT_SANDBOX_BASE_URL,
    PHONEPE_BASE_URL,
    PHONEPE_CALLBACK_URL,
    PHONEPE_ENV,
    PHONEPE_MERCHANT_ID,
    PHONEPE_PROD_BASE_URL,
    PHONEPE_SALT_INDEX,
    PHONEPE_SALT_KEY,
    PHONEPE_UAT_BASE_URL,
    supabase,
)
from app.utils.auth_utils import get_current_user

logger = logging.getLogger("railquick.payments_router")

router = APIRouter(prefix="/api/v1/payments", tags=["Payments"])


class InitiatePhonePeRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Order amount in INR (e.g., 189.00)")
    order_id: str = Field(..., description="RailQuick internal order identifier")
    redirect_url: str = Field(
        ..., description="Frontend URL to redirect the user after payment"
    )


class InitiatePhonePeResponse(BaseModel):
    success: bool
    payment_url: str
    merchant_transaction_id: str
    message: Optional[str] = "PhonePe payment initiated successfully"
    data: Optional[Dict[str, Any]] = None


def normalize_salt_key(key: str) -> str:
    """
    Ensure the salt key is in plain-text format.
    If the key is base64-encoded UUID, decodes it to standard 36-char UUID.
    """
    cleaned = key.strip()
    if "-" not in cleaned and len(cleaned) in (44, 48):
        try:
            decoded = base64.b64decode(cleaned).decode("utf-8")
            if re.match(
                r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
                decoded,
            ):
                return decoded
        except Exception:
            pass
    return cleaned


def calculate_phonepe_checksum(
    path_or_endpoint: str,
    base64_payload: str = "",
    salt_key: Optional[str] = None,
    salt_index: Optional[str] = None,
) -> str:
    """
    Calculate the standard SHA256 checksum required by PhonePe.
    Format: SHA256(base64_payload + endpoint + salt_key) + "###" + salt_index
    For callbacks: SHA256(base64_response + salt_key) + "###" + salt_index
    For status: SHA256(status_path + salt_key) + "###" + salt_index
    """
    key = normalize_salt_key(salt_key or settings.PHONEPE_SALT_KEY)
    index = (salt_index or settings.PHONEPE_SALT_INDEX).strip()
    endpoint = path_or_endpoint.strip() if path_or_endpoint else ""
    raw_str = f"{base64_payload}{endpoint}{key}"
    hashed = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()
    return f"{hashed}###{index}"


def parse_order_id_from_txn(merchant_transaction_id: str) -> str:
    """
    Extract order_id from merchant_transaction_id format: RQ_{order_id}_{timestamp}
    """
    if merchant_transaction_id.startswith("RQ_"):
        parts = merchant_transaction_id.split("_")
        if len(parts) >= 3:
            # Join middle parts in case order_id had underscores
            return "_".join(parts[1:-1])
        elif len(parts) == 2:
            return parts[1]
    return merchant_transaction_id


@router.post("/initiate-phonepe", response_model=InitiatePhonePeResponse)
async def initiate_phonepe_payment(
    payload: InitiatePhonePeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> InitiatePhonePeResponse:
    """
    Initiate a PhonePe Standard Checkout session for an authenticated passenger.
    Encodes standard payment payload, generates X-VERIFY checksum, and calls PhonePe /pg/v1/pay.
    """
    if not PHONEPE_MERCHANT_ID or not PHONEPE_SALT_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PhonePe merchant credentials are not configured on server",
        )

    # 1. Convert amount to Paise (e.g., 189.00 INR -> 18900 Paise)
    amount_in_paise = int(round(payload.amount * 100))
    if amount_in_paise <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than zero",
        )

    # 2. Construct unique merchantTransactionId (alphanumeric, hyphens, underscores, <= 38 chars)
    sanitized_order_id = re.sub(r"[^a-zA-Z0-9-]", "", payload.order_id)[:16]
    timestamp_suffix = int(time.time())
    merchant_transaction_id = f"RQ_{sanitized_order_id}_{timestamp_suffix}"[:38]

    # 3. Construct PhonePe standard request payload
    phonepe_payload = {
        "merchantId": PHONEPE_MERCHANT_ID,
        "merchantTransactionId": merchant_transaction_id,
        "merchantUserId": str(current_user["id"])[:36],
        "amount": amount_in_paise,
        "redirectUrl": payload.redirect_url,
        "redirectMode": "REDIRECT",
        "callbackUrl": PHONEPE_CALLBACK_URL,
        "paymentInstrument": {"type": "PAY_PAGE"},
    }

    # 4. Base64 encode the JSON payload
    payload_json = json.dumps(phonepe_payload, separators=(",", ":"))
    base64_payload = base64.b64encode(payload_json.encode("utf-8")).decode("utf-8")

    # 5. Compute X-VERIFY checksum: SHA256(base64_payload + "/pg/v1/pay" + salt_key) + "###" + salt_index
    endpoint_path = "/pg/v1/pay"
    x_verify = calculate_phonepe_checksum(endpoint_path, base64_payload)

    # 6. Make async HTTP POST to PhonePe API
    request_url = f"{settings.PHONEPE_BASE_URL.rstrip('/')}/pg/v1/pay"
    headers = {
        "Content-Type": "application/json",
        "X-VERIFY": x_verify,
        "Accept": "application/json",
    }
    body = {"request": base64_payload}

    logger.info(
        "Calling PhonePe initiate: Target URL=%s | Headers=%s",
        request_url,
        headers,
    )

    fallback_candidates: List[str] = [
        f"{settings.PHONEPE_ALT_SANDBOX_BASE_URL.rstrip('/')}/pg/v1/pay",
        f"{settings.PHONEPE_UAT_BASE_URL.rstrip('/')}/pg/v1/pay",
        f"{settings.PHONEPE_PROD_BASE_URL.rstrip('/')}/pg/v1/pay",
    ]

    async with httpx.AsyncClient(timeout=15.0) as http_client:
        try:
            response = await http_client.post(request_url, json=body, headers=headers)
        except Exception as exc:
            logger.error("Network error connecting to PhonePe API (%s): %s", request_url, exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Unable to connect to PhonePe gateway: {str(exc)}",
            )

        # 404 Fallback: if PhonePe Hermes returns 404, check fallback endpoints
        if response.status_code == 404:
            logger.warning(
                "PhonePe initiate returned status 404 from %s: %s. Attempting fallback endpoints...",
                request_url,
                response.text,
            )
            for fb_target in fallback_candidates:
                if fb_target == request_url:
                    continue
                logger.info(
                    "Calling PhonePe fallback: Target URL=%s | Headers=%s",
                    fb_target,
                    headers,
                )
                try:
                    fb_response = await http_client.post(fb_target, json=body, headers=headers)
                    logger.info(
                        "PhonePe fallback (%s) returned status %d: %s",
                        fb_target,
                        fb_response.status_code,
                        fb_response.text,
                    )
                    if fb_response.status_code == 200:
                        logger.info("PhonePe fallback succeeded using %s", fb_target)
                        response = fb_response
                        break
                    elif fb_response.status_code != 404:
                        response = fb_response
                        break
                except Exception as fb_exc:
                    logger.error("Error during fallback request to %s: %s", fb_target, fb_exc)

    if response.status_code != 200:
        logger.error(
            "PhonePe initiate returned status %d: %s",
            response.status_code,
            response.text,
        )
        try:
            err_data = response.json()
            err_msg = err_data.get("message") or f"PhonePe API error ({response.status_code})"
        except Exception:
            err_msg = f"PhonePe API returned HTTP status {response.status_code}"
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=err_msg,
        )

    resp_json = response.json()
    if not resp_json.get("success"):
        logger.error("PhonePe returned failure: %s", resp_json)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=resp_json.get("message") or "PhonePe payment initiation failed",
        )

    # 7. Extract redirect payment URL
    instrument_resp = (
        resp_json.get("data", {}).get("instrumentResponse", {}) or {}
    )
    redirect_info = instrument_resp.get("redirectInfo", {}) or {}
    payment_url = redirect_info.get("url")

    if not payment_url:
        logger.error("No redirect URL in PhonePe response: %s", resp_json)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="PhonePe did not provide a valid payment gateway URL",
        )

    return InitiatePhonePeResponse(
        success=True,
        payment_url=payment_url,
        merchant_transaction_id=merchant_transaction_id,
        message=resp_json.get("message", "Payment initiated successfully"),
        data=resp_json.get("data"),
    )


@router.post("/phonepe-callback")
async def phonepe_callback(
    request: Request,
    x_verify: Optional[str] = Header(None, alias="X-VERIFY"),
) -> Dict[str, Any]:
    """
    PhonePe server-to-server webhook callback endpoint.
    Verifies incoming X-VERIFY signature, decodes response base64 payload,
    and updates order status in Supabase `orders` table to PAID / CONFIRMED on success.
    """
    raw_body = await request.body()
    body_str = raw_body.decode("utf-8", errors="replace")

    response_base64: Optional[str] = None

    # Parse response parameter from JSON or URL-encoded form data
    try:
        json_body = json.loads(body_str)
        if isinstance(json_body, dict):
            response_base64 = json_body.get("response")
    except Exception:
        pass

    if not response_base64:
        try:
            form_data = await request.form()
            response_base64 = form_data.get("response")  # type: ignore
        except Exception:
            pass

    if not response_base64:
        logger.warning("PhonePe callback missing 'response' payload in body")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'response' parameter in callback payload",
        )

    # Verify X-VERIFY checksum: SHA256(response_base64 + salt_key) + "###" + salt_index
    if x_verify:
        expected_checksum = calculate_phonepe_checksum("", response_base64)
        if x_verify.strip() != expected_checksum.strip():
            logger.error(
                "Invalid PhonePe callback checksum. Received: %s, Expected: %s",
                x_verify,
                expected_checksum,
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid callback checksum signature",
            )
    else:
        logger.warning("PhonePe callback received without X-VERIFY header")

    # Decode Base64 response
    try:
        decoded_bytes = base64.b64decode(response_base64)
        callback_payload = json.loads(decoded_bytes.decode("utf-8"))
    except Exception as exc:
        logger.error("Failed to decode PhonePe callback base64 response: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed base64 response in callback",
        )

    code = callback_payload.get("code")
    is_success = callback_payload.get("success") is True and code == "PAYMENT_SUCCESS"
    data = callback_payload.get("data", {}) or {}

    merchant_transaction_id = data.get("merchantTransactionId", "")
    phonepe_transaction_id = data.get("transactionId", "")
    order_id = parse_order_id_from_txn(merchant_transaction_id)

    logger.info(
        "PhonePe callback received: code=%s, order_id=%s, txn=%s, success=%s",
        code,
        order_id,
        phonepe_transaction_id,
        is_success,
    )

    # On SUCCESS: Update order in Supabase
    if is_success and order_id:
        update_data = {
            "payment_status": "PAID",
            "delivery_status": "CONFIRMED",
            "payment_method": "PHONEPE",
        }
        try:
            # Update Supabase orders table
            supabase.table("orders").update(update_data).eq("id", order_id).execute()
            logger.info("Successfully marked order %s as PAID/CONFIRMED", order_id)
        except Exception as exc:
            logger.error("Error updating order %s in Supabase: %s", order_id, exc)

    return {
        "success": True,
        "message": "Callback processed successfully",
        "order_id": order_id,
        "code": code,
        "status": "PAID" if is_success else "PENDING",
    }


@router.get("/status/{merchant_transaction_id}")
async def check_phonepe_payment_status(
    merchant_transaction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Check the live status of a payment directly with PhonePe server.
    Formula: SHA256('/pg/v1/status/{merchantId}/{merchantTransactionId}' + salt_key) + '###' + salt_index
    """
    if not PHONEPE_MERCHANT_ID or not PHONEPE_SALT_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PhonePe merchant credentials not configured",
        )

    status_path = f"/pg/v1/status/{PHONEPE_MERCHANT_ID}/{merchant_transaction_id}"
    x_verify = calculate_phonepe_checksum(status_path, "")

    request_url = f"{settings.PHONEPE_BASE_URL.rstrip('/')}{status_path}"
    headers = {
        "Content-Type": "application/json",
        "X-VERIFY": x_verify,
        "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
        "Accept": "application/json",
    }

    logger.info(
        "Calling PhonePe status check: Target URL=%s | Headers=%s",
        request_url,
        headers,
    )

    status_fallback_candidates: List[str] = [
        f"{settings.PHONEPE_ALT_SANDBOX_BASE_URL.rstrip('/')}{status_path}",
        f"{settings.PHONEPE_UAT_BASE_URL.rstrip('/')}{status_path}",
        f"{settings.PHONEPE_PROD_BASE_URL.rstrip('/')}{status_path}",
    ]

    async with httpx.AsyncClient(timeout=10.0) as http_client:
        try:
            response = await http_client.get(request_url, headers=headers)
        except Exception as exc:
            logger.error("Error checking PhonePe status (%s): %s", request_url, exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Error querying PhonePe status: {str(exc)}",
            )

        if response.status_code == 404:
            logger.warning(
                "PhonePe status check returned 404 from %s: %s. Attempting fallback endpoints...",
                request_url,
                response.text,
            )
            for fb_target in status_fallback_candidates:
                if fb_target == request_url:
                    continue
                logger.info(
                    "Calling PhonePe status fallback: Target URL=%s | Headers=%s",
                    fb_target,
                    headers,
                )
                try:
                    fb_response = await http_client.get(fb_target, headers=headers)
                    if fb_response.status_code == 200 or fb_response.status_code != 404:
                        response = fb_response
                        break
                except Exception as fb_exc:
                    logger.error("Error during status fallback to %s: %s", fb_target, fb_exc)

        try:
            resp_json = response.json()
        except Exception:
            resp_json = {"code": "ERROR", "message": response.text}

    # If completed, sync to Supabase order
    if resp_json.get("code") == "PAYMENT_SUCCESS":
        order_id = parse_order_id_from_txn(merchant_transaction_id)
        try:
            supabase.table("orders").update(
                {"payment_status": "PAID", "delivery_status": "CONFIRMED"}
            ).eq("id", order_id).execute()
        except Exception as e:
            logger.warning("Could not sync order status in Supabase: %s", e)

    return resp_json
