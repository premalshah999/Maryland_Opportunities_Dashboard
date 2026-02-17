import json
import tempfile
import zipfile
from pathlib import Path

import requests
import shapefile


ROOT_DIR = Path(__file__).resolve().parents[2]
BOUNDARIES_DIR = ROOT_DIR / "backend" / "data" / "atlas" / "boundaries"

SOURCE_URL = "https://www2.census.gov/geo/tiger/GENZ2021/shp/cb_2021_us_county_20m.zip"
LEGACY_SOURCE_URL = "https://www2.census.gov/geo/tiger/TIGER2012/COUNTY/tl_2012_us_county.zip"
TARGET_FILE = BOUNDARIES_DIR / "counties_legacy.geojson"
BASE_FILE = BOUNDARIES_DIR / "counties.geojson"
LEGACY_FIPS = {"02261", "02270", "46113", "51515"}
STATE_FIPS_TO_ABBR = {
    "02": "AK",
    "46": "SD",
    "51": "VA",
}


def round_coords(coords, places=5):
    if isinstance(coords, (list, tuple)):
        return [round_coords(c, places) for c in coords]
    if isinstance(coords, float):
        return round(coords, places)
    return coords


def fetch_ct_counties() -> list[dict]:
    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = Path(tmpdir) / "cb_2021_us_county_20m.zip"
        resp = requests.get(SOURCE_URL, timeout=60)
        resp.raise_for_status()
        zip_path.write_bytes(resp.content)
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(tmpdir)

        shp_path = next(Path(tmpdir).glob("cb_2021_us_county_20m.shp"))
        reader = shapefile.Reader(str(shp_path))
        fields = [f[0] for f in reader.fields[1:]]
        records = []
        for shape_record in reader.shapeRecords():
            record = dict(zip(fields, shape_record.record))
            if record.get("STATEFP") != "09":
                continue
            geoid = record.get("GEOID")
            name = record.get("NAME")
            geom = shape_record.shape.__geo_interface__
            geom["coordinates"] = round_coords(geom["coordinates"])
            records.append(
                {
                    "type": "Feature",
                    "properties": {
                        "id": geoid,
                        "name": name,
                        "statefp": record.get("STATEFP"),
                        "abbr": "CT",
                    },
                    "geometry": geom,
                }
            )
        return records


def fetch_legacy_counties() -> list[dict]:
    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = Path(tmpdir) / "tl_2012_us_county.zip"
        resp = requests.get(LEGACY_SOURCE_URL, timeout=120)
        resp.raise_for_status()
        zip_path.write_bytes(resp.content)
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(tmpdir)

        shp_path = next(Path(tmpdir).glob("tl_2012_us_county.shp"))
        reader = shapefile.Reader(str(shp_path), encoding="latin1")
        fields = [f[0] for f in reader.fields[1:]]
        records = []
        for shape_record in reader.shapeRecords():
            record = dict(zip(fields, shape_record.record))
            geoid = record.get("GEOID")
            if geoid not in LEGACY_FIPS:
                continue
            statefp = record.get("STATEFP")
            name = record.get("NAME")
            geom = shape_record.shape.__geo_interface__
            geom["coordinates"] = round_coords(geom["coordinates"])
            records.append(
                {
                    "type": "Feature",
                    "properties": {
                        "id": geoid,
                        "name": name,
                        "statefp": statefp,
                        "abbr": STATE_FIPS_TO_ABBR.get(statefp, ""),
                    },
                    "geometry": geom,
                }
            )
        return records


def main() -> None:
    if not BASE_FILE.exists():
        raise FileNotFoundError(BASE_FILE)
    base = json.loads(BASE_FILE.read_text())
    ct_features = fetch_ct_counties()
    legacy_features = fetch_legacy_counties()
    if not ct_features:
        raise RuntimeError("No CT county features found in source boundary file.")

    remaining = [
        feature
        for feature in base.get("features", [])
        if (feature.get("properties") or {}).get("statefp") != "09"
        and (feature.get("properties") or {}).get("id") not in LEGACY_FIPS
    ]
    merged = remaining + ct_features + legacy_features
    merged.sort(key=lambda f: (f.get("properties") or {}).get("id", ""))
    base["features"] = merged

    TARGET_FILE.write_text(json.dumps(base))
    print(f"Wrote {TARGET_FILE}")


if __name__ == "__main__":
    main()
