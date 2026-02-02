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
