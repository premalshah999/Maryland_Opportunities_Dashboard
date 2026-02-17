import io
import json
import os
import tempfile
import zipfile
from pathlib import Path

import requests
import shapefile


ROOT_DIR = Path(__file__).resolve().parents[2]
BOUNDARIES_DIR = ROOT_DIR / "backend" / "data" / "atlas" / "boundaries"

STATE_FIPS_TO_ABBR = {
    "01": "AL",
    "02": "AK",
    "04": "AZ",
    "05": "AR",
    "06": "CA",
    "08": "CO",
    "09": "CT",
    "10": "DE",
    "11": "DC",
    "12": "FL",
    "13": "GA",
    "15": "HI",
    "16": "ID",
    "17": "IL",
    "18": "IN",
    "19": "IA",
    "20": "KS",
    "21": "KY",
    "22": "LA",
    "23": "ME",
    "24": "MD",
    "25": "MA",
    "26": "MI",
    "27": "MN",
    "28": "MS",
    "29": "MO",
    "30": "MT",
    "31": "NE",
    "32": "NV",
    "33": "NH",
    "34": "NJ",
    "35": "NM",
    "36": "NY",
    "37": "NC",
    "38": "ND",
    "39": "OH",
    "40": "OK",
    "41": "OR",
    "42": "PA",
    "44": "RI",
    "45": "SC",
    "46": "SD",
    "47": "TN",
    "48": "TX",
    "49": "UT",
    "50": "VT",
    "51": "VA",
    "53": "WA",
    "54": "WV",
    "55": "WI",
    "56": "WY",
    "60": "AS",
    "66": "GU",
    "69": "MP",
    "72": "PR",
    "78": "VI",
}


SOURCES = {
    "cd112": {
        "url": "https://www2.census.gov/geo/tiger/TIGER2012/CD/tl_2012_us_cd112.zip",
        "state_field": "STATEFP",
        "district_field": "CD112FP",
        "cd_key": "cd_112",
    },
    "cd116": {
        "url": "https://www2.census.gov/geo/tiger/GENZ2020/shp/cb_2020_us_cd116_5m.zip",
        "state_field": "STATEFP",
        "district_field": "CD116FP",
        "cd_key": "cd_116",
    },
    "cd118": {
        "url": "https://www2.census.gov/geo/tiger/GENZ2022/shp/cb_2022_us_cd118_5m.zip",
        "state_field": "STATEFP",
        "district_field": "CD118FP",
        "cd_key": "cd_118",
    },
}


def round_coords(coords, places=5):
    if isinstance(coords, (list, tuple)):
        return [round_coords(c, places) for c in coords]
    if isinstance(coords, float):
        return round(coords, places)
    return coords


def shape_to_feature(shape_obj, props):
    geom = shape_obj.__geo_interface__
    geom["coordinates"] = round_coords(geom["coordinates"])
    return {
        "type": "Feature",
        "properties": props,
        "geometry": geom,
    }


def read_shapefile(url, *, state_field: str, district_field: str, cd_key: str):
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    with tempfile.TemporaryDirectory() as tmpdir:
        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            zf.extractall(tmpdir)
        shp_path = next(Path(tmpdir).glob("*.shp"))
        reader = shapefile.Reader(str(shp_path), encoding="latin1")
        fields = [f[0] for f in reader.fields[1:]]
        features = []
        for sr, shape_obj in zip(reader.records(), reader.shapes()):
            props = dict(zip(fields, sr))
            statefp = props.get(state_field)
            district_raw = props.get(district_field)
            abbr = STATE_FIPS_TO_ABBR.get(statefp, "")
            if not abbr:
                continue
            district = str(district_raw).zfill(2)
            cd = f"{abbr}-{district}"
            record = {
                "id": cd,
                cd_key: cd,
                "statefp": statefp,
                "district": district,
            }
            features.append(shape_to_feature(shape_obj, record))
    return {"type": "FeatureCollection", "features": features}


def write_geojson(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))


def main():
    os.makedirs(BOUNDARIES_DIR, exist_ok=True)
    for variant, source in SOURCES.items():
        geo = read_shapefile(
            source["url"],
            state_field=source["state_field"],
            district_field=source["district_field"],
            cd_key=source["cd_key"],
        )
        if variant == "cd118":
            out_path = BOUNDARIES_DIR / "congress.geojson"
        else:
            out_path = BOUNDARIES_DIR / f"congress_{variant}.geojson"
        write_geojson(out_path, geo)
        print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
