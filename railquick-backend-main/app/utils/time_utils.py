from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

# Constants
ORDER_CUTOFF_BUFFER_MINUTES = 20  # Minimum minutes required before actual arrival to pack & deliver
MIN_STATION_HALT_MINUTES = 2      # Minimum halt duration required for delivery agent to board/hand over
IST_TIMEZONE = timezone(timedelta(hours=5, minutes=30))  # Enforce IST for all time operations


def evaluate_station_delivery_eligibility(
    scheduled_arrival: Optional[str],
    scheduled_departure: Optional[str],
    halt_minutes: int = 0,
    delay_minutes: int = 0,
    day_offset: int = 1,
    is_serviceable: bool = False,
    journey_date_str: Optional[str] = None,
    simulated_now: Optional[datetime] = None,
) -> Dict[str, Any]:
    """
    Evaluate if a train station stop is eligible for in-train essentials delivery.

    Considers:
      1. Station serviceability flag
      2. Minimum station halt duration (>= 2 minutes)
      3. Live delay adjustments to scheduled arrival
      4. Multi-day journey offset calculation
      5. Minimum order cutoff buffer (>= 20 minutes before real/expected arrival)

    Returns:
        {
            "is_eligible": bool,
            "reason": str,
            "scheduled_arrival": str,
            "expected_arrival": str,
            "delay_minutes": int,
            "halt_minutes": int,
            "cutoff_minutes_remaining": int,
            "is_serviceable": bool
        }
    """
    halt_mins = int(halt_minutes or 0)
    delay_mins = int(delay_minutes or 0)
    day_off = max(1, int(day_offset or 1))

    # Determine reference current time in IST
    if simulated_now is not None:
        if simulated_now.tzinfo is None:
            now_ist = simulated_now.replace(tzinfo=IST_TIMEZONE)
        else:
            now_ist = simulated_now.astimezone(IST_TIMEZONE)
    else:
        now_ist = datetime.now(IST_TIMEZONE)

    # 1. Serviceability Check
    if not is_serviceable:
        raw_time = scheduled_arrival or scheduled_departure or ""
        norm_time = raw_time.strip()[:5] if raw_time.strip() else ""
        return {
            "is_eligible": False,
            "reason": "Station hub is not currently serviceable",
            "scheduled_arrival": norm_time,
            "expected_arrival": norm_time,
            "delay_minutes": delay_mins,
            "halt_minutes": halt_mins,
            "cutoff_minutes_remaining": 0,
            "is_serviceable": False,
        }

    # 2. Halt Duration Check
    if halt_mins < MIN_STATION_HALT_MINUTES:
        raw_time = scheduled_arrival or scheduled_departure or ""
        norm_time = raw_time.strip()[:5] if raw_time.strip() else ""
        return {
            "is_eligible": False,
            "reason": f"Train halt duration ({halt_mins}m) is less than required minimum ({MIN_STATION_HALT_MINUTES}m)",
            "scheduled_arrival": norm_time,
            "expected_arrival": norm_time,
            "delay_minutes": delay_mins,
            "halt_minutes": halt_mins,
            "cutoff_minutes_remaining": 0,
            "is_serviceable": is_serviceable,
        }

    # 3. Real Arrival DateTime Calculation
    # Determine base date of the journey
    base_date = now_ist.date()
    if journey_date_str and isinstance(journey_date_str, str) and journey_date_str.strip().lower() not in ("today", ""):
        clean_date = journey_date_str.strip().split("T")[0]
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
            try:
                base_date = datetime.strptime(clean_date, fmt).date()
                break
            except ValueError:
                pass

    station_date = base_date + timedelta(days=day_off - 1)

    raw_time = scheduled_arrival if (scheduled_arrival and scheduled_arrival.strip()) else scheduled_departure
    if not raw_time or not raw_time.strip():
        return {
            "is_eligible": False,
            "reason": "Missing scheduled arrival or departure time",
            "scheduled_arrival": "",
            "expected_arrival": "",
            "delay_minutes": delay_mins,
            "halt_minutes": halt_mins,
            "cutoff_minutes_remaining": 0,
            "is_serviceable": is_serviceable,
        }

    try:
        parts = raw_time.strip().split(":")
        arr_hour = int(parts[0])
        arr_min = int(parts[1])
    except (ValueError, IndexError):
        return {
            "is_eligible": False,
            "reason": f"Invalid time format: {raw_time}",
            "scheduled_arrival": raw_time,
            "expected_arrival": raw_time,
            "delay_minutes": delay_mins,
            "halt_minutes": halt_mins,
            "cutoff_minutes_remaining": 0,
            "is_serviceable": is_serviceable,
        }

    norm_scheduled = f"{arr_hour:02d}:{arr_min:02d}"

    scheduled_arrival_dt = datetime(
        year=station_date.year,
        month=station_date.month,
        day=station_date.day,
        hour=arr_hour,
        minute=arr_min,
        second=0,
        tzinfo=IST_TIMEZONE,
    )

    # Add delay_minutes to compute expected_arrival_datetime
    expected_arrival_dt = scheduled_arrival_dt + timedelta(minutes=delay_mins)
    norm_expected = expected_arrival_dt.strftime("%H:%M")

    # 4. Time Buffer Calculation
    minutes_until_arrival = (expected_arrival_dt - now_ist).total_seconds() / 60.0
    cutoff_minutes_remaining = max(0, int(minutes_until_arrival - ORDER_CUTOFF_BUFFER_MINUTES))

    if minutes_until_arrival < ORDER_CUTOFF_BUFFER_MINUTES:
        return {
            "is_eligible": False,
            "reason": "Order cutoff window has passed for this station",
            "scheduled_arrival": norm_scheduled,
            "expected_arrival": norm_expected,
            "delay_minutes": delay_mins,
            "halt_minutes": halt_mins,
            "cutoff_minutes_remaining": 0,
            "is_serviceable": is_serviceable,
        }

    # 5. Eligible Success
    return {
        "is_eligible": True,
        "reason": "Eligible for in-train delivery",
        "scheduled_arrival": norm_scheduled,
        "expected_arrival": norm_expected,
        "delay_minutes": delay_mins,
        "halt_minutes": halt_mins,
        "cutoff_minutes_remaining": cutoff_minutes_remaining,
        "is_serviceable": is_serviceable,
    }


def check_cutoff_status(
    arrival_time_str: str,
    buffer_minutes: int = ORDER_CUTOFF_BUFFER_MINUTES,
    simulated_current_time: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Backward-compatible 24-hr check for station arrival time based on a cutoff buffer window.
    Default buffer is ORDER_CUTOFF_BUFFER_MINUTES (20 minutes).

    Parameters:
        arrival_time_str: Scheduled train arrival time in "HH:MM" or "HH:MM:SS" format.
        buffer_minutes: Cutoff buffer in minutes (default 20).
        simulated_current_time: Optional simulated current time in "HH:MM" format.

    Returns:
        {
            "is_bookable": bool, # True if current_time < cutoff_time
            "arrival_time": str, # "HH:MM"
            "cutoff_time": str,  # "HH:MM"
            "minutes_remaining": int
        }
    """
    # Parse arrival time (supports "HH:MM" or "HH:MM:SS")
    arr_parts = arrival_time_str.strip().split(":")
    arr_h = int(arr_parts[0])
    arr_m = int(arr_parts[1])
    norm_arrival = f"{arr_h:02d}:{arr_m:02d}"
    arr_mins = arr_h * 60 + arr_m

    # Calculate cutoff time in minutes and "HH:MM" string
    cutoff_mins = arr_mins - buffer_minutes
    cutoff_mins_mod = cutoff_mins % 1440
    cutoff_h = cutoff_mins_mod // 60
    cutoff_m = cutoff_mins_mod % 60
    cutoff_time_str = f"{cutoff_h:02d}:{cutoff_m:02d}"

    # Determine current time in minutes
    if simulated_current_time and simulated_current_time.strip():
        sim_parts = simulated_current_time.strip().split(":")
        curr_h = int(sim_parts[0])
        curr_m = int(sim_parts[1])
    else:
        now_ist = datetime.now(IST_TIMEZONE)
        curr_h = now_ist.hour
        curr_m = now_ist.minute

    curr_mins = curr_h * 60 + curr_m

    # Calculate is_bookable and minutes_remaining
    if cutoff_mins >= 0:
        if curr_mins < cutoff_mins:
            is_bookable = True
            minutes_remaining = cutoff_mins - curr_mins
        else:
            is_bookable = False
            minutes_remaining = 0
    else:
        # Midnight wrap-around: arrival is early morning (e.g., 00:15)
        # Cutoff is late previous night (e.g., 23:45)
        if curr_mins < cutoff_mins_mod and curr_mins >= 12 * 60:
            is_bookable = True
            minutes_remaining = cutoff_mins_mod - curr_mins
        else:
            is_bookable = False
            minutes_remaining = 0

    return {
        "is_bookable": is_bookable,
        "arrival_time": norm_arrival,
        "cutoff_time": cutoff_time_str,
        "minutes_remaining": minutes_remaining,
    }
