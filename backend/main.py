import json
import logging
import math
import os
import time
import hashlib
import re
from collections import OrderedDict
from io import BytesIO
from functools import lru_cache
from threading import Lock
from typing import Dict, List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, os.pardir))
DATA_DIR = os.path.join(BASE_DIR, "data")
ATLAS_DIR = os.path.join(DATA_DIR, "atlas")
DEFAULT_ATLAS_PROCESSED_DIR = os.path.join(ATLAS_DIR, "processed")
ROOT_PROCESSED_DIR = os.path.join(ROOT_DIR, "processed")


def _env_path(name: str, default: str) -> str:
    raw = os.getenv(name) or os.getenv(f"MOP_{name}")
    if not raw:
        return default
    return os.path.abspath(os.path.expanduser(raw))


ATLAS_PROCESSED_DIR = _env_path(
    "ATLAS_PROCESSED_DIR",
    ROOT_PROCESSED_DIR if os.path.exists(ROOT_PROCESSED_DIR) else DEFAULT_ATLAS_PROCESSED_DIR,
)
ATLAS_BOUNDARIES_DIR = _env_path("ATLAS_BOUNDARIES_DIR", os.path.join(ATLAS_DIR, "boundaries"))
FLOW_DATA_DIR = _env_path("FLOW_DATA_DIR", os.path.join(ROOT_DIR, "data"))
SPENDING_DATA_FILE = _env_path(
    "SPENDING_DATA_FILE", os.path.join(DATA_DIR, "spending_state_agency.xlsx")
)

DATASETS = {
    "census": {
        "label": "Census (ACS Demographics)",
        "dir": "census",
        "prefix": "acs",
    },
    "contract_static": {
        "label": "Government Spending",
        "dir": "contract_static",
        "prefix": "contract",
    },
    "gov_spending": {
        "label": "Government Finances",
        "dir": "gov_spending",
        "prefix": "gov",
    },
    "finra": {
        "label": "FINRA Financial Literacy",
        "dir": "Finra",
        "prefix": "finra",
    },
    "spending_breakdown": {
        "label": "Federal Spending Breakdown",
        "dir": "spending_breakdown",
        "prefix": "spending",
    },
}

LEVELS = {"state", "county", "congress"}
DATASET_LEVELS = {key: set(LEVELS) for key in DATASETS}
DATASET_LEVELS["spending_breakdown"] = {"state"}
YEAR_COLUMN = "Year"
CENSUS_COUNTY_PLANNING_START_YEAR = 2022
CENSUS_INCOME_REPLACEMENTS = {
    "Income <$50K": "Income >$50K",
    "Income <$100K": "Income >$100K",
    "Income <$200K": "Income >$200K",
}
CENSUS_DERIVED_VARIABLES = {
    "Income >$50K": ("# of household", "Income <$50K"),
    "Income >$100K": ("# of household", "Income <$100K"),
    "Income >$200K": ("# of household", "Income <$200K"),
}

ID_COLUMNS = {
    "state": {"state", "state_fips"},
    "county": {"county", "state", "fips", "county_fips", "state_fips"},
    "congress": {"cd_118", "state", "state_fips"},
}

STATE_META = [
    ("alabama", "01", "AL"),
    ("alaska", "02", "AK"),
    ("arizona", "04", "AZ"),
    ("arkansas", "05", "AR"),
    ("california", "06", "CA"),
    ("colorado", "08", "CO"),
    ("connecticut", "09", "CT"),
    ("delaware", "10", "DE"),
    ("district of columbia", "11", "DC"),
    ("florida", "12", "FL"),
    ("georgia", "13", "GA"),
    ("hawaii", "15", "HI"),
    ("idaho", "16", "ID"),
    ("illinois", "17", "IL"),
    ("indiana", "18", "IN"),
    ("iowa", "19", "IA"),
    ("kansas", "20", "KS"),
    ("kentucky", "21", "KY"),
    ("louisiana", "22", "LA"),
    ("maine", "23", "ME"),
    ("maryland", "24", "MD"),
    ("massachusetts", "25", "MA"),
    ("michigan", "26", "MI"),
    ("minnesota", "27", "MN"),
    ("mississippi", "28", "MS"),
    ("missouri", "29", "MO"),
    ("montana", "30", "MT"),
    ("nebraska", "31", "NE"),
    ("nevada", "32", "NV"),
    ("new hampshire", "33", "NH"),
    ("new jersey", "34", "NJ"),
    ("new mexico", "35", "NM"),
    ("new york", "36", "NY"),
    ("north carolina", "37", "NC"),
    ("north dakota", "38", "ND"),
    ("ohio", "39", "OH"),
    ("oklahoma", "40", "OK"),
    ("oregon", "41", "OR"),
    ("pennsylvania", "42", "PA"),
    ("rhode island", "44", "RI"),
    ("south carolina", "45", "SC"),
    ("south dakota", "46", "SD"),
    ("tennessee", "47", "TN"),
    ("texas", "48", "TX"),
    ("utah", "49", "UT"),
    ("vermont", "50", "VT"),
    ("virginia", "51", "VA"),
    ("washington", "53", "WA"),
    ("west virginia", "54", "WV"),
    ("wisconsin", "55", "WI"),
    ("wyoming", "56", "WY"),
    ("puerto rico", "72", "PR"),
    # US Territories
    ("guam", "66", "GU"),
    ("virgin islands", "78", "VI"),
    ("virgin islands of the u.s.", "78", "VI"),  # Alternative name in data
    ("american samoa", "60", "AS"),
    ("northern mariana islands", "69", "MP"),
]

STATE_NAME_TO_ABBR = {name: abbr for name, _, abbr in STATE_META}
STATE_NAME_TO_FIPS = {name: fips for name, fips, _ in STATE_META}

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger("atlas")

app = FastAPI(title="Opportunity Atlas API")
app.add_middleware(GZipMiddleware, minimum_size=1024)


def _parse_allowed_origins(raw: Optional[str]) -> List[str]:
    if not raw:
        return ["*"]
    cleaned = [item.strip() for item in raw.split(",") if item.strip()]
    return cleaned or ["*"]


_CORS_ALLOWED_ORIGINS = _parse_allowed_origins(os.getenv("CORS_ALLOWED_ORIGINS"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_DATA_CACHE: Dict[str, tuple[pd.DataFrame, float, float]] = {}
_GEO_CACHE: Dict[str, tuple[dict, float, float]] = {}
_GEO_CACHE_ORDER: List[str] = []
_FLOW_CACHE: Dict[str, tuple[pd.DataFrame, float, float]] = {}
_FLOW_CACHE_ORDER: List[str] = []
_BOUNDARY_ID_CACHE: Dict[str, tuple[set, float, float]] = {}
_STATE_CENTROID_CACHE: Optional[Dict[str, tuple[float, float]]] = None
GEO_CACHE_LIMIT = int(os.getenv("GEO_CACHE_LIMIT", "2"))
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "3600"))
VALUES_CACHE_LIMIT = int(os.getenv("VALUES_CACHE_LIMIT", "256"))
FLOW_RESULT_CACHE_LIMIT = int(os.getenv("FLOW_RESULT_CACHE_LIMIT", "128"))
SHORT_CACHE_SECONDS = int(os.getenv("SHORT_CACHE_SECONDS", "300"))
LONG_CACHE_SECONDS = int(os.getenv("LONG_CACHE_SECONDS", "3600"))
FLOW_CACHE_SECONDS = int(os.getenv("FLOW_CACHE_SECONDS", "120"))
RATE_LIMIT_DEFAULT = os.getenv("RATE_LIMIT_DEFAULT", "120/minute")
APP_START_TIME = time.time()
_VALUES_CACHE: OrderedDict[str, tuple[dict, float]] = OrderedDict()
_FLOW_RESULT_CACHE: OrderedDict[str, tuple[dict, float]] = OrderedDict()
_LRU_CACHE_LOCK = Lock()

def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=_client_ip, default_limits=[RATE_LIMIT_DEFAULT])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@lru_cache(maxsize=2)
def _load_spending_data_cached(signature: str) -> pd.DataFrame:
    if not os.path.exists(SPENDING_DATA_FILE):
        raise FileNotFoundError(SPENDING_DATA_FILE)
    df = pd.read_excel(SPENDING_DATA_FILE)
    for required_col in ("state", "agency", "year"):
        if required_col not in df.columns:
            raise ValueError(f"Missing required spending column: {required_col}")
    df["state"] = df["state"].astype(str).str.strip().str.upper()
    df["agency"] = df["agency"].astype(str).str.strip()
    df["year"] = df["year"].apply(normalize_year_value)
    df = df[df["year"].notna()]
    return df


def load_spending_data() -> pd.DataFrame:
    return _load_spending_data_cached(_spending_signature())


@lru_cache(maxsize=2)
def _spending_metric_sets_cached(signature: str) -> Dict[str, List[str]]:
    df = _load_spending_data_cached(signature)
    numeric_cols = [
        col
        for col in df.select_dtypes(include="number").columns.tolist()
        if col != "state_fips"
    ]
    per_capita = sorted([col for col in numeric_cols if "Per 1000" in col])
    metrics = sorted([col for col in numeric_cols if col not in per_capita])
    return {
        "metrics": metrics,
        "per_capita_metrics": per_capita,
    }


def spending_metric_sets() -> Dict[str, List[str]]:
    return _spending_metric_sets_cached(_spending_signature())


@lru_cache(maxsize=2)
def _spending_metadata_payload_cached(signature: str) -> Dict[str, List[str]]:
    df = _load_spending_data_cached(signature)
    columns = _spending_metric_sets_cached(signature)
    years = sorted(df["year"].dropna().astype(str).unique().tolist())
    states = sorted(df["state"].dropna().astype(str).unique().tolist())
    agencies = sorted(df["agency"].dropna().astype(str).unique().tolist())
    return {
        "years": years,
        "states": states,
        "agencies": agencies,
        **columns,
    }


def spending_metadata_payload() -> Dict[str, List[str]]:
    return _spending_metadata_payload_cached(_spending_signature())


@lru_cache(maxsize=512)
def spending_state_summary_records(year: str, metric: str, signature: str) -> List[dict]:
    year_value = str(year).strip()
    df = load_spending_data()
    year_df = df[df["year"] == year_value]
    if year_df.empty:
        return []
    grouped = (
        year_df.groupby(["state", "state_fips"], dropna=False, sort=False)[metric]
        .sum()
        .reset_index()
        .rename(columns={metric: "value"})
        .sort_values("state")
    )
    return grouped.to_dict(orient="records")


@lru_cache(maxsize=2048)
def spending_state_detail_records(state: str, year: str, signature: str) -> List[dict]:
    state_key = state.strip().upper()
    year_value = str(year).strip()
    df = load_spending_data()
    detail = df[(df["state"] == state_key) & (df["year"] == year_value)]
    if detail.empty:
        return []
    return detail.to_dict(orient="records")


def _is_expired(timestamp: float) -> bool:
    if CACHE_TTL_SECONDS <= 0:
        return False
    return (time.time() - timestamp) > CACHE_TTL_SECONDS


def _file_signature(path: str) -> str:
    try:
        stat = os.stat(path)
    except FileNotFoundError:
        return "missing"
    return f"{int(stat.st_mtime)}-{stat.st_size}"


def _dataset_signature(dataset: str, level: str) -> str:
    return _file_signature(dataset_path(dataset, level))


def _flow_signature(level: str) -> str:
    return _file_signature(os.path.join(FLOW_DATA_DIR, FLOW_FILES[level]))


def _geo_signature(level: str, year: Optional[str] = None) -> str:
    return _file_signature(os.path.join(ATLAS_BOUNDARIES_DIR, geo_filename(level, year)))


def _parse_year_int(value: Optional[str]) -> Optional[int]:
    if value is None:
        return None
    raw = str(value).strip()
    if raw.isdigit():
        return int(raw)
    match = re.search(r"(19|20)\\d{2}", raw)
    if match:
        return int(match.group(0))
    return None


def county_geo_variant(year: Optional[str]) -> str:
    year_value = _parse_year_int(year)
    if year_value is not None and year_value < CENSUS_COUNTY_PLANNING_START_YEAR:
        return "legacy"
    return "planning"


def geo_filename(level: str, year: Optional[str] = None) -> str:
    if level == "county":
        variant = county_geo_variant(year)
        return "counties_legacy.geojson" if variant == "legacy" else "counties.geojson"
    return {
        "state": "states.geojson",
        "congress": "congress.geojson",
    }[level]


def _spending_signature() -> str:
    return _file_signature(SPENDING_DATA_FILE)


def _build_etag(*parts: object) -> str:
    raw = "|".join("" if p is None else str(p) for p in parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _cache_get(cache: OrderedDict, key: str):
    with _LRU_CACHE_LOCK:
        entry = cache.get(key)
        if not entry:
            return None
        payload, timestamp = entry
        if _is_expired(timestamp):
            cache.pop(key, None)
            return None
        cache.move_to_end(key)
        return payload


def _cache_set(cache: OrderedDict, key: str, payload: dict, limit: int):
    with _LRU_CACHE_LOCK:
        cache[key] = (payload, time.time())
        cache.move_to_end(key)
        while len(cache) > limit:
            cache.popitem(last=False)


def _cache_headers(etag: str, max_age: int) -> Dict[str, str]:
    return {
        "Cache-Control": f"public, max-age={max_age}",
        "ETag": etag,
        "Vary": "Accept-Encoding",
    }


def _sanitize_payload(value):
    if isinstance(value, float):
        if not math.isfinite(value):
            return None
        return value
    if isinstance(value, list):
        return [_sanitize_payload(item) for item in value]
    if isinstance(value, dict):
        return {key: _sanitize_payload(item) for key, item in value.items()}
    return value


def _cached_json_response(request: Request, payload: dict, etag: str, max_age: int):
    headers = _cache_headers(etag, max_age)
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers=headers)
    safe_payload = _sanitize_payload(jsonable_encoder(payload))
    return JSONResponse(content=safe_payload, headers=headers)


@app.middleware("http")
async def log_and_rate_limit(request: Request, call_next):
    start = time.time()
    response = None
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("unhandled_error path=%s", request.url.path)
        raise
    finally:
        duration_ms = int((time.time() - start) * 1000)
        status_code = response.status_code if response is not None else 500
        logger.info("request path=%s status=%s duration_ms=%s", request.url.path, status_code, duration_ms)

    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning("http_error path=%s status=%s detail=%s", request.url.path, exc.status_code, exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


def dataset_path(dataset: str, level: str) -> str:
    info = DATASETS[dataset]
    filename = f"{info['prefix']}_{level}.xlsx"
    return os.path.join(ATLAS_PROCESSED_DIR, info["dir"], filename)


def validate_dataset_level(
    dataset: str,
    level: str,
    *,
    allow_spending_breakdown: bool = True,
) -> set:
    if dataset not in DATASETS:
        raise HTTPException(status_code=404, detail="Unknown dataset")
    if not allow_spending_breakdown and dataset == "spending_breakdown":
        raise HTTPException(status_code=404, detail="Unknown dataset")
    if level not in LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    allowed_levels = DATASET_LEVELS.get(dataset, LEVELS)
    if level not in allowed_levels:
        raise HTTPException(status_code=404, detail="Unknown level")
    return allowed_levels


def load_dataset(dataset: str, level: str) -> pd.DataFrame:
    cache_key = f"{dataset}:{level}"
    path = dataset_path(dataset, level)
    signature = _file_signature(path)
    entry = _DATA_CACHE.get(cache_key)
    if entry is not None and entry[2] == signature and not _is_expired(entry[1]):
        return entry[0]
    if entry is not None and (_is_expired(entry[1]) or entry[2] != signature):
        _DATA_CACHE.pop(cache_key, None)
    if cache_key not in _DATA_CACHE:
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        df = pd.read_excel(path)
        if "year" in df.columns and YEAR_COLUMN not in df.columns:
            df = df.rename(columns={"year": YEAR_COLUMN})
        if "county_fips" in df.columns and "fips" not in df.columns:
            df = df.rename(columns={"county_fips": "fips"})
        if YEAR_COLUMN in df.columns:
            df[YEAR_COLUMN] = df[YEAR_COLUMN].apply(normalize_year_value)
        _DATA_CACHE[cache_key] = (df, time.time(), signature)
    return _DATA_CACHE[cache_key][0]


def normalize_year_value(value) -> Optional[str]:
    if value is None or pd.isna(value):
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if float(value).is_integer():
            return str(int(value))
    return str(value).strip()


def list_years(df: pd.DataFrame) -> List[str]:
    if YEAR_COLUMN not in df.columns:
        return []
    years: List[str] = []
    seen = set()
    for raw in pd.unique(df[YEAR_COLUMN].dropna()):
        normalized = str(raw).strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        years.append(normalized)
    return years


def filter_dataset_year(df: pd.DataFrame, year: Optional[str]) -> tuple[pd.DataFrame, Optional[str]]:
    if YEAR_COLUMN not in df.columns:
        return df, None
    available_years = list_years(df)
    selected_year = normalize_year_value(year) if year is not None else None
    if not selected_year and available_years:
        selected_year = available_years[-1]
    if selected_year:
        df = df[df[YEAR_COLUMN] == selected_year]
    return df, selected_year


def load_geo(level: str, year: Optional[str] = None) -> dict:
    cache_key = f"{level}:{county_geo_variant(year)}" if level == "county" else level
    entry = _GEO_CACHE.get(cache_key)
    signature = _geo_signature(level, year)
    if entry is not None and (_is_expired(entry[1]) or entry[2] != signature):
        _GEO_CACHE.pop(cache_key, None)
        if cache_key in _GEO_CACHE_ORDER:
            _GEO_CACHE_ORDER.remove(cache_key)
    if cache_key not in _GEO_CACHE:
        # prune expired in order list
        for cached_level in list(_GEO_CACHE_ORDER):
            cached_entry = _GEO_CACHE.get(cached_level)
            if cached_entry and _is_expired(cached_entry[1]):
                _GEO_CACHE.pop(cached_level, None)
                _GEO_CACHE_ORDER.remove(cached_level)
        while _GEO_CACHE_ORDER and len(_GEO_CACHE_ORDER) >= GEO_CACHE_LIMIT:
            evict_level = _GEO_CACHE_ORDER.pop(0)
            _GEO_CACHE.pop(evict_level, None)
        path = os.path.join(ATLAS_BOUNDARIES_DIR, geo_filename(level, year))
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        with open(path, "r", encoding="utf-8") as f:
            _GEO_CACHE[cache_key] = (json.load(f), time.time(), signature)
        _GEO_CACHE_ORDER.append(cache_key)
    else:
        if cache_key in _GEO_CACHE_ORDER:
            _GEO_CACHE_ORDER.remove(cache_key)
            _GEO_CACHE_ORDER.append(cache_key)
    return _GEO_CACHE[cache_key][0]


def boundary_ids(level: str, year: Optional[str] = None) -> set:
    cache_key = f"{level}:{county_geo_variant(year)}" if level == "county" else level
    entry = _BOUNDARY_ID_CACHE.get(cache_key)
    signature = _geo_signature(level, year)
    if entry is not None and entry[2] == signature and not _is_expired(entry[1]):
        return entry[0]
    geo = load_geo(level, year)
    ids = set()
    for feature in geo.get("features", []):
        raw_id = (feature.get("properties") or {}).get("id")
        if raw_id is None:
            continue
        if level == "state":
            try:
                ids.add(str(int(raw_id)).zfill(2))
            except (TypeError, ValueError):
                continue
        elif level == "county":
            try:
                ids.add(str(int(raw_id)).zfill(5))
            except (TypeError, ValueError):
                continue
        else:
            ids.add(str(raw_id).strip().upper())
    _BOUNDARY_ID_CACHE[cache_key] = (ids, time.time(), signature)
    return ids


def _walk_coords(coords):
    if not coords:
        return
    first = coords[0]
    if isinstance(first, (int, float)) and len(coords) >= 2:
        yield coords  # [lon, lat]
        return
    for item in coords:
        yield from _walk_coords(item)


# Hardcoded centroids for states/territories that cross the International Date Line or have complex geometries
SPECIAL_STATE_CENTROIDS = {
    "02": (64.2008, -152.4937),  # Alaska - manually set to avoid date line issues
    "15": (20.7984, -156.3319),  # Hawaii - center of main islands
    # US Territories (not in standard GeoJSON boundaries)
    "66": (13.4443, 144.7937),   # Guam
    "78": (18.3358, -64.8963),   # US Virgin Islands
    "60": (-14.2710, -170.1322), # American Samoa
    "69": (15.0979, 145.6739),   # Northern Mariana Islands
}


def state_centroids() -> Dict[str, tuple[float, float]]:
    global _STATE_CENTROID_CACHE
    if _STATE_CENTROID_CACHE is not None:
        return _STATE_CENTROID_CACHE
    geo = load_geo("state")
    centroids: Dict[str, tuple[float, float]] = {}
    for feature in geo.get("features", []):
        raw_id = (feature.get("properties") or {}).get("id")
        if raw_id is None:
            continue
        try:
            fips = str(int(raw_id)).zfill(2)
        except (TypeError, ValueError):
            continue

        # Use hardcoded centroids for special states
        if fips in SPECIAL_STATE_CENTROIDS:
            centroids[fips] = SPECIAL_STATE_CENTROIDS[fips]
            continue

        geometry = feature.get("geometry") or {}
        coords = geometry.get("coordinates")
        if not coords:
            continue
        min_lon = min_lat = float("inf")
        max_lon = max_lat = float("-inf")
        for lon, lat in _walk_coords(coords):
            if lon < min_lon:
                min_lon = lon
            if lon > max_lon:
                max_lon = lon
            if lat < min_lat:
                min_lat = lat
            if lat > max_lat:
                max_lat = lat
        if not (math.isfinite(min_lon) and math.isfinite(min_lat) and math.isfinite(max_lon) and math.isfinite(max_lat)):
            continue
        centroids[fips] = ((min_lat + max_lat) / 2.0, (min_lon + max_lon) / 2.0)
    _STATE_CENTROID_CACHE = centroids
    return centroids


FLOW_LEVELS = {"state", "county", "congress"}
FLOW_FILES = {
    "state": "state_flow.xlsx",
    "county": "county_flow.xlsx",
    "congress": "congress_flow.xlsx",
}
FLOW_CACHE_LIMIT = int(os.getenv("FLOW_CACHE_LIMIT", "2"))
# Columns aligned to refreshed Excel extracts in /data (older backend/data/flow configs removed)
FLOW_COLUMNS = {
    "state": [
        "rcpt_state_name",
        "subawardee_state_name",
        "naics_2digit_code",
        "naics_2digit_title",
        "agency_code",
        "agency_name",
        "subaward_amount_year",
    ],
    "county": [
        "rcpt_cty",
        "subawardee_cty",
        "rcpt_cty_name",
        "subawardee_cty_name",
        "rcpt_state",
        "subawardee_state",
        "rcpt_full_name",
        "subawardee_full_name",
        "act_dt_fis_yr",
        "subaward_amount",
        "agency_name",
        "origin_lat",
        "origin_lon",
        "dest_lat",
        "dest_lon",
    ],
    "congress": [
        "prime_awardee_stcd118",
        "subawardee_stcd118",
        "rcpt_cd_name",
        "subawardee_cd_name",
        "rcpt_state",
        "subawardee_state",
        "rcpt_full_name",
        "subawardee_full_name",
        "act_dt_fis_yr",
        "subaward_amount",
        "agency_name",
        "naics_2digit_code",
        "naics_2digit_title",
        "origin_lat",
        "origin_lon",
        "dest_lat",
        "dest_lon",
    ],
}
FLOW_NUMERIC_COLUMNS = {
    "state": [
        "subaward_amount_year",
    ],
    "county": [
        "origin_lat",
        "origin_lon",
        "dest_lat",
        "dest_lon",
        "subaward_amount",
        "act_dt_fis_yr",
        "rcpt_cty",
        "subawardee_cty",
    ],
    "congress": [
        "origin_lat",
        "origin_lon",
        "dest_lat",
        "dest_lon",
        "subaward_amount",
        "act_dt_fis_yr",
        "prime_awardee_stcd118",
        "subawardee_stcd118",
    ],
}
FLOW_FLOAT32_COLUMNS = {
    "state": ["origin_lat", "origin_lon", "dest_lat", "dest_lon"],
    "county": ["origin_lat", "origin_lon", "dest_lat", "dest_lon"],
    "congress": ["origin_lat", "origin_lon", "dest_lat", "dest_lon"],
}
FLOW_CATEGORY_COLUMNS = {
    "state": ["rcpt_state_name", "subawardee_state_name", "naics_2digit_title", "agency_name"],
    "county": ["rcpt_state", "subawardee_state", "agency_name"],
    "congress": ["rcpt_state", "subawardee_state", "agency_name", "naics_2digit_title"],
}


def _normalize_text(series: pd.Series) -> pd.Series:
    return series.astype("string").str.strip()


def _normalize_flow(level: str, df: pd.DataFrame) -> pd.DataFrame:
    if level == "state":
        centroids = state_centroids()
        origin_state = _normalize_text(df["rcpt_state_name"])
        dest_state = _normalize_text(df["subawardee_state_name"])
        origin_fips = origin_state.str.lower().map(STATE_NAME_TO_FIPS)
        dest_fips = dest_state.str.lower().map(STATE_NAME_TO_FIPS)
        industry_code = (
            _normalize_text(df["naics_2digit_code"]) if "naics_2digit_code" in df.columns
            else pd.Series([None] * len(df), dtype="string")
        )
        industry_title = (
            _normalize_text(df["naics_2digit_title"]) if "naics_2digit_title" in df.columns
            else _normalize_text(df["naics_4digit_title"]) if "naics_4digit_title" in df.columns
            else pd.Series([None] * len(df), dtype="string")
        )
        return pd.DataFrame({
            "origin_name": origin_state,
            "dest_name": dest_state,
            "origin_state": origin_state,
            "dest_state": dest_state,
            "origin_lat": origin_fips.map(lambda f: centroids.get(f, (None, None))[0] if f else None),
            "origin_lon": origin_fips.map(lambda f: centroids.get(f, (None, None))[1] if f else None),
            "dest_lat": dest_fips.map(lambda f: centroids.get(f, (None, None))[0] if f else None),
            "dest_lon": dest_fips.map(lambda f: centroids.get(f, (None, None))[1] if f else None),
            "amount": pd.to_numeric(df["subaward_amount_year"], errors="coerce"),
            "agency": _normalize_text(df["agency_name"]),
            "industry_code": industry_code,
            "industry": industry_title,
            "year": pd.Series([None] * len(df), dtype="Int16"),
        })
    if level == "congress":
        origin_name = df["rcpt_full_name"].fillna(df["rcpt_cd_name"])
        dest_name = df["subawardee_full_name"].fillna(df["subawardee_cd_name"])
        industry_code = (
            _normalize_text(df["naics_2digit_code"]) if "naics_2digit_code" in df.columns
            else pd.Series([None] * len(df), dtype="string")
        )
        industry_title = (
            _normalize_text(df["naics_2digit_title"]) if "naics_2digit_title" in df.columns
            else _normalize_text(df["Industry Title"]) if "Industry Title" in df.columns
            else pd.Series([None] * len(df), dtype="string")
        )
        return pd.DataFrame({
            "origin_name": _normalize_text(origin_name),
            "dest_name": _normalize_text(dest_name),
            "origin_state": _normalize_text(df["rcpt_state"]),
            "dest_state": _normalize_text(df["subawardee_state"]),
            "origin_lat": pd.to_numeric(df["origin_lat"], errors="coerce"),
            "origin_lon": pd.to_numeric(df["origin_lon"], errors="coerce"),
            "dest_lat": pd.to_numeric(df["dest_lat"], errors="coerce"),
            "dest_lon": pd.to_numeric(df["dest_lon"], errors="coerce"),
            "amount": pd.to_numeric(df["subaward_amount"], errors="coerce"),
            "agency": _normalize_text(df["agency_name"]),
            "industry_code": industry_code,
            "industry": industry_title,
            "year": pd.to_numeric(df["act_dt_fis_yr"], errors="coerce").round().astype("Int16"),
        })
    origin_name = df["rcpt_full_name"].fillna(df["rcpt_cty_name"])
    dest_name = df["subawardee_full_name"].fillna(df["subawardee_cty_name"])
    return pd.DataFrame({
        "origin_name": _normalize_text(origin_name),
        "dest_name": _normalize_text(dest_name),
        "origin_state": _normalize_text(df["rcpt_state"]),
        "dest_state": _normalize_text(df["subawardee_state"]),
        "origin_lat": pd.to_numeric(df["origin_lat"], errors="coerce"),
        "origin_lon": pd.to_numeric(df["origin_lon"], errors="coerce"),
        "dest_lat": pd.to_numeric(df["dest_lat"], errors="coerce"),
        "dest_lon": pd.to_numeric(df["dest_lon"], errors="coerce"),
        "amount": pd.to_numeric(df["subaward_amount"], errors="coerce"),
        "agency": _normalize_text(df["agency_name"]),
        "industry": pd.Series([None] * len(df)),
        "year": pd.to_numeric(df["act_dt_fis_yr"], errors="coerce").round().astype("Int16"),
    })


_FLOW_STATS_CACHE: Dict[str, dict] = {}


def load_flow(level: str) -> pd.DataFrame:
    if level not in FLOW_LEVELS:
        raise KeyError(level)
    entry = _FLOW_CACHE.get(level)
    signature = _flow_signature(level)
    if entry is not None and (_is_expired(entry[1]) or entry[2] != signature):
        _FLOW_CACHE.pop(level, None)
        if level in _FLOW_CACHE_ORDER:
            _FLOW_CACHE_ORDER.remove(level)
    if level not in _FLOW_CACHE:
        for cached_level in list(_FLOW_CACHE_ORDER):
            cached_entry = _FLOW_CACHE.get(cached_level)
            if cached_entry and _is_expired(cached_entry[1]):
                _FLOW_CACHE.pop(cached_level, None)
                _FLOW_CACHE_ORDER.remove(cached_level)
        while _FLOW_CACHE_ORDER and len(_FLOW_CACHE_ORDER) >= FLOW_CACHE_LIMIT:
            evict_level = _FLOW_CACHE_ORDER.pop(0)
            _FLOW_CACHE.pop(evict_level, None)
            _FLOW_STATS_CACHE.pop(evict_level, None)
        path = os.path.join(FLOW_DATA_DIR, FLOW_FILES[level])
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        keep_cols = FLOW_COLUMNS[level]
        df = pd.read_excel(path, usecols=keep_cols)
        for col in FLOW_NUMERIC_COLUMNS[level]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        for col in FLOW_FLOAT32_COLUMNS[level]:
            if col in df.columns:
                df[col] = df[col].astype("float32")
        if "act_dt_fis_yr" in df.columns:
            df["act_dt_fis_yr"] = df["act_dt_fis_yr"].round().astype("Int16")
        for col in ("rcpt_cty", "subawardee_cty"):
            if col in df.columns:
                df[col] = df[col].round().astype("Int32")
        for col in FLOW_CATEGORY_COLUMNS[level]:
            if col in df.columns:
                df[col] = df[col].astype("category")

        normalized = _normalize_flow(level, df)

        # Track data quality stats before filtering
        raw_count = len(normalized)
        normalized = normalized.dropna(subset=["origin_lat", "origin_lon", "dest_lat", "dest_lon", "amount"])
        missing_coords_count = raw_count - len(normalized)

        negative_amount_count = int((normalized["amount"] <= 0).sum())
        normalized = normalized[normalized["amount"] > 0]

        # Calculate internal flow stats before filtering them out
        internal_mask = (
            (normalized["origin_name"] == normalized["dest_name"])
            & (normalized["origin_state"] == normalized["dest_state"])
        )
        internal_flows = normalized[internal_mask]
        internal_flow_count = len(internal_flows)
        internal_flow_amount = float(internal_flows["amount"].sum()) if len(internal_flows) > 0 else 0.0

        # Store data quality stats for this level
        _FLOW_STATS_CACHE[level] = {
            "raw_record_count": raw_count,
            "filtered_missing_coords": missing_coords_count,
            "filtered_negative_amount": negative_amount_count,
            "internal_flow_count": internal_flow_count,
            "internal_flow_amount": internal_flow_amount,
        }

        _FLOW_CACHE[level] = (normalized, time.time(), signature)
        _FLOW_CACHE_ORDER.append(level)
    else:
        if level in _FLOW_CACHE_ORDER:
            _FLOW_CACHE_ORDER.remove(level)
            _FLOW_CACHE_ORDER.append(level)
    return _FLOW_CACHE[level][0]


def get_flow_data_quality_stats(level: str) -> dict:
    """Get data quality statistics for a flow level."""
    if level not in _FLOW_STATS_CACHE:
        load_flow(level)  # Ensure cache is populated
    return _FLOW_STATS_CACHE.get(level, {})


def clean_long_numeric(value):
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    raw = "".join(ch for ch in str(value) if ch.isdigit())
    if len(raw) < 5:
        return None
    first6 = int(raw[:6]) if len(raw) >= 6 else None
    first5 = int(raw[:5])
    if first6 is not None and 10000 <= first6 <= 200000:
        return float(first6)
    if 10000 <= first5 <= 200000:
        return float(first5)
    return None


def numeric_series(series: pd.Series) -> pd.Series:
    if series.dtype == object:
        raw = series.astype(str)
        digits_only = raw.str.fullmatch(r"\d+")
        long_ratio = raw.str.len().gt(10).mean()
        if digits_only.mean() > 0.8 and long_ratio > 0.2:
            cleaned = raw.apply(clean_long_numeric)
            return pd.to_numeric(cleaned, errors="coerce")
    return pd.to_numeric(series, errors="coerce")


def quantile_thresholds(values: List[float]) -> List[float]:
    clean = [v for v in values if v is not None and not math.isnan(v)]
    if not clean:
        return [0, 0, 0, 0]
    sorted_vals = sorted(clean)
    n = len(sorted_vals)
    def pct(p: float) -> float:
        idx = int(p * (n - 1))
        return float(sorted_vals[idx])
    return [pct(0.2), pct(0.4), pct(0.6), pct(0.8)]


def get_quintile(val: float, thresholds: List[float]) -> int:
    if val is None or math.isnan(val):
        return 0
    if val <= thresholds[0]:
        return 1
    if val <= thresholds[1]:
        return 2
    if val <= thresholds[2]:
        return 3
    if val <= thresholds[3]:
        return 4
    return 5


# Fixed quintile thresholds for fund flow amounts (in dollars)
# Using logarithmic scale appropriate for federal spending data
FIXED_FLOW_THRESHOLDS = [
    1_000_000,      # Q1: <= $1M
    10_000_000,     # Q2: <= $10M
    100_000_000,    # Q3: <= $100M
    1_000_000_000,  # Q4: <= $1B
    # Q5: > $1B
]

# Quantile-based thickness - subtle but differentiable
# Width range: 0.5 (Q1) to 2.5 (Q5) for subtle, elegant lines
FLOW_WIDTH_BY_QUINTILE = {
    1: 0.5,   # Q1: Smallest flows - hairline (<= $1M)
    2: 0.8,   # Q2: Below median (<= $10M)
    3: 1.2,   # Q3: Around median (<= $100M)
    4: 1.8,   # Q4: Above median (<= $1B)
    5: 2.5,   # Q5: Largest flows - visible but not heavy (> $1B)
}

FLOW_BUCKET_WIDTH_MULTIPLIER = {
    "top10": 1.15,
    "top50": 1.0,
    "50-100": 0.9,
    "100-150": 0.85,
    "150+": 0.8,
}


def width_from_quintile(quintile: int, bucket: Optional[str] = None) -> float:
    q = max(1, min(5, int(quintile) if quintile else 1))
    base = FLOW_WIDTH_BY_QUINTILE.get(q, 1.0)
    multiplier = FLOW_BUCKET_WIDTH_MULTIPLIER.get(bucket or "", 1.0)
    return base * multiplier


def compute_flow_thresholds(amounts: pd.Series) -> List[float]:
    if amounts is None or amounts.empty:
        return FIXED_FLOW_THRESHOLDS
    series = amounts.dropna()
    if series.size < 5:
        return FIXED_FLOW_THRESHOLDS
    quantiles = series.quantile([0.2, 0.4, 0.6, 0.8]).tolist()
    if any(not isinstance(val, (int, float)) for val in quantiles):
        return FIXED_FLOW_THRESHOLDS
    if any(val <= 0 for val in quantiles):
        return FIXED_FLOW_THRESHOLDS
    return [float(val) for val in quantiles]


def summarize(values: List[float]) -> dict:
    clean = [v for v in values if v is not None and not math.isnan(v)]
    if not clean:
        return {
            "count": 0,
            "min": None,
            "max": None,
            "mean": None,
            "median": None,
        }
    sorted_vals = sorted(clean)
    n = len(sorted_vals)
    mid = n // 2
    median = sorted_vals[mid] if n % 2 else (sorted_vals[mid - 1] + sorted_vals[mid]) / 2
    mean = sum(sorted_vals) / n
    return {
        "count": n,
        "min": float(sorted_vals[0]),
        "max": float(sorted_vals[-1]),
        "mean": float(mean),
        "median": float(median),
    }


def build_records(
    df: pd.DataFrame,
    level: str,
    variable: str,
    allowed_ids: Optional[set] = None,
) -> List[dict]:
    df = df.reset_index(drop=True)
    values = numeric_series(df[variable]).tolist()
    records = []
    filtered_values = []

    for idx, row in df.iterrows():
        raw_value = values[idx]
        value = None if pd.isna(raw_value) else float(raw_value)
        if level == "state":
            name = str(row["state"]).strip().lower()
            record_id = STATE_NAME_TO_FIPS.get(name)
            label = name.title() if name else "Unknown"
        elif level == "county":
            fips = row.get("fips", row.get("county_fips"))
            record_id = str(int(fips)).zfill(5) if not pd.isna(fips) else None
            county = str(row["county"]).strip().title() if row.get("county") else "Unknown"
            state = str(row["state"]).strip().lower() if row.get("state") else ""
            abbr = STATE_NAME_TO_ABBR.get(state, "")
            label = f"{county}, {abbr}" if abbr else county
        else:
            record_id = str(row["cd_118"]).strip().upper() if row.get("cd_118") else None
            label = record_id or "Unknown"

        if allowed_ids is not None and record_id not in allowed_ids:
            continue
        if value is not None:
            filtered_values.append(value)
        records.append({
            "id": record_id,
            "label": label,
            "value": value,
        })

    thresholds = quantile_thresholds(filtered_values)
    for record in records:
        record["quintile"] = (
            get_quintile(record["value"], thresholds)
            if record["value"] is not None
            else 0
        )

    return records, thresholds


@app.get("/api/datasets")
def list_datasets(request: Request):
    atlas_visible_dataset_keys = [key for key in DATASETS.keys() if key != "spending_breakdown"]
    payload = {
        "datasets": [
            {
                "key": key,
                "label": DATASETS[key]["label"],
                "levels": sorted(DATASET_LEVELS.get(key, LEVELS)),
            }
            for key in atlas_visible_dataset_keys
        ]
    }
    etag = _build_etag("datasets", ",".join(atlas_visible_dataset_keys))
    return _cached_json_response(request, payload, etag, LONG_CACHE_SECONDS)


@app.get("/api/health")
@limiter.limit("10/minute")
def health(request: Request):
    return {
        "status": "ok",
        "uptime_seconds": int(time.time() - APP_START_TIME),
        "cache": {
            "datasets": len(_DATA_CACHE),
            "geo": len(_GEO_CACHE),
            "flow": len(_FLOW_CACHE),
            "boundaries": len(_BOUNDARY_ID_CACHE),
            "ttl_seconds": CACHE_TTL_SECONDS,
            "geo_limit": GEO_CACHE_LIMIT,
        },
        "data_paths": {
            "atlas_processed": ATLAS_PROCESSED_DIR,
            "flow_data": FLOW_DATA_DIR,
            "spending_data": SPENDING_DATA_FILE,
        },
        "rate_limit_default": RATE_LIMIT_DEFAULT,
    }


@app.get("/api/spending/metadata")
def spending_metadata(request: Request) -> dict:
    payload = spending_metadata_payload()
    etag = _build_etag("spending-metadata", _spending_signature())
    return _cached_json_response(request, payload, etag, LONG_CACHE_SECONDS)


@app.get("/api/spending/state-summary")
def spending_state_summary(
    request: Request,
    year: str = Query(...),
    metric: str = Query(...),
) -> dict:
    metric_columns = spending_metric_sets()
    allowed_metrics = set(metric_columns["metrics"]) | set(metric_columns["per_capita_metrics"])
    if metric not in allowed_metrics:
        raise HTTPException(status_code=400, detail="Unknown metric")
    year_value = str(year).strip()
    grouped = spending_state_summary_records(year_value, metric, _spending_signature())
    if not grouped:
        raise HTTPException(status_code=404, detail="Year not found")
    payload = {
        "year": year_value,
        "metric": metric,
        "values": grouped,
    }
    etag = _build_etag("spending-summary", year_value, metric, _spending_signature())
    return _cached_json_response(request, payload, etag, SHORT_CACHE_SECONDS)


@app.get("/api/spending/state-detail")
def spending_state_detail(
    request: Request,
    state: str = Query(...),
    year: str = Query(...),
) -> dict:
    state_key = state.strip().upper()
    year_value = str(year).strip()
    detail = spending_state_detail_records(state_key, year_value, _spending_signature())
    if not detail:
        raise HTTPException(status_code=404, detail="State/year not found")
    payload = {
        "state": state_key,
        "year": year_value,
        "records": detail,
    }
    etag = _build_etag("spending-detail", state_key, year_value, _spending_signature())
    return _cached_json_response(request, payload, etag, SHORT_CACHE_SECONDS)


@app.get("/api/variables")
def list_variables(
    request: Request,
    dataset: str = Query(..., min_length=1, max_length=50),
    level: str = Query(..., min_length=1, max_length=20),
):
    validate_dataset_level(dataset, level)
    df = load_dataset(dataset, level)
    exclude = ID_COLUMNS[level]
    columns = [col for col in df.columns if col not in exclude and col != YEAR_COLUMN]
    if dataset == "census":
        adjusted = []
        for col in columns:
            if col in CENSUS_INCOME_REPLACEMENTS:
                replacement = CENSUS_INCOME_REPLACEMENTS[col]
                if replacement not in df.columns and replacement not in adjusted:
                    adjusted.append(replacement)
                continue
            adjusted.append(col)
        columns = adjusted
    years = list_years(df)
    payload = {"variables": columns, "years": years}
    etag = _build_etag("variables", dataset, level, _dataset_signature(dataset, level))
    return _cached_json_response(request, payload, etag, LONG_CACHE_SECONDS)


def build_values_payload(
    dataset: str,
    level: str,
    variable: str,
    year: Optional[str],
) -> dict:
    signature = _dataset_signature(dataset, level)
    cache_key = f"values:{dataset}:{level}:{variable}:{year}:{signature}"
    cached = _cache_get(_VALUES_CACHE, cache_key)
    if cached is not None:
        return cached
    df = load_dataset(dataset, level)

    df, selected_year = filter_dataset_year(df, year)

    if dataset == "census" and variable in CENSUS_DERIVED_VARIABLES and variable not in df.columns:
        total_col, less_col = CENSUS_DERIVED_VARIABLES[variable]
        if total_col not in df.columns or less_col not in df.columns:
            raise HTTPException(status_code=404, detail="Unknown variable")
        df = df.copy()
        df[variable] = numeric_series(df[total_col]) - numeric_series(df[less_col])
    elif variable not in df.columns:
        raise HTTPException(status_code=404, detail="Unknown variable")

    records, thresholds = build_records(
        df,
        level,
        variable,
        allowed_ids=boundary_ids(level, selected_year),
    )
    stats = summarize([r["value"] for r in records])

    sorted_records = [r for r in records if r["value"] is not None]
    sorted_records.sort(key=lambda x: x["value"], reverse=True)

    top = [
        {"label": r["label"], "value": r["value"]}
        for r in sorted_records[:10]
    ]
    bottom = [
        {"label": r["label"], "value": r["value"]}
        for r in sorted_records[-10:][::-1]
    ]

    payload = {
        "records": records,
        "thresholds": thresholds,
        "stats": stats,
        "top": top,
        "bottom": bottom,
        "year": selected_year,
    }
    _cache_set(_VALUES_CACHE, cache_key, payload, VALUES_CACHE_LIMIT)
    return payload


@app.get("/api/values")
def values(
    request: Request,
    dataset: str = Query(..., min_length=1, max_length=50),
    level: str = Query(..., min_length=1, max_length=20),
    variable: str = Query(..., min_length=1, max_length=120),
    year: Optional[str] = Query(None, max_length=32),
):
    validate_dataset_level(dataset, level)
    payload = build_values_payload(dataset, level, variable, year)
    etag = _build_etag("values", dataset, level, variable, year, _dataset_signature(dataset, level))
    return _cached_json_response(request, payload, etag, SHORT_CACHE_SECONDS)


@app.get("/api/download/atlas")
def download_atlas_dataset(
    dataset: str = Query(..., min_length=1, max_length=50),
    level: str = Query(..., min_length=1, max_length=20),
):
    validate_dataset_level(dataset, level, allow_spending_breakdown=False)
    path = dataset_path(dataset, level)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Dataset file not found")
    filename = os.path.basename(path)
    headers = _cache_headers(
        _build_etag("atlas-download", dataset, level, _dataset_signature(dataset, level)),
        LONG_CACHE_SECONDS,
    )
    return FileResponse(
        path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


@app.get("/api/download/atlas/view")
def download_atlas_view(
    dataset: str = Query(..., min_length=1, max_length=50),
    level: str = Query(..., min_length=1, max_length=20),
    variable: str = Query(..., min_length=1, max_length=120),
    year: Optional[str] = Query(None, max_length=32),
):
    validate_dataset_level(dataset, level, allow_spending_breakdown=False)
    payload = build_values_payload(dataset, level, variable, year)
    records = payload.get("records", [])
    selected_year = payload.get("year") or (year or "latest")
    export_df = pd.DataFrame(records)
    if not export_df.empty:
        export_df.insert(0, "dataset", dataset)
        export_df.insert(1, "level", level)
        export_df.insert(2, "variable", variable)
        export_df.insert(3, "year", selected_year)

    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        export_df.to_excel(writer, index=False, sheet_name="map_data")
    output.seek(0)
    filename = f"{dataset}_{level}_{variable}_{selected_year or 'latest'}.xlsx"
    headers = _cache_headers(
        _build_etag("atlas-view", dataset, level, variable, year, _dataset_signature(dataset, level)),
        SHORT_CACHE_SECONDS,
    )
    headers["Content-Disposition"] = f'attachment; filename=\"{filename}\"'
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


@app.get("/api/download/flow")
def download_flow_dataset(
    level: str = Query(..., min_length=1, max_length=20),
):
    if level not in FLOW_LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    path = os.path.join(FLOW_DATA_DIR, FLOW_FILES[level])
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Flow file not found")
    filename = os.path.basename(path)
    headers = _cache_headers(_build_etag("flow-download", level, _flow_signature(level)), LONG_CACHE_SECONDS)
    return FileResponse(
        path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


@app.get("/api/download/flow/view")
def download_flow_view(
    level: str = Query(..., min_length=1, max_length=20),
    agency: str = Query("All", max_length=120),
    state: str = Query("All", max_length=64),
    direction: str = Query("All", max_length=12),
    naics: str = Query("All", max_length=120),
    year_start: Optional[int] = Query(None, ge=1900, le=2100),
    year_end: Optional[int] = Query(None, ge=1900, le=2100),
    flow_bucket: Optional[str] = Query(None, max_length=20),
    offset: int = Query(0, ge=0, le=5000),
    limit: int = Query(50, ge=1, le=1000),
):
    data = build_flow_payload(
        level=level,
        agency=agency,
        state=state,
        direction=direction,
        naics=naics,
        year_start=year_start,
        year_end=year_end,
        flow_bucket=flow_bucket,
        offset=offset,
        limit=limit,
    )
    export_df = pd.DataFrame(data.get("flows", []))
    if not export_df.empty:
        export_df.insert(0, "level", level)
    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        export_df.to_excel(writer, index=False, sheet_name="map_data")
    output.seek(0)
    filename = f"flow_{level}_view.xlsx"
    headers = _cache_headers(
        _build_etag(
            "flow-view",
            level,
            agency,
            state,
            direction,
            naics,
            year_start,
            year_end,
            flow_bucket,
            offset,
            limit,
            _flow_signature(level),
        ),
        SHORT_CACHE_SECONDS,
    )
    headers["Content-Disposition"] = f'attachment; filename=\"{filename}\"'
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


@app.get("/api/geo/{level}")
def geo(request: Request, level: str, year: Optional[str] = Query(None, max_length=32)):
    if level not in LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    payload = load_geo(level, year)
    etag = _build_etag("geo", level, year, _geo_signature(level, year))
    return _cached_json_response(request, payload, etag, LONG_CACHE_SECONDS)


def _apply_flow_filters(
    df: pd.DataFrame,
    level: str,
    agency: str = "All",
    state: str = "All",
    direction: str = "All",
    industry: str = "All",
    year_start: Optional[int] = None,
    year_end: Optional[int] = None,
) -> pd.DataFrame:
    filtered = df
    if direction not in {"All", "Inflow", "Outflow"}:
        raise HTTPException(status_code=422, detail="Invalid direction")
    if year_start is not None and year_end is not None and year_start > year_end:
        raise HTTPException(status_code=422, detail="Invalid year range")
    if agency and agency != "All":
        filtered = filtered[filtered["agency"] == agency]

    if industry and industry != "All":
        if "industry" in filtered.columns:
            filtered = filtered[filtered["industry"] == industry]

    if level != "state":
        if year_start is not None:
            filtered = filtered[filtered["year"] >= year_start]
        if year_end is not None:
            filtered = filtered[filtered["year"] <= year_end]

    if state and state != "All":
        direction_key = direction.strip().lower() if isinstance(direction, str) else ""
        if direction_key in {"origin", "outflow"}:
            filtered = filtered[filtered["origin_state"] == state]
        elif direction_key in {"destination", "inflow"}:
            filtered = filtered[filtered["dest_state"] == state]
        else:
            filtered = filtered[
                (filtered["origin_state"] == state)
                | (filtered["dest_state"] == state)
            ]

    return filtered


@app.get("/api/flow/options")
def flow_options(
    request: Request,
    level: str = Query(..., min_length=1, max_length=20),
    agency: str = Query("All", max_length=120),
    state: str = Query("All", max_length=64),
    direction: str = Query("All", max_length=12),
    naics: str = Query("All", max_length=120),
    year_start: Optional[int] = Query(None, ge=1900, le=2100),
    year_end: Optional[int] = Query(None, ge=1900, le=2100),
):
    if level not in FLOW_LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    df = load_flow(level)
    agencies = sorted(df["agency"].dropna().unique().tolist())
    states = sorted(pd.unique(df[["origin_state", "dest_state"]].values.ravel("K")).tolist())
    states = [s for s in states if isinstance(s, str) and s]
    industries = sorted(df["industry"].dropna().unique().tolist()) if "industry" in df.columns else []
    years: List[int] = []
    if level != "state":
        years = sorted({int(y) for y in df["year"].dropna().tolist()})
    payload = {
        "agencies": agencies,
        "states": states,
        "industries": industries,
        "years": years,
    }
    etag = _build_etag("flow-options", level, _flow_signature(level))
    return _cached_json_response(request, payload, etag, SHORT_CACHE_SECONDS)


def build_flow_payload(
    level: str,
    agency: str,
    state: str,
    direction: str,
    naics: str,
    year_start: Optional[int],
    year_end: Optional[int],
    flow_bucket: Optional[str],
    offset: int,
    limit: int,
) -> dict:
    signature = _flow_signature(level)
    cache_key = (
        f"flow:{level}:{agency}:{state}:{direction}:{naics}:{year_start}:{year_end}:"
        f"{flow_bucket}:{offset}:{limit}:{signature}"
    )
    cached = _cache_get(_FLOW_RESULT_CACHE, cache_key)
    if cached is not None:
        return cached
    df = load_flow(level)
    filtered = _apply_flow_filters(
        df,
        level,
        agency=agency,
        state=state,
        direction=direction,
        industry=naics,
        year_start=year_start,
        year_end=year_end,
    )
    total_amount = float(filtered["amount"].fillna(0).sum())
    total_flows = int(len(filtered))
    unique_locations = pd.unique(
        pd.concat([filtered["origin_name"], filtered["dest_name"]], ignore_index=True).dropna()
    ).size

    internal_mask = (
        (filtered["origin_name"] == filtered["dest_name"])
        & (filtered["origin_state"] == filtered["dest_state"])
    )
    internal_flow_count = int(internal_mask.sum())
    internal_flow_amount = (
        float(filtered.loc[internal_mask, "amount"].sum()) if internal_flow_count > 0 else 0.0
    )
    filtered = filtered[~internal_mask]

    group_fields = [
        "origin_name",
        "dest_name",
        "origin_state",
        "dest_state",
        "origin_lat",
        "origin_lon",
        "dest_lat",
        "dest_lon",
    ]
    grouped = (
        filtered.groupby(group_fields, dropna=False, observed=True)
        .agg(amount_sum=("amount", "sum"), record_count=("amount", "size"))
        .reset_index()
    )
    if agency and agency != "All":
        grouped["agency_label"] = agency
    else:
        agency_group = (
            filtered.groupby(group_fields + ["agency"], dropna=False, observed=True)["amount"]
            .sum()
            .reset_index()
            .sort_values(by="amount", ascending=False)
        )
        top_agency = agency_group.drop_duplicates(subset=group_fields)[group_fields + ["agency"]]
        grouped = grouped.merge(top_agency, on=group_fields, how="left")
        agency_series = grouped["agency"]
        if isinstance(agency_series.dtype, pd.CategoricalDtype):
            agency_series = agency_series.astype("string")
        grouped["agency_label"] = agency_series.fillna("Multiple Agencies")

    if offset:
        grouped = grouped.sort_values(by="amount_sum", ascending=False)
    elif limit and limit > 0:
        grouped = grouped.nlargest(limit, "amount_sum")
    else:
        grouped = grouped.sort_values(by="amount_sum", ascending=False)
    max_amount = float(grouped["amount_sum"].max()) if len(grouped) else 0.0

    if offset:
        grouped = grouped.iloc[offset:]
    if offset and limit and limit > 0:
        grouped = grouped.head(limit)

    if flow_bucket:
        flow_thresholds = compute_flow_thresholds(grouped["amount_sum"])
    else:
        flow_thresholds = FIXED_FLOW_THRESHOLDS

    flows: List[dict] = []
    for _, row in grouped.iterrows():
        amount = float(row["amount_sum"])
        quintile = get_quintile(amount, flow_thresholds)
        width = width_from_quintile(quintile, flow_bucket)
        flow_id = f"{row['origin_name']}-{row['dest_name']}-{row['origin_state']}-{row['dest_state']}"
        flows.append({
            "id": str(flow_id),
            "origin_name": row["origin_name"],
            "dest_name": row["dest_name"],
            "origin_state": None if pd.isna(row["origin_state"]) else row["origin_state"],
            "dest_state": None if pd.isna(row["dest_state"]) else row["dest_state"],
            "origin_lat": float(row["origin_lat"]),
            "origin_lon": float(row["origin_lon"]),
            "dest_lat": float(row["dest_lat"]),
            "dest_lon": float(row["dest_lon"]),
            "amount": amount,
            "agency": row["agency_label"],
            "record_count": int(row["record_count"]),
            "quintile": quintile,
            "width": width,
        })

    payload = {
        "flows": flows,
        "stats": {
            "total_amount": total_amount,
            "total_flows": total_flows,
            "unique_locations": int(unique_locations),
            "max_amount": max_amount,
            "internal_flow_count": internal_flow_count,
            "internal_flow_amount": internal_flow_amount,
        },
        "thresholds": flow_thresholds,
    }
    _cache_set(_FLOW_RESULT_CACHE, cache_key, payload, FLOW_RESULT_CACHE_LIMIT)
    return payload


@app.get("/api/flow")
def flow_data(
    request: Request,
    level: str = Query(..., min_length=1, max_length=20),
    agency: str = Query("All", max_length=120),
    state: str = Query("All", max_length=64),
    direction: str = Query("All", max_length=12),
    naics: str = Query("All", max_length=120),
    year_start: Optional[int] = Query(None, ge=1900, le=2100),
    year_end: Optional[int] = Query(None, ge=1900, le=2100),
    flow_bucket: Optional[str] = Query(None, max_length=20),
    offset: int = Query(0, ge=0, le=5000),
    limit: int = Query(50, ge=1, le=1000),
):
    if level not in FLOW_LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    payload = build_flow_payload(
        level=level,
        agency=agency,
        state=state,
        direction=direction,
        naics=naics,
        year_start=year_start,
        year_end=year_end,
        flow_bucket=flow_bucket,
        offset=offset,
        limit=limit,
    )
    etag = _build_etag(
        "flow",
        level,
        agency,
        state,
        direction,
        naics,
        year_start,
        year_end,
        flow_bucket,
        offset,
        limit,
        _flow_signature(level),
    )
    return _cached_json_response(request, payload, etag, FLOW_CACHE_SECONDS)
