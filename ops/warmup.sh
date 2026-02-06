#!/usr/bin/env bash
set -euo pipefail

# Optional: warm common caches after restart/deploy.
# Usage: BASE_URL=http://127.0.0.1:8000 bash ops/warmup.sh

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"

echo "Warming: /api/health"
curl -fsS "$BASE_URL/api/health" >/dev/null

echo "Warming: /api/datasets"
curl -fsS "$BASE_URL/api/datasets" >/dev/null

echo "DONE"

