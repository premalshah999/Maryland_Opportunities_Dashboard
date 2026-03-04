import argparse
import sys
from pathlib import Path
from typing import Optional

import pandas as pd

ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR))

from backend import main as backend_main


PROCESSED_DIR = ROOT_DIR / "backend" / "data" / "atlas" / "processed"
VALID_STATE_FIPS = set(backend_main.STATE_NAME_TO_FIPS.values())


AMBIGUOUS_COUNTY_NAMES_BY_FIPS = {
    "24005": "baltimore county",
    "24510": "baltimore city",
    "29189": "st. louis county",
    "29510": "st. louis city",
    "51059": "fairfax county",
    "51600": "fairfax city",
    "51067": "franklin county",
    "51620": "franklin city",
    "51159": "richmond county",
    "51760": "richmond city",
    "51161": "roanoke county",
    "51770": "roanoke city",
}


def _normalize_year(value) -> Optional[str]:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if float(value).is_integer():
            return str(int(value))
    return str(value).strip()


def _normalize_fips(value) -> Optional[str]:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return str(int(float(value))).zfill(5)
    except (TypeError, ValueError):
        return str(value).strip()


def repair_gov_spending_county(path: Path, *, dry_run: bool) -> bool:
    df = pd.read_excel(path)
    if "year" in df.columns and "Year" not in df.columns:
        df = df.rename(columns={"year": "Year"})
    if "county_fips" in df.columns and "fips" not in df.columns:
        df = df.rename(columns={"county_fips": "fips"})

    if "fips" not in df.columns or "Year" not in df.columns:
        raise ValueError("Expected columns 'fips' and 'Year' in gov_county dataset.")

    df["Year"] = df["Year"].apply(_normalize_year)
    df["fips_norm"] = df["fips"].apply(_normalize_fips)

    key_cols = ["fips_norm", "Year"]
    duplicated = df.duplicated(subset=key_cols, keep=False)
    dup_df = df[duplicated].copy()
    if dup_df.empty:
        return False

    pop_col = "POPULATION"
    if pop_col not in df.columns:
        raise ValueError("Expected column 'POPULATION' to disambiguate duplicate rows.")

    keep_rows: list[pd.Series] = []
    seen_keys: set[tuple[str, str]] = set()

    for _, row in df.iterrows():
        key = (row["fips_norm"], row["Year"])
        if key in seen_keys:
            continue
        seen_keys.add(key)
        group = df[(df["fips_norm"] == key[0]) & (df["Year"] == key[1])]
        if len(group) == 1:
            keep_rows.append(group.iloc[0])
            continue
        if len(group) != 2:
            raise ValueError(f"Unexpected duplicate group size for {key}: {len(group)} rows")

        fips = key[0] or ""
        county_code = int(fips[-3:]) if fips[-3:].isdigit() else -1
        is_independent_city = county_code >= 500

        name_series = group["county"].astype(str).str.lower()
        has_city_token = name_series.str.contains(r"\bcity\b", regex=True)

        if has_city_token.any() and (~has_city_token).any():
            chosen = group[has_city_token].iloc[0] if is_independent_city else group[~has_city_token].iloc[0]
        else:
            pop_values = group[pop_col]
            chosen = (
                group.loc[pop_values.astype(float).idxmin()]
                if is_independent_city
                else group.loc[pop_values.astype(float).idxmax()]
            )

        keep_rows.append(chosen)

    repaired = pd.DataFrame(keep_rows).drop(columns=["fips_norm"])
    repaired["fips"] = repaired["fips"].apply(_normalize_fips)
    repaired["county"] = repaired.apply(
        lambda r: AMBIGUOUS_COUNTY_NAMES_BY_FIPS.get(str(r["fips"]), r["county"]), axis=1
    )

    if not dry_run:
        repaired.to_excel(path, index=False)

    return True


def repair_census_state(path: Path, *, dry_run: bool) -> bool:
    df = pd.read_excel(path)
    if "year" in df.columns and "Year" not in df.columns:
        df = df.rename(columns={"year": "Year"})
    if "Year" in df.columns:
        df["Year"] = df["Year"].apply(_normalize_year)

    if "state" not in df.columns:
        raise ValueError("Expected column 'state' in acs_state dataset.")

    state_series = df["state"].astype(str)
    missing = df["state"].isna() | (state_series.str.strip() == "") | (state_series.str.lower() == "nan")
    if not missing.any():
        return False

    repaired = df.loc[~missing].copy()
    if not dry_run:
        repaired.to_excel(path, index=False)
    return True


def drop_invalid_congress_ids(path: Path, *, dry_run: bool) -> bool:
    df = pd.read_excel(path)
    if "cd_118" not in df.columns:
        return False
    cd_series = df["cd_118"].astype(str).str.strip().str.upper()
    valid_mask = cd_series.str.match(r"^[A-Z]{2}-\d{2}$")
    cleaned = df.loc[valid_mask].copy()
    if len(cleaned) == len(df):
        return False
    if not dry_run:
        cleaned.to_excel(path, index=False)
    return True


def drop_invalid_county_ids(path: Path, *, dry_run: bool) -> bool:
    df = pd.read_excel(path)
    fips_col = "fips" if "fips" in df.columns else "county_fips" if "county_fips" in df.columns else None
    if not fips_col:
        return False
    fips_norm = df[fips_col].apply(_normalize_fips)
    valid_state = fips_norm.apply(lambda f: f[:2] if isinstance(f, str) else None).isin(VALID_STATE_FIPS)
    valid_mask = fips_norm.notna() & valid_state
    cleaned = df.loc[valid_mask].copy()
    if len(cleaned) == len(df):
        return False
    cleaned[fips_col] = fips_norm[valid_mask]
    if not dry_run:
        cleaned.to_excel(path, index=False)
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Repair known issues in processed dataset files.")
    parser.add_argument("--dry-run", action="store_true", help="Compute changes but do not write files.")
    args = parser.parse_args()

    changed = False

    gov_path = PROCESSED_DIR / "gov_spending" / "gov_county.xlsx"
    if gov_path.exists():
        changed = repair_gov_spending_county(gov_path, dry_run=args.dry_run) or changed

    census_state_path = PROCESSED_DIR / "census" / "acs_state.xlsx"
    if census_state_path.exists():
        changed = repair_census_state(census_state_path, dry_run=args.dry_run) or changed

    congress_paths = [
        PROCESSED_DIR / "contract_static" / "contract_congress.xlsx",
        PROCESSED_DIR / "contract_agency" / "contract_congress.xlsx",
        PROCESSED_DIR / "gov_spending" / "gov_congress.xlsx",
        PROCESSED_DIR / "Finra" / "finra_congress.xlsx",
    ]
    for path in congress_paths:
        if path.exists():
            changed = drop_invalid_congress_ids(path, dry_run=args.dry_run) or changed

    county_paths = [
        PROCESSED_DIR / "contract_static" / "contract_county.xlsx",
        PROCESSED_DIR / "contract_agency" / "contract_county.xlsx",
        PROCESSED_DIR / "gov_spending" / "gov_county.xlsx",
        PROCESSED_DIR / "Finra" / "finra_county.xlsx",
    ]
    for path in county_paths:
        if path.exists():
            changed = drop_invalid_county_ids(path, dry_run=args.dry_run) or changed

    if not changed:
        print("No changes needed.")


if __name__ == "__main__":
    main()
