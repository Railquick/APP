import logging
from typing import Any, Dict, List, Optional
import httpx

from app.config import (
    RAILWAY_API_BASE_URL,
    RAILWAY_API_HOST,
    RAILWAY_API_KEY,
    supabase,
)

logger = logging.getLogger("railquick.railway_client")


def _parse_int_minutes(val: Any) -> int:
    """Safely parse minutes from integer, float, or string representations."""
    if val is None:
        return 0
    if isinstance(val, (int, float)):
        return int(val)
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ("-", "--", "none", "null"):
        return 0
    if ":" in val_str:
        parts = val_str.split(":")
        try:
            return int(parts[0]) * 60 + int(parts[1])
        except (ValueError, IndexError):
            return 0
    digits = "".join(ch for ch in val_str if ch.isdigit() or ch == "-")
    try:
        return int(digits) if digits else 0
    except ValueError:
        return 0


class RailwayClient:
    """
    Live / Hybrid Railway Client for PNR status and train route/schedule fetching.
    Interacts with external Railway API (RapidAPI IRCTC) when configured,
    with graceful fallback to Supabase data and standard mock models.
    """

    def __init__(
        self,
        base_url: str = RAILWAY_API_BASE_URL,
        api_key: str = RAILWAY_API_KEY,
        api_host: str = RAILWAY_API_HOST,
        timeout: float = 10.0,
        supabase_client: Any = None,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key.strip()
        self.api_host = api_host.strip()
        self.timeout = timeout
        self.supabase = supabase_client if supabase_client is not None else supabase

    @property
    def is_live_configured(self) -> bool:
        """Return True if external API key is present."""
        return bool(self.api_key)

    def _get_headers(self) -> Dict[str, str]:
        return {
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": self.api_host,
            "Accept": "application/json",
        }

    async def get_pnr_status(self, pnr_number: str) -> Dict[str, Any]:
        """
        Fetch PNR status.
        If RAILWAY_API_KEY is configured, queries external IRCTC PNR endpoint.
        Falls back to Supabase/mock data on failure or if key is absent.
        """
        pnr_clean = pnr_number.strip()

        if self.is_live_configured:
            try:
                # Attempt primary RapidAPI endpoint for PNR status
                url = f"{self.base_url}/checkPNRStatus"
                params = {"pnrNumber": pnr_clean}
                headers = self._get_headers()

                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.get(url, params=params, headers=headers)

                if response.status_code == 200:
                    payload = response.json()
                    parsed = self._parse_live_pnr_response(pnr_clean, payload)
                    if parsed:
                        return parsed
                    logger.warning(
                        f"External PNR API returned 200 but unparseable payload for PNR {pnr_clean}. Using fallback."
                    )
                else:
                    logger.warning(
                        f"External PNR API responded with HTTP {response.status_code}: {response.text[:200]}. Using fallback."
                    )
            except Exception as exc:
                logger.warning(
                    f"External PNR API request failed for {pnr_clean} ({type(exc).__name__}: {exc}). Falling back to Supabase/mock."
                )

        return await self._fallback_pnr(pnr_clean)

    def _parse_live_pnr_response(
        self, pnr_clean: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Parse third-party PNR status JSON into the standardized RailQuick PNR format."""
        if not isinstance(data, dict):
            return None

        info = data.get("data") if isinstance(data.get("data"), dict) else data

        train_no = str(
            info.get("trainNumber")
            or info.get("train_number")
            or info.get("train_no")
            or info.get("trainNo")
            or ""
        ).strip()

        train_name = str(
            info.get("trainName")
            or info.get("train_name")
            or info.get("train_no_name")
            or ""
        ).strip()

        source_station = str(
            info.get("sourceStation")
            or info.get("source_station")
            or info.get("from")
            or info.get("source")
            or ""
        ).strip().upper()

        destination_station = str(
            info.get("destinationStation")
            or info.get("destination_station")
            or info.get("to")
            or info.get("destination")
            or ""
        ).strip().upper()

        boarding_station = str(
            info.get("boardingPoint")
            or info.get("boarding_point")
            or info.get("boarding_station")
            or source_station
        ).strip().upper()

        journey_date = str(
            info.get("dateOfJourney")
            or info.get("journeyDate")
            or info.get("date")
            or info.get("doj")
            or "Today"
        ).strip()

        # Extract passenger details
        passengers = (
            info.get("passengerList")
            or info.get("passengers")
            or info.get("passenger_list")
            or []
        )

        coach = "B2"
        berth = "45"
        status = "CNF"

        if isinstance(passengers, list) and len(passengers) > 0:
            p = passengers[0]
            if isinstance(p, dict):
                coach = str(
                    p.get("currentCoachId")
                    or p.get("bookingCoachId")
                    or p.get("coach")
                    or coach
                ).strip()
                berth = str(
                    p.get("currentBerthNo")
                    or p.get("bookingBerthNo")
                    or p.get("berth")
                    or berth
                ).strip()
                status = str(
                    p.get("currentStatus")
                    or p.get("bookingStatus")
                    or p.get("status")
                    or status
                ).strip()

        # Validate that essential fields were extracted
        if not train_no and not train_name:
            return None

        return {
            "success": True,
            "pnr": pnr_clean,
            "train_no": train_no or "12417",
            "train_name": train_name or "Express",
            "source_station": source_station or "NDLS",
            "destination_station": destination_station or "PRYJ",
            "boarding_station": boarding_station or source_station or "NDLS",
            "coach": coach,
            "berth": berth,
            "status": status,
            "journey_date": journey_date,
            "source": "live_api",
        }

    async def _fallback_pnr(self, pnr_clean: str) -> Dict[str, Any]:
        """Deterministic mock PNR lookup with Supabase fallback."""
        train_data = {
            "train_no": "12417",
            "train_name": "Prayagraj Express",
            "source_station": "NDLS",
            "destination_station": "PRYJ",
        }

        try:
            train_res = (
                self.supabase.table("trains")
                .select("*")
                .eq("train_no", "12424")
                .execute()
            )
            if train_res.data and len(train_res.data) > 0:
                train_data = train_res.data[0]
        except Exception as exc:
            logger.warning(
                f"Supabase trains lookup for fallback PNR encountered: {exc}"
            )

        last_two = int(pnr_clean[-2:]) if len(pnr_clean) >= 2 and pnr_clean[-2:].isdigit() else 45
        coach_num = (
            (int(pnr_clean[-3]) % 5) + 1
            if (len(pnr_clean) >= 3 and pnr_clean[-3].isdigit())
            else 2
        )
        coach = f"B{coach_num}"
        berth = str((last_two % 64) + 1)

        return {
            "success": True,
            "pnr": pnr_clean,
            "train_no": str(train_data.get("train_no", "12417")),
            "train_name": str(train_data.get("train_name", "Prayagraj Express")),
            "source_station": str(train_data.get("source_station", "NDLS")),
            "destination_station": str(train_data.get("destination_station", "PRYJ")),
            "boarding_station": str(train_data.get("source_station", "NDLS")),
            "coach": coach,
            "berth": berth,
            "status": "CNF",
            "journey_date": "Today",
            "source": "mock_fallback",
        }

    async def get_train_schedule(
        self, train_no: str, journey_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch train schedule / route stops.
        If RAILWAY_API_KEY is configured, queries external train schedule API.
        Falls back to Supabase `train_stops` joined with `stations` ordered by `stop_sequence`.
        Returns normalized list of dictionaries.
        """
        clean_train_no = str(train_no).strip()

        if self.is_live_configured:
            try:
                url = f"{self.base_url}/getTrainSchedule"
                params: Dict[str, Any] = {"trainNo": clean_train_no}
                if journey_date:
                    params["date"] = journey_date
                headers = self._get_headers()

                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.get(url, params=params, headers=headers)

                if response.status_code == 200:
                    payload = response.json()
                    parsed_stops = await self._parse_live_schedule_response(payload)
                    if parsed_stops:
                        return parsed_stops
                    logger.warning(
                        f"External schedule API returned 200 but no stops parsed for train {clean_train_no}. Falling back to Supabase."
                    )
                else:
                    logger.warning(
                        f"External schedule API responded with HTTP {response.status_code} for train {clean_train_no}. Using fallback."
                    )
            except Exception as exc:
                logger.warning(
                    f"External schedule API request failed for train {clean_train_no} ({type(exc).__name__}: {exc}). Falling back to Supabase."
                )

        return await self._fallback_schedule(clean_train_no)

    async def _parse_live_schedule_response(
        self, data: Dict[str, Any]
    ) -> Optional[List[Dict[str, Any]]]:
        """Parse third-party train schedule / route into standardized stop list."""
        if not isinstance(data, dict):
            return None

        # Look for routes in common key locations
        route_data = None
        for key in ("route", "stationList", "stations", "schedule", "data"):
            val = data.get(key)
            if isinstance(val, list):
                route_data = val
                break
            elif isinstance(val, dict):
                sub_val = val.get("route") or val.get("stationList") or val.get("stations")
                if isinstance(sub_val, list):
                    route_data = sub_val
                    break

        if not route_data or not isinstance(route_data, list):
            return None

        normalized_stops: List[Dict[str, Any]] = []
        station_codes: List[str] = []

        for idx, item in enumerate(route_data):
            if not isinstance(item, dict):
                continue

            station_code = str(
                item.get("station_code")
                or item.get("stnCode")
                or item.get("stationCode")
                or item.get("code")
                or ""
            ).strip().upper()

            if not station_code:
                continue

            station_name = str(
                item.get("station_name")
                or item.get("stnName")
                or item.get("stationName")
                or item.get("name")
                or station_code
            ).strip()

            stop_sequence = int(
                item.get("stop_sequence")
                or item.get("stnSerialNumber")
                or item.get("sequence")
                or (idx + 1)
            )

            arrival = (
                item.get("scheduled_arrival")
                or item.get("arrivalTime")
                or item.get("arrival")
                or item.get("arrTime")
                or None
            )
            if arrival:
                arrival = str(arrival).strip()

            departure = (
                item.get("scheduled_departure")
                or item.get("departureTime")
                or item.get("departure")
                or item.get("depTime")
                or None
            )
            if departure:
                departure = str(departure).strip()

            halt_minutes = _parse_int_minutes(
                item.get("halt_minutes")
                or item.get("halt")
                or item.get("haltTime")
                or 0
            )

            delay_minutes = _parse_int_minutes(
                item.get("delay_minutes")
                or item.get("arrDelay")
                or item.get("delay")
                or 0
            )

            day_offset = int(
                item.get("day_offset")
                or item.get("day")
                or item.get("dayCount")
                or 1
            )

            platform = item.get("platform") or item.get("platformNumber") or item.get("platform_number")
            platform_str = str(platform).strip() if platform not in (None, "") else None

            normalized_stops.append(
                {
                    "station_code": station_code,
                    "station_name": station_name,
                    "stop_sequence": stop_sequence,
                    "scheduled_arrival": arrival,
                    "scheduled_departure": departure,
                    "halt_minutes": halt_minutes,
                    "delay_minutes": delay_minutes,
                    "day_offset": day_offset,
                    "platform": platform_str,
                    "is_serviceable": False,
                }
            )
            station_codes.append(station_code)

        # Enrich with Supabase stations `is_serviceable` flags where available
        if station_codes:
            try:
                stn_res = (
                    self.supabase.table("stations")
                    .select("station_code, is_serviceable")
                    .in_("station_code", station_codes)
                    .execute()
                )
                serviceable_map = {
                    item["station_code"].upper(): bool(item.get("is_serviceable", False))
                    for item in (stn_res.data or [])
                    if item.get("station_code")
                }
                for stop in normalized_stops:
                    stop["is_serviceable"] = serviceable_map.get(
                        stop["station_code"], False
                    )
            except Exception as exc:
                logger.warning(
                    f"Could not verify station serviceability in Supabase: {exc}"
                )

        return normalized_stops

    async def _fallback_schedule(self, train_no: str) -> List[Dict[str, Any]]:
        """Fallback to Supabase train_stops table joined with stations."""
        try:
            stops_res = (
                self.supabase.table("train_stops")
                .select(
                    "station_code, stop_sequence, arrival_time, departure_time, halt_minutes, stations(name, state, is_serviceable)"
                )
                .eq("train_no", train_no)
                .order("stop_sequence")
                .execute()
            )

            stops = stops_res.data or []
            normalized: List[Dict[str, Any]] = []

            for idx, stop in enumerate(stops):
                stn = stop.get("stations") or {}
                stn_code = str(stop.get("station_code", "")).strip().upper()
                stn_name = (
                    str(stn.get("name", "")).strip() or stn_code
                )
                is_serviceable = bool(stn.get("is_serviceable", False))

                normalized.append(
                    {
                        "station_code": stn_code,
                        "station_name": stn_name,
                        "stop_sequence": int(stop.get("stop_sequence") or (idx + 1)),
                        "scheduled_arrival": stop.get("arrival_time"),
                        "scheduled_departure": stop.get("departure_time"),
                        "halt_minutes": int(stop.get("halt_minutes") or 0),
                        "delay_minutes": 0,
                        "day_offset": 1,
                        "platform": None,
                        "is_serviceable": is_serviceable,
                    }
                )

            return normalized
        except Exception as exc:
            logger.error(
                f"Error fetching train schedule from Supabase for train {train_no}: {exc}"
            )
            return []


# Exportable instance
railway_client = RailwayClient()
