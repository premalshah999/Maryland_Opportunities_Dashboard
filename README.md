# Maryland Opportunity.

Interactive data atlas to compare demographic, fiscal, contract, and financial capability indicators across U.S. states, counties, and congressional districts.

## Project Structure

- `frontend/` React + Vite client (map, sidebar, flow diagram).
- `backend/` FastAPI API with all datasets under `backend/data/`.
  - `backend/data/atlas/processed/`: cleaned XLSX data.
  - `backend/data/atlas/boundaries/`: geojson boundaries.
  - `backend/data/reference/`: variable dictionary and source references.
- `data/`: refreshed flow datasets (`state_flow.xlsx`, `county_flow.xlsx`, `congress_flow.xlsx`).

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

## Data Validation

Run the dataset sanity checks (IDs, duplicates, missing boundaries):
```bash
python backend/scripts/validate_data.py --warn-only
```

## Data Sources

See `backend/data/reference/Variable_Dictionary_Full.xlsx` and `backend/data/reference/data_source_url.pdf` for variable definitions and data sources.
