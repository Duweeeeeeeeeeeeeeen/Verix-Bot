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

# dashboard client assets & locales
scp -o BatchMode=yes -r dashboard/client/public "${vps}:${remotePath}/dashboard/client/"
scp -o BatchMode=yes -r dashboard/client/src/locales "${vps}:${remotePath}/dashboard/client/src/"

# dashboard client components & styles
scp -o BatchMode=yes -r dashboard/client/src/components "${vps}:${remotePath}/dashboard/client/src/"
scp -o BatchMode=yes dashboard/client/src/styles/globals.css "${vps}:${remotePath}/dashboard/client/src/styles/globals.css"

# New pages and Admin section
ssh -o BatchMode=yes $vps "mkdir -p ${remotePath}/dashboard/client/src/pages/config/[guildId]"
ssh -o BatchMode=yes $vps "mkdir -p ${remotePath}/dashboard/client/src/pages/admin"

# Archive and deploy ALL config pages to handle [guildId] brackets correctly
tar -czf config_pages.tar.gz -C dashboard/client/src/pages/config/[guildId] .
scp -o BatchMode=yes config_pages.tar.gz "${vps}:${remotePath}/config_pages.tar.gz"
ssh -o BatchMode=yes $vps "tar -xzf ${remotePath}/config_pages.tar.gz -C ${remotePath}/dashboard/client/src/pages/config/\[guildId\]/ && rm ${remotePath}/config_pages.tar.gz"
rm config_pages.tar.gz

# Admin pages
scp -o BatchMode=yes "dashboard/client/src/pages/admin/system.js" "${vps}:${remotePath}/dashboard/client/src/pages/admin/system.js"

Write-Output "Restarting services on VPS..."
# Clear Next.js cache and restart
ssh -o BatchMode=yes $vps "rm -rf ${remotePath}/dashboard/client/.next && cd ${remotePath}/dashboard/client && pm2 restart verix-dashboard-client"
ssh -o BatchMode=yes $vps "pm2 restart verix-bot"

Write-Output "Verifying service status..."
ssh -o BatchMode=yes $vps "pm2 list"

Write-Output "Deploy complete!"
