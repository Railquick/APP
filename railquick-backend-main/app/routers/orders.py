from datetime import datetime
import logging
import random
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from app.config import supabase
from app.utils.auth_utils import get_optional_current_user
from app.utils.time_utils import (
    evaluate_station_delivery_eligibility,
    IST_TIMEZONE,
    MIN_STATION_HALT_MINUTES,
    ORDER_CUTOFF_BUFFER_MINUTES,
)

logger = logging.getLogger("railquick.orders_router")

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

MAX_ACTIVE_ORDERS = 5
ACTIVE_ORDER_STATUSES = ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"]
ALLOWED_DELIVERY_STATUSES = {
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
}


def _parse_simulated_now(simulated_time: Optional[str]) -> Optional[datetime]:
    """Helper to parse simulated_time into a timezone-aware IST datetime."""
    if not simulated_time or not isinstance(simulated_time, str) or not simulated_time.strip():
        return None
    clean = simulated_time.strip()
    try:
        dt = datetime.fromisoformat(clean)
        return dt.replace(tzinfo=IST_TIMEZONE) if dt.tzinfo is None else dt.astimezone(IST_TIMEZONE)
    except Exception:
        pass

    if ":" in clean:
        parts = clean.split(":")
        try:
            now_ist = datetime.now(IST_TIMEZONE)
            return datetime(
                now_ist.year,
                now_ist.month,
                now_ist.day,
                int(parts[0]),
                int(parts[1]),
                0,
                tzinfo=IST_TIMEZONE,
            )
        except (ValueError, IndexError):
            pass
    return None


def _fallback_insert_orders(order_data: dict, error: Exception):
    """Fallback helper to strip newly added columns if remote database table is not yet migrated."""
    err_str = str(error)
    known_new_fields = ["passenger_name", "passenger_phone", "pnr", "payment_method"]
    if any(f in err_str for f in known_new_fields) or "PGRST204" in err_str:
        logger.warning(f"Remote orders schema missing columns, inserting legacy subset: {err_str}")
        trimmed_data = {k: v for k, v in order_data.items() if k not in known_new_fields}
        return supabase.table("orders").insert(trimmed_data).execute()
    raise error


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


class OrderCreateRequest(BaseModel):
    user_id: Optional[str] = None
    train_no: str
    station_code: str
    coach: str
    seat_no: str
    passenger_name: str = "Passenger"
    passenger_phone: str = Field(..., description="10-digit mobile number")
    pnr: Optional[str] = None
    payment_method: str = "PAY_ON_DELIVERY"
    items: List[OrderItemCreate]
    simulated_time: Optional[str] = None

    @field_validator("passenger_phone")
    @classmethod
    def validate_passenger_phone(cls, v: str) -> str:
        if not v or not isinstance(v, str):
            raise ValueError("passenger_phone is required")
        digits = "".join(ch for ch in v.strip() if ch.isdigit())
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        elif len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]
        if len(digits) != 10:
            raise ValueError("passenger_phone must be a valid 10-digit mobile number")
        return digits


class OrderStatusUpdateRequest(BaseModel):
    delivery_status: str = Field(
        ...,
        description="Target delivery status (PLACED, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)",
    )


class VerifyDeliveryRequest(BaseModel):
    otp: str


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreateRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
):
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    station_code = payload.station_code.strip().upper()

    # 1. NZM Hub Capacity / Concurrency Limit Check
    if station_code == "NZM":
        try:
            active_orders_res = (
                supabase.table("orders")
                .select("id")
                .eq("station_code", "NZM")
                .in_("delivery_status", ACTIVE_ORDER_STATUSES)
                .execute()
            )
            active_count = len(active_orders_res.data) if active_orders_res.data else 0
            if active_count >= MAX_ACTIVE_ORDERS:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Hazrat Nizamuddin delivery runners are currently at full capacity. Please retry in 5 minutes.",
                )
        except HTTPException:
            raise
        except Exception as exc:
            logger.warning(f"Error checking NZM capacity against Supabase: {exc}")

    # 2. Delivery Eligibility & 20-Min Buffer Check
    stop_data = None
    try:
        stop_res = (
            supabase.table("train_stops")
            .select("arrival_time, departure_time, halt_minutes, day_offset, stations(name, state, is_serviceable)")
            .eq("train_no", payload.train_no.strip())
            .eq("station_code", station_code)
            .execute()
        )
        if stop_res.data:
            stop_data = stop_res.data[0]
    except Exception as exc:
        logger.warning(f"Error querying train_stops for train {payload.train_no} at {station_code}: {exc}")

    # Fallback for demo trains if Supabase is offline / not seeded
    if not stop_data:
        if payload.train_no.strip() in ("12417", "12424"):
            demo_stops = {
                ("12417", "NDLS"): {"arrival_time": None, "departure_time": "22:10", "halt_minutes": 0, "day_offset": 1},
                ("12417", "ALJN"): {"arrival_time": "23:55", "departure_time": "23:57", "halt_minutes": 2, "day_offset": 1},
                ("12417", "CNB"): {"arrival_time": "05:25", "departure_time": "05:30", "halt_minutes": 5, "day_offset": 2},
                ("12417", "PRYJ"): {"arrival_time": "07:00", "departure_time": None, "halt_minutes": 0, "day_offset": 2},
                ("12424", "NZM"): {"arrival_time": "16:30", "departure_time": "16:35", "halt_minutes": 5, "day_offset": 1},
            }
            stop_data = demo_stops.get((payload.train_no.strip(), station_code))

    if not stop_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Train {payload.train_no} does not service station {station_code}",
        )

    scheduled_arrival = stop_data.get("arrival_time")
    scheduled_departure = stop_data.get("departure_time")
    halt_minutes = int(stop_data.get("halt_minutes") or 0)
    day_offset = int(stop_data.get("day_offset") or 1)

    station_info = stop_data.get("stations")
    is_serviceable = True
    if isinstance(station_info, dict):
        is_serviceable = station_info.get("is_serviceable", True)
    elif station_code in ("NZM", "NDLS"):
        is_serviceable = True

    sim_now = _parse_simulated_now(payload.simulated_time)
    eligibility = evaluate_station_delivery_eligibility(
        scheduled_arrival=scheduled_arrival,
        scheduled_departure=scheduled_departure,
        halt_minutes=halt_minutes,
        delay_minutes=0,
        day_offset=day_offset,
        is_serviceable=is_serviceable,
        journey_date_str=None,
        simulated_now=sim_now,
    )

    if not eligibility.get("is_eligible"):
        reason = (
            eligibility.get("reason")
            or eligibility.get("eligibility_reason")
            or "Delivery cutoff passed for this station"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason,
        )

    # 3. Validate UUID format for all product IDs
    for item in payload.items:
        try:
            uuid.UUID(str(item.product_id))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid UUID format for product_id: {item.product_id}",
            )

    # Aggregate quantities for duplicate product_ids in the request
    requested_quantities = {}
    for item in payload.items:
        requested_quantities[item.product_id] = (
            requested_quantities.get(item.product_id, 0) + item.quantity
        )

    # 4. Query station_inventory for the provided station_code and product IDs
    product_ids = list(requested_quantities.keys())
    inventory_items = []
    try:
        inventory_res = (
            supabase.table("station_inventory")
            .select("station_code, product_id, stock_quantity, price, is_available")
            .eq("station_code", station_code)
            .in_("product_id", product_ids)
            .execute()
        )
        inventory_items = inventory_res.data or []
    except Exception as exc:
        logger.warning(f"Error querying station_inventory: {exc}")

    inventory_map = {item["product_id"]: item for item in inventory_items}

    # Validate that all requested items exist, are available, and have sufficient stock
    for product_id, requested_qty in requested_quantities.items():
        if product_id not in inventory_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product_id} is not available at station {station_code}",
            )

        inv_item = inventory_map[product_id]
        if not inv_item.get("is_available"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product_id} is currently marked unavailable",
            )

        if inv_item.get("stock_quantity", 0) < requested_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product {product_id}. "
                    f"Available: {inv_item.get('stock_quantity', 0)}, requested: {requested_qty}"
                ),
            )

    # Calculate total_amount directly from database prices
    total_amount = sum(
        float(inventory_map[item.product_id]["price"]) * item.quantity
        for item in payload.items
    )
    total_amount = round(total_amount, 2)

    # Generate a 4-digit random string for delivery_otp
    delivery_otp = f"{random.randint(1000, 9999)}"

    # Determine effective user_id (from payload or authenticated context)
    effective_user_id = payload.user_id
    if not effective_user_id and current_user and isinstance(current_user, dict):
        effective_user_id = str(current_user.get("id"))

    # 5. Insert into orders table with passenger details & payment method
    order_data = {
        "user_id": effective_user_id,
        "train_no": payload.train_no.strip(),
        "station_code": station_code,
        "coach": payload.coach.strip().upper(),
        "seat_no": payload.seat_no.strip(),
        "passenger_name": payload.passenger_name.strip() if payload.passenger_name else "Passenger",
        "passenger_phone": payload.passenger_phone.strip(),
        "pnr": payload.pnr.strip() if payload.pnr else None,
        "payment_method": payload.payment_method.strip(),
        "total_amount": total_amount,
        "payment_status": "PENDING",
        "delivery_status": "PLACED",
        "delivery_otp": delivery_otp,
    }

    try:
        order_insert_res = supabase.table("orders").insert(order_data).execute()
    except Exception as e:
        err_msg = str(e)
        if "orders_user_id_fkey" in err_msg:
            order_data["user_id"] = None
            try:
                order_insert_res = supabase.table("orders").insert(order_data).execute()
            except Exception as e2:
                order_insert_res = _fallback_insert_orders(order_data, e2)
        else:
            order_insert_res = _fallback_insert_orders(order_data, e)

    if not order_insert_res or not order_insert_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order record",
        )

    order_record = order_insert_res.data[0]
    order_id = order_record["id"]

    # Insert all items into order_items table
    order_items_to_insert = [
        {
            "order_id": order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price_at_purchase": float(inventory_map[item.product_id]["price"]),
        }
        for item in payload.items
    ]

    items_insert_res = (
        supabase.table("order_items").insert(order_items_to_insert).execute()
    )

    # Decrement stock_quantity in station_inventory
    for product_id, qty in requested_quantities.items():
        new_stock = inventory_map[product_id]["stock_quantity"] - qty
        supabase.table("station_inventory").update(
            {"stock_quantity": new_stock}
        ).eq("station_code", station_code).eq("product_id", product_id).execute()

    return {
        "success": True,
        "order_id": order_id,
        "delivery_otp": delivery_otp,
        "total_amount": total_amount,
        "status": order_record.get("delivery_status", "PLACED"),
        "passenger_name": payload.passenger_name,
        "passenger_phone": payload.passenger_phone,
        "payment_method": payload.payment_method,
        "items": items_insert_res.data or order_items_to_insert,
    }


@router.get("/active/nzm")
async def get_active_nzm_orders() -> Dict[str, Any]:
    """
    Get all active orders for Hazrat Nizamuddin (NZM) hub.
    Used by station operations, vendors, and platform delivery runners.
    Active statuses: PLACED, CONFIRMED, PREPARING, OUT_FOR_DELIVERY.
    """
    orders = []
    try:
        res = (
            supabase.table("orders")
            .select("*")
            .eq("station_code", "NZM")
            .in_("delivery_status", ACTIVE_ORDER_STATUSES)
            .order("created_at", desc=True)
            .execute()
        )
        orders = res.data or []
    except Exception as exc:
        logger.warning(f"Error fetching active NZM orders: {exc}")
        orders = []

    return {
        "success": True,
        "station_code": "NZM",
        "active_statuses": ACTIVE_ORDER_STATUSES,
        "count": len(orders),
        "orders": orders,
    }


@router.get("/{order_id}")
async def get_order_by_id(order_id: str) -> Dict[str, Any]:
    """
    Fetch comprehensive order details by order_id.
    Returns passenger details, items, delivery OTP, and statuses.
    """
    clean_id = order_id.strip()
    try:
        uuid.UUID(clean_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found (invalid order ID format)",
        )

    order_res = supabase.table("orders").select("*").eq("id", clean_id).execute()
    if not order_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order = order_res.data[0]

    # Fetch associated items
    items = []
    try:
        items_res = (
            supabase.table("order_items")
            .select("id, product_id, quantity, price_at_purchase, products(title, category, image_url)")
            .eq("order_id", clean_id)
            .execute()
        )
        items = items_res.data or []
    except Exception as exc:
        logger.warning(f"Error fetching order_items for order {clean_id}: {exc}")

    # Format items cleanly
    formatted_items = []
    for item in items:
        prod = item.get("products") or {}
        formatted_items.append({
            "item_id": item.get("id"),
            "product_id": item.get("product_id"),
            "title": prod.get("title") or "Essential Item",
            "category": prod.get("category"),
            "image_url": prod.get("image_url"),
            "quantity": item.get("quantity"),
            "price": item.get("price_at_purchase"),
        })

    order_details = dict(order)
    order_details["items"] = formatted_items if formatted_items else items

    return {
        "success": True,
        "order": order_details,
    }


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdateRequest,
) -> Dict[str, Any]:
    """
    Update delivery status for an order.
    Allows station vendor/runner to transition order through lifecycle:
    PLACED -> CONFIRMED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED (or CANCELLED).
    """
    clean_id = order_id.strip()
    try:
        uuid.UUID(clean_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found (invalid order ID format)",
        )

    target_status = payload.delivery_status.strip().upper()
    if target_status not in ALLOWED_DELIVERY_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid status '{payload.delivery_status}'. "
                f"Allowed values are: {', '.join(sorted(ALLOWED_DELIVERY_STATUSES))}"
            ),
        )

    # Check order exists
    order_res = supabase.table("orders").select("id, delivery_status").eq("id", clean_id).execute()
    if not order_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    current_status = order_res.data[0].get("delivery_status")

    # If already delivered or cancelled, disallow invalid transitions
    if current_status == "DELIVERED" and target_status != "DELIVERED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change status of an already delivered order",
        )

    # Perform update
    supabase.table("orders").update(
        {"delivery_status": target_status}
    ).eq("id", clean_id).execute()

    return {
        "success": True,
        "order_id": clean_id,
        "previous_status": current_status,
        "delivery_status": target_status,
        "message": f"Order status updated to {target_status}",
    }


@router.post("/{order_id}/verify-delivery")
async def verify_delivery(order_id: str, payload: VerifyDeliveryRequest):
    # Validate UUID format
    clean_id = order_id.strip()
    try:
        uuid.UUID(clean_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Fetch order by order_id
    order_res = supabase.table("orders").select("*").eq("id", clean_id).execute()
    if not order_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order = order_res.data[0]

    # Check if delivery_status is already DELIVERED
    if order.get("delivery_status") == "DELIVERED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order already delivered",
        )

    # Check if provided OTP matches delivery_otp
    if str(order.get("delivery_otp")).strip() != str(payload.otp).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )

    # Update order delivery_status to DELIVERED
    supabase.table("orders").update(
        {"delivery_status": "DELIVERED"}
    ).eq("id", clean_id).execute()

    return {
        "success": True,
        "order_id": clean_id,
        "status": "DELIVERED",
        "message": "Order delivered successfully",
    }
