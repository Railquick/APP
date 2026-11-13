from datetime import datetime
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.config import supabase
from app.utils.time_utils import (
    evaluate_station_delivery_eligibility,
    check_cutoff_status,
    ORDER_CUTOFF_BUFFER_MINUTES,
    IST_TIMEZONE,
)
from app.utils.railway_client import railway_client, get_pnr_live_status

logger = logging.getLogger("railquick.trains_router")

router = APIRouter(prefix="/api/v1/trains", tags=["Trains & Routes"])


@router.get("/search")
async def search_train(
    query: str = Query(..., min_length=2, description="Train number or name")
) -> Dict[str, Any]:
    """
    Search trains by train number or name.
    Queries Supabase trains table; handles empty results or offline states gracefully.
    """
    clean_query = query.strip()
    trains_list: List[Dict[str, Any]] = []

    try:
        response = (
            supabase.table("trains")
            .select("train_no, train_name, source_station, destination_station")
            .or_(f"train_no.ilike.%{clean_query}%,train_name.ilike.%{clean_query}%")
            .execute()
        )
        if response.data:
            trains_list = response.data
    except Exception as exc:
        logger.warning(f"Error querying Supabase trains for search query '{clean_query}': {exc}")

    # If no records found and query is a 5-digit train number, check demo fallback
    if not trains_list and clean_query.isdigit() and len(clean_query) == 5:
        if clean_query in ("12417", "12424"):
            trains_list.append(
                {
                    "train_no": clean_query,
                    "train_name": "Prayagraj Express" if clean_query == "12417" else "Rajdhani Express",
                    "source_station": "NDLS",
                    "destination_station": "PRYJ" if clean_query == "12417" else "DBRG",
                }
            )

    return {"success": True, "trains": trains_list}


@router.get("/pnr/{pnr_number}")
@router.get("/pnr-status/{pnr_number}")
async def get_pnr_status_endpoint(pnr_number: str) -> Dict[str, Any]:
    """
    Get PNR status and passenger travel details.
    Accepts 10-digit numeric PNR number.
    Queries live railway client with mock/Supabase fallback.
    """
    pnr_clean = pnr_number.strip()
    if not (pnr_clean.isdigit() and len(pnr_clean) == 10):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid PNR number. Must be a 10-digit numeric code.",
        )

    pnr_result = await railway_client.get_pnr_status(pnr_clean)
    return pnr_result


class VerifyPNRRequest(BaseModel):
    pnr: str = Field(..., description="10-digit Indian Railways PNR number")


@router.post("/verify-pnr")
async def verify_pnr_endpoint(payload: VerifyPNRRequest) -> Dict[str, Any]:
    """
    Verify live PNR journey and check eligibility for Hazrat Nizamuddin (NZM) delivery.
    Accepts 10-digit numeric format.
    Fetches live journey details via get_pnr_live_status(pnr).
    Checks if route/journey passes through or halts at Hazrat Nizamuddin ('NZM'):
      - If passenger's destination is reached before NZM or train does not halt at NZM, returns 400 Bad Request.
      - If valid for NZM, parses and returns verified delivery details.
    """
    pnr_raw = payload.pnr.strip()
    pnr_clean = "".join(ch for ch in pnr_raw if ch.isdigit())
    if not (pnr_clean.isdigit() and len(pnr_clean) == 10):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid PNR number. Must be a 10-digit numeric code.",
        )

    # 1. Fetch live journey details via get_pnr_live_status
    pnr_response = await get_pnr_live_status(pnr_clean)
    data = (
        pnr_response.get("data")
        if isinstance(pnr_response.get("data"), dict)
        else pnr_response
    )

    # 2. Extract passenger details
    passengers = data.get("passengers") or data.get("passengerList") or []
    primary_passenger: Dict[str, Any] = {}
    if isinstance(passengers, list) and len(passengers) > 0 and isinstance(passengers[0], dict):
        primary_passenger = dict(passengers[0])

    if "seatNumber" not in primary_passenger:
        primary_passenger["seatNumber"] = (
            primary_passenger.get("seat")
            or primary_passenger.get("berth")
            or primary_passenger.get("currentBerthNo")
            or primary_passenger.get("bookingBerthNo")
        )
    if "coach" not in primary_passenger:
        primary_passenger["coach"] = (
            primary_passenger.get("currentCoachId")
            or primary_passenger.get("bookingCoachId")
        )

    # 3. Normalize train details
    train_number = str(
        data.get("trainNumber")
        or data.get("train_number")
        or data.get("train_no")
        or data.get("trainNo")
        or ""
    ).strip()

    train_name = str(
        data.get("trainName")
        or data.get("train_name")
        or data.get("train_no_name")
        or ""
    ).strip()

    chart_status = str(
        data.get("chartStatus")
        or data.get("chart_status")
        or data.get("status")
        or "CNF"
    ).strip()

    data["trainNumber"] = train_number
    data["trainName"] = train_name
    data["chartStatus"] = chart_status

    # 4. Extract passenger's boarding and destination stations
    from_info = data.get("from")
    to_info = data.get("to")

    board_code = str(
        (from_info.get("code") if isinstance(from_info, dict) else from_info)
        or data.get("boardingPoint")
        or data.get("sourceStation")
        or data.get("from_station")
        or ""
    ).strip().upper()

    dest_code = str(
        (to_info.get("code") if isinstance(to_info, dict) else to_info)
        or data.get("destinationStation")
        or data.get("reservationUpto")
        or data.get("to_station")
        or ""
    ).strip().upper()

    # 5. Check if route/journey passes through or halts at Hazrat Nizamuddin ('NZM')
    stops = await railway_client.get_train_schedule(train_number) if train_number else []

    nzm_stop = next(
        (s for s in stops if str(s.get("station_code", "")).strip().upper() == "NZM"),
        None,
    )

    if nzm_stop:
        nzm_seq = int(nzm_stop.get("stop_sequence") or 0)

        # Check if destination reached before NZM
        if dest_code and dest_code != "NZM":
            dest_stop = next(
                (s for s in stops if str(s.get("station_code", "")).strip().upper() == dest_code),
                None,
            )
            if dest_stop:
                dest_seq = int(dest_stop.get("stop_sequence") or 0)
                if dest_seq < nzm_seq:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="RailQuick delivery is currently available only for trains halting at Hazrat Nizamuddin (NZM).",
                    )

        # Check if passenger boards after NZM
        if board_code and board_code != "NZM":
            board_stop = next(
                (s for s in stops if str(s.get("station_code", "")).strip().upper() == board_code),
                None,
            )
            if board_stop:
                board_seq = int(board_stop.get("stop_sequence") or 0)
                if board_seq >= nzm_seq:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="RailQuick delivery is currently available only for trains halting at Hazrat Nizamuddin (NZM).",
                    )
    else:
        # NZM not found in schedule stops - check if directly boarding or detraining at NZM
        is_nzm_journey = (board_code == "NZM" or dest_code == "NZM")
        if not is_nzm_journey:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RailQuick delivery is currently available only for trains halting at Hazrat Nizamuddin (NZM).",
            )

    # 6. Populate arrival time for NZM if not present in data
    if not data.get("arrivalTime"):
        if nzm_stop:
            data["arrivalTime"] = (
                nzm_stop.get("scheduled_arrival")
                or nzm_stop.get("arrival_time")
            )
        if not data.get("arrivalTime"):
            data["arrivalTime"] = "16:30" if train_number == "12424" else "16:45"

    return {
        "valid": True,
        "pnr": pnr_clean,
        "train_number": data.get("trainNumber"),
        "train_name": data.get("trainName"),
        "station_code": "NZM",
        "arrival_time": data.get("arrivalTime"),
        "coach": primary_passenger.get("coach"),
        "seat": primary_passenger.get("seatNumber"),
        "pnr_status": data.get("chartStatus"),
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


@router.get("/{train_no}/eligible-stations")
async def get_eligible_stations(
    train_no: str,
    journey_date: Optional[str] = Query(None, description="Journey date (YYYY-MM-DD or DD-MM-YYYY)"),
    simulated_time: Optional[str] = Query(None, description="Simulated current time (HH:MM or ISO)"),
) -> Dict[str, Any]:
    """
    Fetch train route stops and evaluate delivery eligibility for each station stop.
    Returns:
      - eligible_stations: List of stations open for in-train delivery.
      - all_stops: Full route with eligibility breakdown.
    """
    clean_train_no = train_no.strip()
    clean_journey_date = journey_date if isinstance(journey_date, str) else None
    stops = await railway_client.get_train_schedule(clean_train_no, clean_journey_date)

    if not stops:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Train schedule not found",
        )

    sim_now = _parse_simulated_now(simulated_time)

    all_stops: List[Dict[str, Any]] = []
    eligible_stations: List[Dict[str, Any]] = []

    for stop in stops:
        eligibility = evaluate_station_delivery_eligibility(
            scheduled_arrival=stop.get("scheduled_arrival"),
            scheduled_departure=stop.get("scheduled_departure"),
            halt_minutes=stop.get("halt_minutes", 0),
            delay_minutes=stop.get("delay_minutes", 0),
            day_offset=stop.get("day_offset", 1),
            is_serviceable=stop.get("is_serviceable", False),
            journey_date_str=clean_journey_date,
            simulated_now=sim_now,
        )

        stop_info = {
            "station_code": stop.get("station_code"),
            "station_name": stop.get("station_name"),
            "stop_sequence": stop.get("stop_sequence"),
            "scheduled_arrival": eligibility["scheduled_arrival"],
            "scheduled_departure": stop.get("scheduled_departure"),
            "expected_arrival": eligibility["expected_arrival"],
            "halt_minutes": eligibility["halt_minutes"],
            "delay_minutes": eligibility["delay_minutes"],
            "day_offset": stop.get("day_offset", 1),
            "platform": stop.get("platform"),
            "is_serviceable": eligibility["is_serviceable"],
            "is_eligible": eligibility["is_eligible"],
            "eligibility_reason": eligibility["reason"],
            "cutoff_minutes_remaining": eligibility["cutoff_minutes_remaining"],
            # Backward-compatible fields
            "is_bookable": eligibility["is_eligible"],
            "cutoff_time": eligibility["expected_arrival"],
            "minutes_remaining": eligibility["cutoff_minutes_remaining"],
        }

        all_stops.append(stop_info)
        if eligibility["is_eligible"]:
            eligible_stations.append(stop_info)

    return {
        "success": True,
        "train_no": clean_train_no,
        "total_stops": len(all_stops),
        "eligible_stations_count": len(eligible_stations),
        "eligible_stations": eligible_stations,
        "all_stops": all_stops,
    }


@router.get("/{train_no}/servicing-stations")
async def get_servicing_stations(
    train_no: str,
    simulated_time: Optional[str] = Query(None, description="Simulated time (HH:MM or ISO)"),
) -> Dict[str, Any]:
    """
    Backward-compatible servicing-stations endpoint.
    Delegates to eligible-stations logic and returns combined response.
    """
    eligible_response = await get_eligible_stations(
        train_no=train_no,
        journey_date=None,
        simulated_time=simulated_time,
    )

    all_stops = eligible_response["all_stops"]
    serviceable_stops = [s for s in all_stops if s.get("is_serviceable") is True]

    return {
        "success": True,
        "train_no": eligible_response["train_no"],
        "total_stops": eligible_response["total_stops"],
        "serviceable_stations_count": len(serviceable_stops),
        "serviceable_stations": serviceable_stops,
        "eligible_stations_count": eligible_response["eligible_stations_count"],
        "eligible_stations": eligible_response["eligible_stations"],
        "all_stops": all_stops,
    }
