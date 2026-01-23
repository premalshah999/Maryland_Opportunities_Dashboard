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
FLOW_DIR = os.path.join(DATA_DIR, "flow")
FLOW_FLOWS_DIR = os.path.join(FLOW_DIR, "flows")

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
        "label": "Contract Spending",
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
_FLOW_CACHE: Dict[str, pd.DataFrame] = {}


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
    return _GEO_CACHE[level]


FLOW_LEVELS = {"state", "county", "congress"}
FLOW_FILES = {
    "state": "state_flows.json",
    "county": "county_flows.json",
    "congress": "congress_flows.json",
}


def load_flow(level: str) -> pd.DataFrame:
    if level not in FLOW_LEVELS:
        raise KeyError(level)
    if level not in _FLOW_CACHE:
        path = os.path.join(FLOW_FLOWS_DIR, FLOW_FILES[level])
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        df = pd.read_json(path)
        if level == "state":
            numeric_cols = [
                "origin_lat",
                "origin_lon",
                "dest_lat",
                "dest_lon",
                "subaward_amount_year",
            ]
        else:
            numeric_cols = [
                "origin_lat",
                "origin_lon",
                "dest_lat",
                "dest_lon",
                "subaward_amount",
                "act_dt_fis_yr",
            ]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        _FLOW_CACHE[level] = df
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


def build_records(df: pd.DataFrame, level: str, variable: str) -> List[dict]:
    df = df.reset_index(drop=True)
    values = numeric_series(df[variable]).tolist()
    thresholds = quantile_thresholds(values)
    records = []

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

        quintile = get_quintile(value, thresholds) if value is not None else 0
        records.append({
            "id": record_id,
            "label": label,
            "value": value,
            "quintile": quintile,
        })

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
    years = list_years(df)
    return {"variables": columns, "years": years}


@app.get("/api/values")
def values(dataset: str, level: str, variable: str, year: Optional[str] = None):
    if dataset not in DATASETS:
        raise HTTPException(status_code=404, detail="Unknown dataset")
    if level not in LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    df = load_dataset(dataset, level)
    if variable not in df.columns:
        raise HTTPException(status_code=404, detail="Unknown variable")

    if YEAR_COLUMN in df.columns:
        available_years = list_years(df)
        selected_year = normalize_year_value(year) if year is not None else None
        if not selected_year and available_years:
            selected_year = available_years[-1]
        if selected_year:
            df = df[df[YEAR_COLUMN].apply(normalize_year_value) == selected_year]

    records, thresholds = build_records(df, level, variable)
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


def _flow_state_columns(level: str) -> tuple[str, str]:
    if level == "state":
        return "rcpt_state_name", "subawardee_state_name"
    return "rcpt_state", "subawardee_state"


def _flow_location_names(df: pd.DataFrame, level: str) -> tuple[pd.Series, pd.Series]:
    if level == "state":
        return df["rcpt_state_name"], df["subawardee_state_name"]
    if level == "congress":
        return df["rcpt_full_name"].fillna(df["rcpt_cd_name"]), df["subawardee_full_name"].fillna(df["subawardee_cd_name"])
    return df["rcpt_full_name"].fillna(df["rcpt_cty_name"]), df["subawardee_full_name"].fillna(df["subawardee_cty_name"])


def _coalesce(primary, fallback):
    return fallback if pd.isna(primary) or primary is None else primary


@app.get("/api/flow/options")
def flow_options(level: str):
    if level not in FLOW_LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    df = load_flow(level)
    agencies = sorted(df["agency_name"].dropna().unique().tolist())
    if level == "state":
        state_values = pd.unique(df[["rcpt_state_name", "subawardee_state_name"]].values.ravel("K"))
        industries = sorted(df["naics_nm"].dropna().unique().tolist())
        years: List[int] = []
    else:
        state_values = pd.unique(df[["rcpt_state", "subawardee_state"]].values.ravel("K"))
        industries = []
        years = sorted({int(y) for y in df["act_dt_fis_yr"].dropna().tolist()})
    states = sorted([s for s in state_values if isinstance(s, str) and s])
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
):
    if level not in FLOW_LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    df = load_flow(level)

    filtered = df
    if agency and agency != "All":
        filtered = filtered[filtered["agency_name"] == agency]

    if state and state != "All":
        origin_state_col, dest_state_col = _flow_state_columns(level)
        direction_key = direction.strip().lower() if isinstance(direction, str) else ""
        if direction_key in {"origin", "outflow"}:
            filtered = filtered[filtered[origin_state_col] == state]
        elif direction_key in {"destination", "inflow"}:
            filtered = filtered[filtered[dest_state_col] == state]
        else:
            filtered = filtered[
                (filtered[origin_state_col] == state)
                | (filtered[dest_state_col] == state)
            ]

    if level == "state" and naics and naics != "All":
        filtered = filtered[filtered["naics_nm"] == naics]

    if level != "state":
        if year_start is not None:
            filtered = filtered[filtered["act_dt_fis_yr"] >= year_start]
        if year_end is not None:
            filtered = filtered[filtered["act_dt_fis_yr"] <= year_end]

    if level == "state":
        filtered = filtered[filtered["rcpt_state_name"] != filtered["subawardee_state_name"]]
        amount_field = "subaward_amount_year"
    elif level == "congress":
        filtered = filtered[filtered["rcpt_cd_name"] != filtered["subawardee_cd_name"]]
        amount_field = "subaward_amount"
    else:
        filtered = filtered[filtered["rcpt_cty"] != filtered["subawardee_cty"]]
        amount_field = "subaward_amount"

    filtered = filtered.dropna(
        subset=["origin_lat", "origin_lon", "dest_lat", "dest_lon", amount_field]
    )
    filtered = filtered[filtered[amount_field] > 0]

    total_amount = float(filtered[amount_field].fillna(0).sum())
    total_flows = int(len(filtered))

    origin_names, dest_names = _flow_location_names(filtered, level)
    origin_state_col, dest_state_col = _flow_state_columns(level)
    filtered = filtered.assign(
        origin_name=origin_names,
        dest_name=dest_names,
        origin_state=filtered[origin_state_col],
        dest_state=filtered[dest_state_col],
    )
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
        filtered.groupby(group_fields, dropna=False)
        .agg(amount_sum=(amount_field, "sum"), record_count=(amount_field, "size"))
        .reset_index()
    )
    if agency and agency != "All":
        grouped["agency_label"] = agency
    else:
        agency_group = (
            filtered.groupby(group_fields + ["agency_name"], dropna=False)[amount_field]
            .sum()
            .reset_index()
            .sort_values(by=amount_field, ascending=False)
        )
        top_agency = agency_group.drop_duplicates(subset=group_fields)[group_fields + ["agency_name"]]
        grouped = grouped.merge(top_agency, on=group_fields, how="left")
        grouped["agency_label"] = grouped["agency_name"].fillna("Multiple Agencies")

    grouped = grouped.sort_values(by="amount_sum", ascending=False).head(100)
    display_flows: List[dict] = []
    for _, row in grouped.iterrows():
        flow_id = f"{row['origin_name']}-{row['dest_name']}-{row['origin_state']}-{row['dest_state']}"
        display_flows.append({
            "id": str(flow_id),
            "origin_name": row["origin_name"],
            "dest_name": row["dest_name"],
            "origin_state": None if pd.isna(row["origin_state"]) else row["origin_state"],
            "dest_state": None if pd.isna(row["dest_state"]) else row["dest_state"],
            "origin_lat": float(row["origin_lat"]),
            "origin_lon": float(row["origin_lon"]),
            "dest_lat": float(row["dest_lat"]),
            "dest_lon": float(row["dest_lon"]),
            "amount": float(row["amount_sum"]),
            "agency": row["agency_label"],
            "record_count": int(row["record_count"]),
        })

    return {
        "display_flows": display_flows,
        "aggregated_stats": {
            "total_amount": total_amount,
            "total_flows": total_flows,
            "unique_locations": int(unique_locations),
        },
    }
