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
