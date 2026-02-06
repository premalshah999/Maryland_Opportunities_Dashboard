# MOP Deployment (Smith IT)

This repo contains a single web application:

- **Frontend**: React (Vite) static build served by **Nginx**
- **Backend**: FastAPI served by **Gunicorn (ASGI via UvicornWorker)** behind Nginx
- **Data**: Excel + GeoJSON files (can live in `/var/data/mop`)

These scripts are designed to match a long-lived, patchable Ubuntu deployment (no Docker required).

## Assumed server targets

- Hostname: `mop.rhsmith.umd.edu`
- OS: Ubuntu 24.04
- SSL cert/key paths:
  - cert: `/etc/ssl/mop.crt`
  - key: `/etc/ssl/mop.key`
- App admin service account: `bmgtmopadmin`
- Data directory: `/var/data/mop`
- App checkout directory: `/opt/mop/app`
- Python venv: `/opt/mop/venv`

You can change these by editing the scripts below or setting environment variables.

## One-time install (root)

1) Clone the repo:

```bash
sudo mkdir -p /opt/mop
sudo chown -R bmgtmopadmin:bmgtmopadmin /opt/mop
sudo -u bmgtmopadmin git clone <REPO_URL> /opt/mop/app
```

2) Run install:

```bash
sudo bash /opt/mop/app/ops/install.sh
```

This will:

- Install OS packages (python tooling, nginx, git)
- Create `/opt/mop/venv` and install Python deps
- Build the frontend (`npm ci` + `npm run build`)
- Copy datasets into `/var/data/mop` (so data is separated from code)
- Install `systemd` service and Nginx site config
- Start the API and reload Nginx

## Deploy updates (bmgtmopadmin)

```bash
cd /opt/mop/app
bash ops/deploy.sh
```

The deploy script:

- `git pull --ff-only`
- updates Python deps
- rebuilds the frontend
- refreshes `/var/data/mop` from the repo data (safe overwrite)
- restarts the API and reloads Nginx

For least-privilege operation, grant `bmgtmopadmin` `sudo` access only for:

- `systemctl restart mop-api`
- `systemctl reload nginx`
- `nginx -t`
- `journalctl -u mop-api -n 200 --no-pager`

An example sudoers snippet is provided at `ops/sudoers/mop`.

## Environment variables

The API reads config from `/etc/mop/mop.env` if present.

- Copy the example:

```bash
sudo mkdir -p /etc/mop
sudo cp /opt/mop/app/ops/mop.env.example /etc/mop/mop.env
sudo chown root:root /etc/mop/mop.env
sudo chmod 0644 /etc/mop/mop.env
```

Key settings:

- `ATLAS_PROCESSED_DIR=/var/data/mop/atlas/processed`
- `FLOW_DATA_DIR=/var/data/mop/flow`
- `SPENDING_DATA_FILE=/var/data/mop/spending/spending_state_agency.xlsx`
- `CORS_ALLOWED_ORIGINS=https://mop.rhsmith.umd.edu`

## Quick health checks

```bash
curl -fsS https://mop.rhsmith.umd.edu/api/health | jq .
```

Check service logs:

```bash
sudo journalctl -u mop-api -n 200 --no-pager
```

## Rollback

- `git checkout <previous_commit>`
- run `bash ops/deploy.sh`
