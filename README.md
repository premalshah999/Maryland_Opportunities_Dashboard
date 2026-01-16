# Maryland Opportunity.

Interactive data atlas to compare demographic, fiscal, contract, and financial capability indicators across U.S. states, counties, and congressional districts.

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

## Vercel Deployment

This repo is Vercel-ready via `vercel.json` (builds the Vite app under `frontend/`).

1) Push to GitHub.
2) Import into Vercel.
3) Optional: set `VITE_API_BASE_URL` if you are hosting the backend elsewhere.

Example:
```
VITE_API_BASE_URL=https://your-backend.example.com
```

> For prototype deployments, Vercel serves the FastAPI backend as serverless functions under `/api/*`.

## Data Sources

See `Variable_Dictionary_Full.xlsx` and `data_source_url.pdf` for variable definitions and data sources.
