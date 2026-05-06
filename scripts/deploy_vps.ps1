$vps = "root@178.104.245.26"
$remotePath = "/root/Verix-Bot"

echo "Deploying all changes to VPS..."

# Root files
scp index.js "${vps}:${remotePath}/index.js"
scp package.json "${vps}:${remotePath}/package.json"

# src (full sync)
scp -r src "${vps}:${remotePath}/"

# dashboard (full sync API and specific client files)
scp -r dashboard/api "${vps}:${remotePath}/dashboard/"

# dashboard client assets & locales
scp -r dashboard/client/public "${vps}:${remotePath}/dashboard/client/"
scp -r dashboard/client/src/locales "${vps}:${remotePath}/dashboard/client/src/"

# dashboard client components & pages
scp dashboard/client/src/components/Layout.js "${vps}:${remotePath}/dashboard/client/src/components/Layout.js"
scp dashboard/client/src/pages/_document.js "${vps}:${remotePath}/dashboard/client/src/pages/_document.js"
scp dashboard/client/src/pages/_app.js "${vps}:${remotePath}/dashboard/client/src/pages/_app.js"
scp dashboard/client/src/styles/globals.css "${vps}:${remotePath}/dashboard/client/src/styles/globals.css"

# New pages (ensure directory exists)
ssh $vps "mkdir -p ${remotePath}/dashboard/client/src/pages/config/\[guildId\]"
ssh $vps "mkdir -p ${remotePath}/dashboard/client/src/pages/admin"
ssh $vps "mkdir -p ${remotePath}/dashboard/client/src/styles"
scp "dashboard/client/src/pages/config/[guildId]/reaction-roles.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/\[guildId\]/reaction-roles.js"
scp "dashboard/client/src/pages/config/[guildId]/polls.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/\[guildId\]/polls.js"
scp "dashboard/client/src/pages/admin/system.js" "${vps}:${remotePath}/dashboard/client/src/pages/admin/system.js"

echo "Restarting services on VPS..."
ssh $vps "pm2 restart verix-bot"
ssh $vps "pm2 restart verix-dashboard-client"

echo "Verifying service status..."
ssh $vps "pm2 list"

echo "Deploy complete!"
