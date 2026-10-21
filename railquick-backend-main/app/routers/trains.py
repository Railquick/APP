from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.config import supabase
from app.utils.time_utils import check_cutoff_status, ORDER_CUTOFF_BUFFER_MINUTES

router = APIRouter(prefix="/api/v1/trains", tags=["Trains & Routes"])

@router.get("/search")
async def search_train(query: str = Query(..., min_length=2, description="Train number or name")):
    response = supabase.table("trains")\
        .select("train_no, train_name, source_station, destination_station")\
        .or_(f"train_no.ilike.%{query}%,train_name.ilike.%{query}%")\
        .execute()
    
    return {"success": True, "trains": response.data}

@router.get("/{train_no}/servicing-stations")
async def get_servicing_stations(train_no: str, simulated_time: Optional[str] = None):
    stops_res = supabase.table("train_stops")\
        .select("station_code, stop_sequence, arrival_time, departure_time, halt_minutes, stations(name, state, is_serviceable)")\
        .eq("train_no", train_no)\
        .order("stop_sequence")\
        .execute()
    
    if not stops_res.data:
        raise HTTPException(status_code=404, detail="Train route not found")

    stops = stops_res.data

    for stop in stops:
        arr_time = stop.get("arrival_time")
        if arr_time:
            cutoff_info = check_cutoff_status(
                arrival_time_str=arr_time,
                buffer_minutes=ORDER_CUTOFF_BUFFER_MINUTES,
                simulated_current_time=simulated_time,
            )
            stop["is_bookable"] = cutoff_info["is_bookable"]
            stop["cutoff_time"] = cutoff_info["cutoff_time"]
            stop["minutes_remaining"] = cutoff_info["minutes_remaining"]
        else:
            stop["is_bookable"] = False
            stop["cutoff_time"] = None
            stop["minutes_remaining"] = 0

    serviceable_stops = [
        stop for stop in stops 
        if stop.get("stations") and stop["stations"].get("is_serviceable") is True
    ]

    return {
        "success": True,
        "train_no": train_no,
        "total_stops": len(stops),
        "serviceable_stations_count": len(serviceable_stops),
        "serviceable_stations": serviceable_stops,
        "all_stops": stops
    }


@router.get("/pnr-status/{pnr_number}")
async def get_pnr_status(pnr_number: str):
    pnr_clean = pnr_number.strip()
    if not (pnr_clean.isdigit() and len(pnr_clean) == 10):
        raise HTTPException(
            status_code=400,
            detail="Invalid PNR number. Must be a 10-digit numeric code."
        )

    # Use existing train 12424 or mock Prayagraj Express (12417)
    train_res = supabase.table("trains").select("*").eq("train_no", "12424").execute()
    train_data = train_res.data[0] if (train_res.data and len(train_res.data) > 0) else {
        "train_no": "12417",
        "train_name": "Prayagraj Express",
        "source_station": "NDLS",
        "destination_station": "PRYJ"
    }

    last_two = int(pnr_clean[-2:]) if pnr_clean[-2:].isdigit() else 45
    coach_num = (int(pnr_clean[-3]) % 5) + 1 if (len(pnr_clean) >= 3 and pnr_clean[-3].isdigit()) else 2
    coach = f"B{coach_num}"
    berth = str((last_two % 64) + 1)

    return {
        "success": True,
        "pnr": pnr_clean,
        "train_no": train_data.get("train_no", "12417"),
        "train_name": train_data.get("train_name", "Prayagraj Express"),
        "source_station": train_data.get("source_station", "NDLS"),
        "destination_station": train_data.get("destination_station", "PRYJ"),
        "boarding_station": train_data.get("source_station", "NDLS"),
        "coach": coach,
        "berth": berth,
        "status": "CNF",
        "journey_date": "Today"
    } 