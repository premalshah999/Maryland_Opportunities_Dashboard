import argparse
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd

ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR))

from backend import main


ID_COLUMN_BY_LEVEL = {
    "state": "state",
    "county": "fips",
    "congress": "cd_118",
}


def normalize_year(value) -> str:
    return main.normalize_year_value(value)


def normalize_id(value, level: str) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if level == "state":
        return str(value).strip().lower()
    if level == "county":
        try:
            return str(int(float(value))).zfill(5)
        except (TypeError, ValueError):
            return str(value).strip()
    return str(value).strip().upper()


def state_name_to_fips(name: str) -> str:
    return main.STATE_NAME_TO_FIPS.get(name)


def sample_values(values: List[str], limit: int = 10) -> List[str]:
    return values[:limit]


def check_dataset(dataset: str, level: str) -> Tuple[Dict[str, str], List[str]]:
    df = main.load_dataset(dataset, level)
    issues: List[str] = []
    summary: Dict[str, str] = {}

    id_col = ID_COLUMN_BY_LEVEL.get(level)
    if not id_col or id_col not in df.columns:
        id_col = next(iter(main.ID_COLUMNS[level]))
        issues.append(f"missing_expected_id_column:{ID_COLUMN_BY_LEVEL.get(level)}")

    year_col = main.YEAR_COLUMN if main.YEAR_COLUMN in df.columns else None
    if not year_col:
        issues.append("missing_year_column")

    if id_col not in df.columns:
        summary["rows"] = str(len(df))
        return summary, issues

    id_series = df[id_col].apply(lambda v: normalize_id(v, level))
    missing_id = int(id_series.isna().sum())
    if missing_id:
        issues.append(f"missing_id_rows:{missing_id}")

    if year_col:
        year_series = df[year_col].apply(normalize_year)
        duplicates = pd.DataFrame({"id": id_series, "year": year_series}).duplicated().sum()
        summary["years"] = ", ".join(sorted(y for y in year_series.dropna().unique()))
    else:
        duplicates = pd.DataFrame({"id": id_series}).duplicated().sum()

    if duplicates:
        issues.append(f"duplicate_id_year_rows:{int(duplicates)}")

    boundary = main.boundary_ids(level)
    if level == "state":
        fips_series = id_series.map(state_name_to_fips)
        missing_fips = int(fips_series.isna().sum())
        if missing_fips:
            issues.append(f"unmapped_state_names:{missing_fips}")
        missing_boundary = fips_series[(~fips_series.isna()) & (~fips_series.isin(boundary))].dropna()
    else:
        missing_boundary = id_series[(~id_series.isna()) & (~id_series.isin(boundary))].dropna()

    if not missing_boundary.empty:
        unique_missing = sorted(set(missing_boundary.tolist()))
        issues.append(
            f"missing_in_boundaries:{len(unique_missing)} sample={sample_values(unique_missing)}"
        )

    summary["rows"] = str(len(df))
    summary["missing_id"] = str(missing_id)
    summary["duplicates"] = str(int(duplicates))
    return summary, issues


def main_cli(warn_only: bool) -> int:
    issue_count = 0
    issue_map = defaultdict(list)

    for dataset in main.DATASETS:
        for level in sorted(main.LEVELS):
            summary, issues = check_dataset(dataset, level)
            key = f"{dataset}:{level}"
            line = (
                f"{key} rows={summary.get('rows', '0')}"
                + (f" years=[{summary.get('years')}]" if summary.get("years") else "")
                + f" missing_id={summary.get('missing_id', '0')}"
                + f" duplicates={summary.get('duplicates', '0')}"
            )
            print(line)
            if issues:
                issue_count += len(issues)
                issue_map[key].extend(issues)

    if issue_map:
        print("\nIssues:")
        for key, issues in issue_map.items():
            print(f"- {key}")
            for issue in issues:
                print(f"  - {issue}")

    if issue_count and not warn_only:
        return 1
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate atlas datasets.")
    parser.add_argument(
        "--warn-only",
        action="store_true",
        help="Always exit 0 even if issues are found.",
    )
    args = parser.parse_args()
    raise SystemExit(main_cli(args.warn_only))
