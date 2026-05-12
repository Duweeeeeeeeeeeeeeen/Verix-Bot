$vps = "root@178.104.245.26"
$remotePath = "/root/Verix-Bot"

Write-Output "Deploying all changes to VPS..."

# Root files
scp -o BatchMode=yes index.js "${vps}:${remotePath}/index.js"
scp -o BatchMode=yes package.json "${vps}:${remotePath}/package.json"

# src (full sync)
scp -o BatchMode=yes -r src "${vps}:${remotePath}/"

# dashboard (full sync API and specific client files)
scp -o BatchMode=yes -r dashboard/api "${vps}:${remotePath}/dashboard/"

# dashboard client components, contexts, styles & locales
scp -o BatchMode=yes -r dashboard/client/public "${vps}:${remotePath}/dashboard/client/"
scp -o BatchMode=yes -r dashboard/client/src/locales "${vps}:${remotePath}/dashboard/client/src/"
scp -o BatchMode=yes -r dashboard/client/src/components "${vps}:${remotePath}/dashboard/client/src/"
scp -o BatchMode=yes -r dashboard/client/src/contexts "${vps}:${remotePath}/dashboard/client/src/"
scp -o BatchMode=yes -r dashboard/client/src/styles "${vps}:${remotePath}/dashboard/client/src/"

# Sync ALL pages (handling brackets via tar)
Write-Output "Syncing all dashboard pages..."
tar -czf pages.tar.gz -C dashboard/client/src/pages .
scp -o BatchMode=yes pages.tar.gz "${vps}:${remotePath}/pages.tar.gz"
ssh -o BatchMode=yes $vps "mkdir -p ${remotePath}/dashboard/client/src/pages && tar -xzf ${remotePath}/pages.tar.gz -C ${remotePath}/dashboard/client/src/pages/ && rm ${remotePath}/pages.tar.gz"
Remove-Item pages.tar.gz

Write-Output "Restarting services on VPS..."
# Clear Next.js cache, build and restart
ssh -o BatchMode=yes $vps "rm -rf ${remotePath}/dashboard/client/.next && cd ${remotePath}/dashboard/client && npm run build && pm2 restart verix-dashboard-client"
ssh -o BatchMode=yes $vps "pm2 restart verix-bot"

Write-Output "Verifying service status..."
ssh -o BatchMode=yes $vps "pm2 list"

Write-Output "Deploy complete!"
