import json
import math
import os
from typing import Dict, List

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
PROCESSED_DIR = os.path.join(PROJECT_ROOT, "processed")
DATA_DIR = os.path.join(BASE_DIR, "data")

DATASETS = {
    "census": {
        "label": "Census (ACS Demographics)",
        "dir": "census",
        "prefix": "acs",
    },
    "contract_static": {
        "label": "Contract Flow",
        "dir": "contract_static",
        "prefix": "contract",
    },
    "gov_spending": {
        "label": "Government Spending",
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


def dataset_path(dataset: str, level: str) -> str:
    info = DATASETS[dataset]
    filename = f"{info['prefix']}_{level}.xlsx"
    return os.path.join(PROCESSED_DIR, info["dir"], filename)


def load_dataset(dataset: str, level: str) -> pd.DataFrame:
    cache_key = f"{dataset}:{level}"
    if cache_key not in _DATA_CACHE:
        path = dataset_path(dataset, level)
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        _DATA_CACHE[cache_key] = pd.read_excel(path)
    return _DATA_CACHE[cache_key]


def load_geo(level: str) -> dict:
    if level not in _GEO_CACHE:
        filename = {
            "state": "states.geojson",
            "county": "counties.geojson",
            "congress": "congress.geojson",
        }[level]
        path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        with open(path, "r", encoding="utf-8") as f:
            _GEO_CACHE[level] = json.load(f)
    return _GEO_CACHE[level]


def numeric_series(series: pd.Series) -> pd.Series:
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
            name = str(row["state"]).lower()
            record_id = STATE_NAME_TO_FIPS.get(name)
            label = name.title() if name else "Unknown"
        elif level == "county":
            fips = row["fips"]
            record_id = str(int(fips)).zfill(5) if not pd.isna(fips) else None
            county = str(row["county"]).title() if row.get("county") else "Unknown"
            state = str(row["state"]).lower() if row.get("state") else ""
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
    columns = [col for col in df.columns if col not in exclude]
    return {"variables": columns}


@app.get("/api/values")
def values(dataset: str, level: str, variable: str):
    if dataset not in DATASETS:
        raise HTTPException(status_code=404, detail="Unknown dataset")
    if level not in LEVELS:
        raise HTTPException(status_code=404, detail="Unknown level")
    df = load_dataset(dataset, level)
    if variable not in df.columns:
        raise HTTPException(status_code=404, detail="Unknown variable")

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
