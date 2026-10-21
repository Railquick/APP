from datetime import datetime, timedelta, timezone
from typing import Optional

ORDER_CUTOFF_BUFFER_MINUTES = 30
IST_TIMEZONE = timezone(timedelta(hours=5, minutes=30))


def check_cutoff_status(
    arrival_time_str: str,
    buffer_minutes: int = ORDER_CUTOFF_BUFFER_MINUTES,
    simulated_current_time: Optional[str] = None,
) -> dict:
    """
    Check if an order can be placed for a station arrival time based on a cutoff buffer window.
    Default buffer is 30 minutes before scheduled arrival_time.

    Parameters:
        arrival_time_str: Scheduled train arrival time in "HH:MM" or "HH:MM:SS" format.
        buffer_minutes: Cutoff buffer in minutes (default 30).
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
