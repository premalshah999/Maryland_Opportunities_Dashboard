import sys
from pathlib import Path

from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR))

from backend.main import app


client = TestClient(app)


def test_list_datasets():
    response = client.get("/api/datasets")
    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    assert isinstance(data["datasets"], list)
    keys = {item["key"] for item in data["datasets"]}
    assert "spending_breakdown" not in keys
    assert "contract_static" in keys
    assert "contract_agency" in keys


def test_variables_invalid_level():
    response = client.get("/api/variables", params={"dataset": "census", "level": "bad"})
    assert response.status_code == 404


def test_values_invalid_dataset():
    response = client.get("/api/values", params={"dataset": "bad", "level": "state", "variable": "x"})
    assert response.status_code == 404


def test_flow_options_state():
    response = client.get("/api/flow/options", params={"level": "state"})
    assert response.status_code == 200
    data = response.json()
    assert "agencies" in data
    assert "states" in data


def test_flow_data_state():
    response = client.get("/api/flow", params={"level": "state"})
    assert response.status_code == 200
    data = response.json()
    assert "flows" in data
    assert "stats" in data


def test_flow_data_range():
    response = client.get("/api/flow", params={"level": "state", "offset": 50, "limit": 50})
    assert response.status_code == 200
    data = response.json()
    assert "flows" in data


def test_health_details():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "uptime_seconds" in data
    assert "cache" in data


def test_spending_metadata_summary_and_detail():
    metadata_response = client.get("/api/spending/metadata")
    assert metadata_response.status_code == 200
    metadata = metadata_response.json()
    assert metadata["years"]
    assert metadata["metrics"]

    year = metadata["years"][-1]
    metric = metadata["metrics"][0]

    summary_response = client.get(
        "/api/spending/state-summary",
        params={"year": year, "metric": metric},
    )
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["year"] == year
    assert summary["metric"] == metric
    assert isinstance(summary["values"], list)
    assert summary["values"]

    first_state = summary["values"][0]["state"]
    detail_response = client.get(
        "/api/spending/state-detail",
        params={"state": first_state, "year": year},
    )
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["state"] == first_state
    assert detail["year"] == year
    assert isinstance(detail["records"], list)
    assert detail["records"]
    assert "agency" in detail["records"][0]


def test_spending_summary_invalid_metric():
    response = client.get(
        "/api/spending/state-summary",
        params={"year": "2024", "metric": "agency"},
    )
    assert response.status_code == 400


def test_contract_static_new_schema_variables_and_values():
    variables_response = client.get(
        "/api/variables",
        params={"dataset": "contract_static", "level": "state"},
    )
    assert variables_response.status_code == 200
    payload = variables_response.json()
    variables = payload["variables"]
    years = payload["years"]
    assert "Contracts" in variables
    assert "Grants" in variables
    assert "Resident Wage" in variables
    assert "state_fips" not in variables
    assert years

    values_response = client.get(
        "/api/values",
        params={
            "dataset": "contract_static",
            "level": "county",
            "variable": "Contracts",
            "year": years[-1],
        },
    )
    assert values_response.status_code == 200
    values_payload = values_response.json()
    assert values_payload["records"]
    first = values_payload["records"][0]
    assert first["id"] is not None
    assert "value" in first


def test_contract_agency_variables_agencies_and_values():
    variables_response = client.get(
        "/api/variables",
        params={"dataset": "contract_agency", "level": "state"},
    )
    assert variables_response.status_code == 200
    payload = variables_response.json()
    variables = payload["variables"]
    years = payload["years"]
    assert "Contracts" in variables
    assert "agency" not in variables
    assert years

    agencies_response = client.get(
        "/api/agencies",
        params={
            "dataset": "contract_agency",
            "level": "state",
            "year": years[-1],
            "metric": "Contracts",
            "limit": 10,
        },
    )
    assert agencies_response.status_code == 200
    agencies_payload = agencies_response.json()
    assert agencies_payload["agencies"]
    selected_agency = agencies_payload["agencies"][0]

    values_response = client.get(
        "/api/values",
        params={
            "dataset": "contract_agency",
            "level": "state",
            "variable": "Contracts",
            "year": years[-1],
            "agency": selected_agency,
        },
    )
    assert values_response.status_code == 200
    values_payload = values_response.json()
    assert values_payload["records"]
    assert values_payload["agency"] == selected_agency


def test_download_endpoints():
    dataset_response = client.get("/api/download/atlas", params={"dataset": "census", "level": "state"})
    assert dataset_response.status_code == 200
    assert dataset_response.headers.get("content-type", "").startswith(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    variables_payload = client.get("/api/variables", params={"dataset": "census", "level": "state"}).json()
    variable = variables_payload["variables"][0]
    year = variables_payload["years"][-1]

    view_response = client.get(
        "/api/download/atlas/view",
        params={"dataset": "census", "level": "state", "variable": variable, "year": year},
    )
    assert view_response.status_code == 200

    flow_response = client.get("/api/download/flow", params={"level": "state"})
    assert flow_response.status_code == 200

    flow_view_response = client.get("/api/download/flow/view", params={"level": "state", "limit": 5})
    assert flow_view_response.status_code == 200
