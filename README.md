# Maryland Opportunity.

Interactive data atlas to compare demographic, fiscal, contract, and financial capability indicators across U.S. states, counties, and congressional districts.

## Quick Links

- Maintenance & deployment: `docs/MAINTENANCE.md`
- Ops (Nginx + systemd): `ops/README.md`

## Project Structure

- `frontend/` React + Vite client (map, sidebar, flow diagram).
- `frontend/src/components/`: UI modules grouped by `atlas/`, `flow/`, and `common/`.
- `backend/` FastAPI API with all datasets under `backend/data/`.
  - `backend/data/atlas/processed/`: cleaned XLSX data.
  - `backend/data/atlas/boundaries/`: geojson boundaries.
  - `backend/data/reference/`: variable dictionary and source references.
- `backend/data/spending_state_agency.xlsx`: raw state agency spending breakdown for charts.
- `data/`: refreshed flow datasets (`state_flow.xlsx`, `county_flow.xlsx`, `congress_flow.xlsx`) with 2-digit NAICS labels for state + congress.

## Local Development

Backend:
```bash
python -m pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Tests

```bash
python -m pip install -r backend/requirements-dev.txt
python -m pytest backend/tests -q
```

## Data Validation

Run the dataset sanity checks (IDs, duplicates, missing boundaries):
```bash
python backend/scripts/validate_data.py --warn-only
```

Repair known dataset anomalies (county/city duplicates, blank state rows, invalid IDs):
```bash
python backend/scripts/repair_processed_datasets.py
```

Rebuild year-specific congressional boundaries (cd112/cd116/cd118):
```bash
python backend/scripts/build_congress_geojsons.py
```

## Production Deployment

See `ops/README.md` for Nginx + systemd deployment on Ubuntu (Smith IT model).

## Data Sources

See `backend/data/reference/Variable_Dictionary_Full.xlsx` and `backend/data/reference/data_source_url.pdf` for variable definitions and data sources.
