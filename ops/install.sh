#!/usr/bin/env bash
set -euo pipefail

# One-time server install script (run as root).
# Assumes repo already cloned to /opt/mop/app.

APP_DIR="${APP_DIR:-/opt/mop/app}"
VENV_DIR="${VENV_DIR:-/opt/mop/venv}"
DATA_DIR="${DATA_DIR:-/var/data/mop}"
APP_USER="${APP_USER:-bmgtmopadmin}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: install.sh must be run as root." >&2
  exit 1
fi

if [[ ! -d "$APP_DIR" ]]; then
  echo "ERROR: APP_DIR not found: $APP_DIR" >&2
  exit 1
fi

echo "[1/8] Installing OS packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  ca-certificates \
  git \
  nginx \
  python3 \
  python3-pip \
  python3-venv \
  rsync

echo "[2/8] Ensuring app user exists: $APP_USER"
if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "$APP_USER"
fi

echo "[3/8] Creating directories"
mkdir -p "$VENV_DIR" "$DATA_DIR"
mkdir -p "$DATA_DIR/atlas/processed" "$DATA_DIR/flow" "$DATA_DIR/spending"
chown -R "$APP_USER:$APP_USER" "$DATA_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "[4/8] Creating Python virtualenv + installing backend deps"
python3 -m venv "$VENV_DIR"
chown -R "$APP_USER:$APP_USER" "$VENV_DIR"
runuser -u "$APP_USER" -- "$VENV_DIR/bin/pip" install --upgrade pip wheel
runuser -u "$APP_USER" -- "$VENV_DIR/bin/pip" install -r "$APP_DIR/requirements.txt"

echo "[5/8] Copying data into $DATA_DIR (separates data from code)"
rsync -a --delete "$APP_DIR/backend/data/atlas/processed/" "$DATA_DIR/atlas/processed/"
rsync -a --delete "$APP_DIR/data/" "$DATA_DIR/flow/"
install -m 0644 "$APP_DIR/backend/data/spending_state_agency.xlsx" "$DATA_DIR/spending/spending_state_agency.xlsx"
chown -R "$APP_USER:$APP_USER" "$DATA_DIR"

echo "[6/8] Building frontend (Node 18+ required)"
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node not found. Install Node.js 18+ and re-run install.sh." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm not found. Install Node.js/npm and re-run install.sh." >&2
  exit 1
fi
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR/frontend' && npm ci && npm run build"

echo "[7/8] Installing systemd service + nginx site"
install -d -m 0755 /etc/mop
if [[ ! -f /etc/mop/mop.env ]]; then
  install -m 0644 "$APP_DIR/ops/mop.env.example" /etc/mop/mop.env
fi

install -m 0644 "$APP_DIR/ops/systemd/mop-api.service" /etc/systemd/system/mop-api.service
systemctl daemon-reload
systemctl enable mop-api

install -m 0644 "$APP_DIR/ops/nginx/mop.conf" /etc/nginx/sites-available/mop.conf
ln -sf /etc/nginx/sites-available/mop.conf /etc/nginx/sites-enabled/mop.conf
rm -f /etc/nginx/sites-enabled/default || true
nginx -t

echo "[8/8] Starting services"
systemctl restart mop-api
systemctl reload nginx

echo "DONE"
