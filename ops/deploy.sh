#!/usr/bin/env bash
set -euo pipefail

# Deploy script (recommended to run as bmgtmopadmin).
# Requires limited sudo for restarting services and reloading nginx.

APP_DIR="${APP_DIR:-/opt/mop/app}"
VENV_DIR="${VENV_DIR:-/opt/mop/venv}"
DATA_DIR="${DATA_DIR:-/var/data/mop}"

cd "$APP_DIR"

echo "[1/6] Updating repo"
git pull --ff-only

echo "[2/6] Updating backend dependencies"
"$VENV_DIR/bin/pip" install -r "$APP_DIR/requirements.txt"

echo "[3/6] Building frontend"
cd "$APP_DIR/frontend"
npm ci
npm run build

echo "[4/6] Refreshing data in $DATA_DIR"
mkdir -p "$DATA_DIR/atlas/processed" "$DATA_DIR/flow" "$DATA_DIR/spending"
rsync -a --delete "$APP_DIR/backend/data/atlas/processed/" "$DATA_DIR/atlas/processed/"
rsync -a --delete "$APP_DIR/data/" "$DATA_DIR/flow/"
install -m 0644 "$APP_DIR/backend/data/spending_state_agency.xlsx" "$DATA_DIR/spending/spending_state_agency.xlsx"

echo "[5/6] Restarting API"
sudo systemctl restart mop-api

echo "[6/6] Reloading Nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "DONE"

