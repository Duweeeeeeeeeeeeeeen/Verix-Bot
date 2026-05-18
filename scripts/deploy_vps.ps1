param(
    [string]$Vps = "root@178.104.245.26",
    [string]$RemotePath = "/root/Verix-Bot",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

Write-Output "Deploying Verix Bot from origin/$Branch to $Vps..."

$remoteScript = @"
set -euo pipefail

cd "$RemotePath"
mkdir -p /root/backups

backup_name="/root/backups/verix-before-deploy-`$(date +%Y%m%d-%H%M%S).tar.gz"
tar \
  --exclude='Verix-Bot/node_modules' \
  --exclude='Verix-Bot/dashboard/client/node_modules' \
  --exclude='Verix-Bot/dashboard/client/.next' \
  -czf "`$backup_name" -C /root Verix-Bot
echo "Backup created: `$backup_name"

git fetch origin "$Branch"
git reset --hard "origin/$Branch"
git clean -fd -- \
  src \
  dashboard/api \
  dashboard/client/src \
  dashboard/client/public \
  scripts

npm install --omit=dev

cd dashboard/client
npm install --omit=dev
npm run build

cd "$RemotePath"
pm2 restart verix-bot verix-dashboard-client
pm2 save

curl -fsS https://verixbot.com/api/health
pm2 status --no-color
"@

$remoteScript | ssh -o BatchMode=yes $Vps "bash -s"

Write-Output "Deploy complete."
