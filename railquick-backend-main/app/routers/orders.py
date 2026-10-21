import random
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config import supabase
from app.utils.auth_utils import get_optional_current_user
from app.utils.time_utils import check_cutoff_status, ORDER_CUTOFF_BUFFER_MINUTES

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


class OrderCreateRequest(BaseModel):
    user_id: Optional[str] = None
    train_no: str
    station_code: str
    coach: str
    seat_no: str
    items: List[OrderItemCreate]
    simulated_time: Optional[str] = None


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

    # Query train_stops for scheduled arrival_time at the target station
    stop_res = (
        supabase.table("train_stops")
        .select("arrival_time")
        .eq("train_no", payload.train_no)
        .eq("station_code", station_code)
        .execute()
    )

    if not stop_res.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Train {payload.train_no} does not service station {station_code}",
        )

    arrival_time = stop_res.data[0].get("arrival_time")
    if not arrival_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Arrival time not scheduled for train {payload.train_no} at {station_code}",
        )

    # Check cutoff window status
    cutoff_info = check_cutoff_status(
        arrival_time_str=arrival_time,
        buffer_minutes=ORDER_CUTOFF_BUFFER_MINUTES,
        simulated_current_time=payload.simulated_time,
    )

    if not cutoff_info["is_bookable"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order window closed: Train arrival is within the 30-minute cutoff buffer.",
        )

    # Validate UUID format for all product IDs
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

    # Query station_inventory for the provided station_code and product IDs
    product_ids = list(requested_quantities.keys())
    inventory_res = (
        supabase.table("station_inventory")
        .select("station_code, product_id, stock_quantity, price, is_available")
        .eq("station_code", station_code)
        .in_("product_id", product_ids)
        .execute()
    )

    inventory_items = inventory_res.data or []
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
    if not effective_user_id and current_user:
        effective_user_id = str(current_user["id"])

    # Insert into orders table
    order_data = {
        "user_id": effective_user_id,
        "train_no": payload.train_no,
        "station_code": station_code,
        "coach": payload.coach,
        "seat_no": payload.seat_no,
        "total_amount": total_amount,
        "payment_status": "PENDING",
        "delivery_status": "PLACED",
        "delivery_otp": delivery_otp,
    }

    try:
        order_insert_res = supabase.table("orders").insert(order_data).execute()
    except Exception as e:
        if "orders_user_id_fkey" in str(e):
            order_data["user_id"] = None
            order_insert_res = supabase.table("orders").insert(order_data).execute()
        else:
            raise

    if not order_insert_res.data:
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
        "items": items_insert_res.data or order_items_to_insert,
    }


@router.post("/{order_id}/verify-delivery")
async def verify_delivery(order_id: str, payload: VerifyDeliveryRequest):
    # Validate UUID format
    try:
        uuid.UUID(str(order_id))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Fetch order by order_id
    order_res = supabase.table("orders").select("*").eq("id", order_id).execute()
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
    ).eq("id", order_id).execute()

    return {
        "success": True,
        "order_id": order_id,
        "status": "DELIVERED",
        "message": "Order delivered successfully",
    }
