# Maintenance Guide

This doc is for new maintainers who need to deploy, update data, or troubleshoot the Maryland Opportunity dashboard.

## Architecture

- **Frontend**: React + Vite static build served by Nginx.
- **Backend**: FastAPI served by Gunicorn with Uvicorn workers on `127.0.0.1:8000`.
- **Data**: Excel + GeoJSON stored under `/var/data/mop` (separated from code).

## Key Paths (Server)

- App checkout: `/opt/mop/app`
- Python venv: `/opt/mop/venv`
- Data: `/var/data/mop`
- Env file: `/etc/mop/mop.env`
- Gunicorn config: `/etc/mop/gunicorn.conf.py`
- Nginx site: `/etc/nginx/sites-available/mop.conf`
- Systemd service: `/etc/systemd/system/mop-api.service`

## Deploy Workflow

1. Push changes to the repo.
2. SSH to server.
3. Run:
   ```bash
   cd /opt/mop/app
   bash ops/deploy.sh
   ```

This pulls latest code, rebuilds frontend, refreshes `/var/data/mop`, restarts API, and reloads Nginx.

## Repo Access (Private or Moved)

- **Private repo**: use a deploy key or add a read-only collaborator for IT.
- **Move repo**: update server remote:
  ```bash
  cd /opt/mop/app
  git remote set-url origin <new_repo_url>
  git pull
  ```

## Data Updates

1. Replace processed files under `backend/data/atlas/processed/` and flow files under `data/`.
   - `contract_agency/` powers the **Federal Spending by Agency** dashboard.
2. Run dataset repair (fixes known county/city duplicates, blank state rows, drops invalid IDs):
   ```bash
   python backend/scripts/repair_processed_datasets.py
   ```
3. Validate:
   ```bash
   python backend/scripts/validate_data.py --warn-only
   ```
4. Commit + push, then deploy.

## County Boundaries (Connecticut)

Connecticut switched from counties to planning regions in 2022. The app handles this by using:

- `counties_legacy.geojson` for years `< 2022`
- `counties.geojson` (planning regions) for years `>= 2022`

The legacy file also injects historical FIPS that appear in older data (e.g., Shannon County 46113).
To regenerate the legacy file from Census cartographic boundaries + TIGER 2012:
```bash
python backend/scripts/build_county_legacy_geojson.py
```

Note: `contract_static` county data still uses legacy CT county FIPS for 2022+.
The API forces legacy county boundaries for that dataset so map IDs stay consistent.
`contract_agency` county data follows the same legacy mapping rule.

## Congressional District Boundaries (Year-Specific)

The congressional district map changed after the 2010 and 2020 censuses. The API selects a boundary file by year:

- **2010–2011** → `congress_cd112.geojson`
- **2012–2021** → `congress_cd116.geojson`
- **2022+** → `congress.geojson` (118th)

To rebuild the congress boundary files:
```bash
python backend/scripts/build_congress_geojsons.py
```

Note: FINRA data (2021) is keyed to 118th districts; the API overrides congress boundaries for `finra`
so those rows map correctly.

## Performance Tuning

Gunicorn is configured in `/etc/mop/gunicorn.conf.py` and reads:

- `MOP_GUNICORN_WORKERS` (default 3)
- `MOP_GUNICORN_THREADS` (default 1)
- `MOP_GUNICORN_TIMEOUT` (default 120)

Rule of thumb for 40–50 concurrent users:

- 2 vCPU: start at `3` workers
- 4 vCPU: start at `4` workers

Keep workers low to avoid memory pressure.

## Troubleshooting

Health check:
```bash
curl -fsS https://mop.rhsmith.umd.edu/api/health | jq .
```

Logs:
```bash
sudo journalctl -u mop-api -n 200 --no-pager
```

Nginx syntax:
```bash
sudo nginx -t
```
