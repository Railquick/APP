from fastapi import APIRouter
from app.config import supabase

router = APIRouter(prefix="/api/v1/catalog", tags=["Station Catalog"])

@router.get("/{station_code}")
async def get_station_catalog(station_code: str):
    station_code_upper = station_code.upper()
    
    response = supabase.table("station_inventory")\
        .select("price, stock_quantity, is_available, products(id, title, category, image_url)")\
        .eq("station_code", station_code_upper)\
        .eq("is_available", True)\
        .gt("stock_quantity", 0)\
        .execute()

    if not response.data:
        return {
            "success": True,
            "station_code": station_code_upper,
            "message": "No active products available at this station hub",
            "products": []
        }

    formatted_products = []
    for item in response.data:
        prod = item.get("products")
        if prod:
            formatted_products.append({
                "product_id": prod["id"],
                "title": prod["title"],
                "category": prod["category"],
                "image_url": prod["image_url"],
                "price": item["price"],
                "stock": item["stock_quantity"]
            })

    return {
        "success": True,
        "station_code": station_code_upper,
        "total_items": len(formatted_products),
        "products": formatted_products
    } 