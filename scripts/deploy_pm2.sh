#!/usr/bin/env bash
set -euo pipefail

cd /root/Verix-Bot
git pull --ff-only origin main

cd /root/Verix-Bot/dashboard/client
npm run build

cd /root/Verix-Bot
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

curl -fsS --max-time 20 http://localhost:5001/api/health >/tmp/verix-health.json
cat /tmp/verix-health.json
