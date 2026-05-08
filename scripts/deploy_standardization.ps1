$vps = "root@178.104.245.26"
$remotePath = "/root/Verix-Bot"

Write-Output "Deploying Full UI Standardization Update to VPS..."

# Sync Global Styles
Write-Output "Syncing globals.css..."
scp dashboard/client/src/styles/globals.css "${vps}:${remotePath}/dashboard/client/src/styles/globals.css"

# Sync Modified Modules (using wildcards or literal paths if scp fails with brackets)
Write-Output "Syncing standardized pages..."
# Try literal path with escape
scp "dashboard/client/src/pages/config/[guildId]/fivem.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/\[guildId\]/fivem.js"
scp "dashboard/client/src/pages/config/[guildId]/utility.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/\[guildId\]/utility.js"
scp "dashboard/client/src/pages/config/[guildId]/management.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/\[guildId\]/management.js"
scp "dashboard/client/src/pages/config/[guildId]/moderation.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/\[guildId\]/moderation.js"
scp "dashboard/client/src/pages/config/[guildId]/tickets.js" "${vps}:${remotePath}/dashboard/client/src/pages/config/\[guildId\]/tickets.js"

Write-Output "Restarting dashboard client..."
ssh $vps "pm2 restart verix-dashboard-client"

Write-Output "Standardization Deploy complete!"
