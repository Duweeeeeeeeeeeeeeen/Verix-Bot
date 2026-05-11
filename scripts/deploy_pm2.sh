#!/usr/bin/env bash
set -euo pipefail

cd /root/Verix-Bot
git pull --ff-only origin main

cd /root/Verix-Bot/dashboard/client
npm run build

cd /root/Verix-Bot
pm2 delete verix-bot verix-dashboard-client || true
pm2 start ecosystem.config.cjs --update-env
pm2 save

for attempt in {1..12}; do
  if curl -fsS --max-time 10 http://localhost:5001/api/health >/tmp/verix-health.json; then
    break
  fi

  if [[ "$attempt" -eq 12 ]]; then
    echo "Health check failed after ${attempt} attempts." >&2
    exit 1
  fi

  sleep 5
done

cat /tmp/verix-health.json
