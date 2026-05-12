$vps = "root@178.104.245.26"
$remotePath = "/root/Verix-Bot"

Write-Output "Deploying UI refinements to VPS..."

# Create necessary directories
ssh $vps "mkdir -p ${remotePath}/dashboard/client/src/locales"
ssh $vps "mkdir -p ${remotePath}/dashboard/client/src/pages/config/[guildId]"
ssh $vps "mkdir -p ${remotePath}/dashboard/client/src/pages/selector"

# Sync modified files
scp dashboard/client/src/locales/it.json "${vps}:${remotePath}/dashboard/client/src/locales/it.json"
scp dashboard/client/src/locales/en.json "${vps}:${remotePath}/dashboard/client/src/locales/en.json"
scp dashboard/client/src/styles/globals.css "${vps}:${remotePath}/dashboard/client/src/styles/globals.css"
scp "dashboard/client/src/pages/config/[guildId]/index.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/[guildId]/index.js"
scp "dashboard/client/src/pages/config/[guildId]/welcome.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/[guildId]/welcome.js"
scp "dashboard/client/src/pages/config/[guildId]/embeds.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/[guildId]/embeds.js"
scp dashboard/client/src/pages/selector/index.js "${vps}:${remotePath}/dashboard/client/src/pages/selector/index.js"
scp dashboard/api/routes/embeds.js "${vps}:${remotePath}/dashboard/api/routes/embeds.js"

Write-Output "Restarting dashboard services..."
ssh $vps "pm2 restart verix-bot verix-dashboard-client"

Write-Output "UI Refinement Deploy complete!"
