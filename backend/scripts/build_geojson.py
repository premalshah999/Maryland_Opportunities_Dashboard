import io
import json
import os
import tempfile
import zipfile

import requests
import shapefile

BASE_URL = "https://www2.census.gov/geo/tiger/GENZ2022/shp"
FILES = {
    "state": "cb_2022_us_state_5m",
    "county": "cb_2022_us_county_5m",
    "congress": "cb_2022_us_cd118_5m",
}

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


def read_shapefile(name, field_filter=None, prop_builder=None):
    url = f"{BASE_URL}/{name}.zip"
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    with tempfile.TemporaryDirectory() as tmpdir:
        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            zf.extractall(tmpdir)
        shp_path = os.path.join(tmpdir, f"{name}.shp")
        reader = shapefile.Reader(shp_path)
        fields = [f[0] for f in reader.fields[1:]]
        features = []
        for sr, shape_obj in zip(reader.records(), reader.shapes()):
            props = dict(zip(fields, sr))
            if field_filter:
                props = {k: props[k] for k in field_filter if k in props}
            if prop_builder:
                props = prop_builder(props)
            features.append(shape_to_feature(shape_obj, props))
    return {"type": "FeatureCollection", "features": features}


def build_states(out_dir):
    name = FILES["state"]
    def props_fn(props):
        return {
            "id": props["STATEFP"],
            "name": props["NAME"],
            "abbr": props["STUSPS"],
        }
    return read_shapefile(name, field_filter=["STATEFP", "NAME", "STUSPS"], prop_builder=props_fn)


def build_counties(out_dir):
    name = FILES["county"]
    def props_fn(props):
        return {
            "id": props["GEOID"],
            "name": props["NAME"],
            "statefp": props["STATEFP"],
            "abbr": STATE_FIPS_TO_ABBR.get(props["STATEFP"], ""),
        }
    return read_shapefile(name, field_filter=["GEOID", "NAME", "STATEFP"], prop_builder=props_fn)


def build_congress(out_dir):
    name = FILES["congress"]
    def props_fn(props):
        statefp = props["STATEFP"]
        abbr = STATE_FIPS_TO_ABBR.get(statefp, "")
        district = str(props["CD118FP"]).zfill(2)
        cd = f"{abbr}-{district}" if abbr else props.get("GEOID", "")
        return {
            "id": cd,
            "cd_118": cd,
            "statefp": statefp,
            "district": district,
        }
    return read_shapefile(name, field_filter=["STATEFP", "CD118FP", "GEOID"], prop_builder=props_fn)


def write_geojson(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(base_dir, "data")
    os.makedirs(out_dir, exist_ok=True)

    states = build_states(out_dir)
    write_geojson(os.path.join(out_dir, "states.geojson"), states)

    counties = build_counties(out_dir)
    write_geojson(os.path.join(out_dir, "counties.geojson"), counties)

    congress = build_congress(out_dir)
    write_geojson(os.path.join(out_dir, "congress.geojson"), congress)


if __name__ == "__main__":
    main()
