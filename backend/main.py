import json
import math
import os
from typing import Dict, List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, os.pardir))
DATA_DIR = os.path.join(BASE_DIR, "data")
ATLAS_DIR = os.path.join(DATA_DIR, "atlas")
DEFAULT_ATLAS_PROCESSED_DIR = os.path.join(ATLAS_DIR, "processed")
ROOT_PROCESSED_DIR = os.path.join(ROOT_DIR, "processed")
ATLAS_PROCESSED_DIR = (
    ROOT_PROCESSED_DIR if os.path.exists(ROOT_PROCESSED_DIR) else DEFAULT_ATLAS_PROCESSED_DIR
)
ATLAS_BOUNDARIES_DIR = os.path.join(ATLAS_DIR, "boundaries")
FLOW_DATA_DIR = os.path.join(ROOT_DIR, "data")

DATASETS = {
    "census": {
        "label": "Census (ACS Demographics)",
        "dir": "census",
        "prefix": "acs",
    },
    "contract_static": {
        "label": "Federal Spending",
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
}

LEVELS = {"state", "county", "congress"}
YEAR_COLUMN = "Year"
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
    "state": {"state"},
    "county": {"county", "state", "fips"},
    "congress": {"cd_118"},
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
]

STATE_NAME_TO_ABBR = {name: abbr for name, _, abbr in STATE_META}
STATE_NAME_TO_FIPS = {name: fips for name, fips, _ in STATE_META}

app = FastAPI(title="Opportunity Atlas API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_DATA_CACHE: Dict[str, pd.DataFrame] = {}
_GEO_CACHE: Dict[str, dict] = {}
_GEO_CACHE_ORDER: List[str] = []
_FLOW_CACHE: Dict[str, pd.DataFrame] = {}
_FLOW_CACHE_ORDER: List[str] = []
_BOUNDARY_ID_CACHE: Dict[str, set] = {}
_STATE_CENTROID_CACHE: Optional[Dict[str, tuple[float, float]]] = None
GEO_CACHE_LIMIT = int(os.getenv("GEO_CACHE_LIMIT", "2"))


def dataset_path(dataset: str, level: str) -> str:
    info = DATASETS[dataset]
    filename = f"{info['prefix']}_{level}.xlsx"
    return os.path.join(ATLAS_PROCESSED_DIR, info["dir"], filename)


def load_dataset(dataset: str, level: str) -> pd.DataFrame:
    cache_key = f"{dataset}:{level}"
    if cache_key not in _DATA_CACHE:
        path = dataset_path(dataset, level)
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        _DATA_CACHE[cache_key] = pd.read_excel(path)
    return _DATA_CACHE[cache_key]


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
        normalized = normalize_year_value(raw)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        years.append(normalized)
    return years


def load_geo(level: str) -> dict:
    if level not in _GEO_CACHE:
        while _GEO_CACHE_ORDER and len(_GEO_CACHE_ORDER) >= GEO_CACHE_LIMIT:
            evict_level = _GEO_CACHE_ORDER.pop(0)
            _GEO_CACHE.pop(evict_level, None)
        filename = {
            "state": "states.geojson",
            "county": "counties.geojson",
            "congress": "congress.geojson",
        }[level]
        path = os.path.join(ATLAS_BOUNDARIES_DIR, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        with open(path, "r", encoding="utf-8") as f:
            _GEO_CACHE[level] = json.load(f)
        _GEO_CACHE_ORDER.append(level)
    else:
        if level in _GEO_CACHE_ORDER:
            _GEO_CACHE_ORDER.remove(level)
            _GEO_CACHE_ORDER.append(level)
    return _GEO_CACHE[level]


def boundary_ids(level: str) -> set:
    if level in _BOUNDARY_ID_CACHE:
        return _BOUNDARY_ID_CACHE[level]
    geo = load_geo(level)
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
    _BOUNDARY_ID_CACHE[level] = ids
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


# Hardcoded centroids for states that cross the International Date Line or have complex geometries
SPECIAL_STATE_CENTROIDS = {
    "02": (64.2008, -152.4937),  # Alaska - manually set to avoid date line issues
    "15": (20.7984, -156.3319),  # Hawaii - center of main islands
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
        "naics_4digit_title",
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
        "Industry Title",
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
    "state": ["rcpt_state_name", "subawardee_state_name", "naics_4digit_title", "agency_name"],
    "county": ["rcpt_state", "subawardee_state", "agency_name"],
    "congress": ["rcpt_state", "subawardee_state", "agency_name", "Industry Title"],
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
            "industry": _normalize_text(df["naics_4digit_title"]),
            "year": pd.Series([None] * len(df), dtype="Int16"),
        })
    if level == "congress":
        origin_name = df["rcpt_full_name"].fillna(df["rcpt_cd_name"])
        dest_name = df["subawardee_full_name"].fillna(df["subawardee_cd_name"])
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
            "industry": _normalize_text(df["Industry Title"]) if "Industry Title" in df.columns else pd.Series([None] * len(df)),
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


def load_flow(level: str) -> pd.DataFrame:
    if level not in FLOW_LEVELS:
        raise KeyError(level)
    if level not in _FLOW_CACHE:
        while _FLOW_CACHE_ORDER and len(_FLOW_CACHE_ORDER) >= FLOW_CACHE_LIMIT:
            evict_level = _FLOW_CACHE_ORDER.pop(0)
            _FLOW_CACHE.pop(evict_level, None)
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
        normalized = normalized.dropna(subset=["origin_lat", "origin_lon", "dest_lat", "dest_lon", "amount"])
        normalized = normalized[normalized["amount"] > 0]
        normalized = normalized[normalized["origin_name"] != normalized["dest_name"]]
        _FLOW_CACHE[level] = normalized
        _FLOW_CACHE_ORDER.append(level)
    else:
        if level in _FLOW_CACHE_ORDER:
            _FLOW_CACHE_ORDER.remove(level)
            _FLOW_CACHE_ORDER.append(level)
    return _FLOW_CACHE[level]


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


# Quantile-based thickness - subtle but differentiable
# Width range: 0.5 (Q1) to 2.5 (Q5) for subtle, elegant lines
FLOW_WIDTH_BY_QUINTILE = {
    1: 0.5,   # Q1: Smallest flows - hairline
    2: 0.8,   # Q2: Below median
    3: 1.2,   # Q3: Around median
    4: 1.8,   # Q4: Above median
    5: 2.5,   # Q5: Largest flows - visible but not heavy
}


def width_from_quintile(quintile: int) -> float:
    q = max(1, min(5, int(quintile) if quintile else 1))
    return FLOW_WIDTH_BY_QUINTILE.get(q, 1.0)


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
            fips = row["fips"]
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
def list_datasets():
    return {
        "datasets": [
            {"key": key, "label": info["label"]}
            for key, info in DATASETS.items()
        ]
    }


@app.get("/api/variables")
def list_variables(dataset: str, level: str):
    if dataset not in DATASETS:
        raise HTTPException(status_code=404, detail="Unknown dataset")
    if level not in LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
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
    return {"variables": columns, "years": years}


@app.get("/api/values")
def values(dataset: str, level: str, variable: str, year: Optional[str] = None):
    if dataset not in DATASETS:
        raise HTTPException(status_code=404, detail="Unknown dataset")
    if level not in LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    df = load_dataset(dataset, level)

    if YEAR_COLUMN in df.columns:
        available_years = list_years(df)
        selected_year = normalize_year_value(year) if year is not None else None
        if not selected_year and available_years:
            selected_year = available_years[-1]
        if selected_year:
            df = df[df[YEAR_COLUMN].apply(normalize_year_value) == selected_year]

    if dataset == "census" and variable in CENSUS_DERIVED_VARIABLES and variable not in df.columns:
        total_col, less_col = CENSUS_DERIVED_VARIABLES[variable]
        if total_col not in df.columns or less_col not in df.columns:
            raise HTTPException(status_code=404, detail="Unknown variable")
        df = df.copy()
        df[variable] = numeric_series(df[total_col]) - numeric_series(df[less_col])
    elif variable not in df.columns:
        raise HTTPException(status_code=404, detail="Unknown variable")

    records, thresholds = build_records(df, level, variable, allowed_ids=boundary_ids(level))
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

    return {
        "records": records,
        "thresholds": thresholds,
        "stats": stats,
        "top": top,
        "bottom": bottom,
    }


@app.get("/api/geo/{level}")
def geo(level: str):
    if level not in LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    return load_geo(level)


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
    level: str,
    agency: str = "All",
    state: str = "All",
    direction: str = "All",
    naics: str = "All",
    year_start: Optional[int] = None,
    year_end: Optional[int] = None,
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
    return {
        "agencies": agencies,
        "states": states,
        "industries": industries,
        "years": years,
    }


@app.get("/api/flow")
def flow_data(
    level: str,
    agency: str = "All",
    state: str = "All",
    direction: str = "All",
    naics: str = "All",
    year_start: Optional[int] = None,
    year_end: Optional[int] = None,
    limit: int = 300,
):
    if level not in FLOW_LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
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
        if pd.api.types.is_categorical_dtype(agency_series):
            agency_series = agency_series.astype("string")
        grouped["agency_label"] = agency_series.fillna("Multiple Agencies")

    grouped = grouped.sort_values(by="amount_sum", ascending=False)
    max_amount = float(grouped["amount_sum"].max()) if len(grouped) else 0.0

    # Calculate quintile thresholds based on all grouped amounts BEFORE limiting
    all_amounts = grouped["amount_sum"].dropna().tolist()
    flow_thresholds = quantile_thresholds(all_amounts)

    if limit and limit > 0:
        grouped = grouped.head(limit)

    flows: List[dict] = []
    for _, row in grouped.iterrows():
        amount = float(row["amount_sum"])
        quintile = get_quintile(amount, flow_thresholds)
        width = width_from_quintile(quintile)
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

    return {
        "flows": flows,
        "stats": {
            "total_amount": total_amount,
            "total_flows": total_flows,
            "unique_locations": int(unique_locations),
            "max_amount": max_amount,
        },
        "thresholds": flow_thresholds,
    }
