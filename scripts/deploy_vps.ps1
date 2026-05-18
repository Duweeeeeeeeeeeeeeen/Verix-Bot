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

npm ci --omit=dev

cd dashboard/client
npm ci --omit=dev
npm run build

cd "$RemotePath"
pm2 restart verix-bot verix-dashboard-client
pm2 save

for attempt in {1..12}; do
  if curl -fsS https://verixbot.com/api/health; then
    break
  fi
  if [ "`$attempt" -eq 12 ]; then
    echo "Health check failed after `$attempt attempts"
    exit 1
  fi
  sleep 5
done

pm2 status --no-color
"@

$remoteScript = $remoteScript -replace "`r", ""
$remoteScript | ssh -o BatchMode=yes $Vps "bash -s"
if ($LASTEXITCODE -ne 0) {
    throw "Remote deploy failed with exit code $LASTEXITCODE"
}

Write-Output "Deploy complete."
