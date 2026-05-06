$vps = "root@178.104.245.26"
$remotePath = "/root/Verix-Bot"

echo "Deploying UI-specific changes to VPS..."

# Create styles directory if missing
ssh $vps "mkdir -p ${remotePath}/dashboard/client/src/styles"

# Sync modified files
scp dashboard/client/src/components/Layout.js "${vps}:${remotePath}/dashboard/client/src/components/Layout.js"
scp dashboard/client/src/pages/_app.js "${vps}:${remotePath}/dashboard/client/src/pages/_app.js"
scp dashboard/client/src/styles/globals.css "${vps}:${remotePath}/dashboard/client/src/styles/globals.css"

echo "Restarting dashboard client..."
ssh $vps "pm2 restart verix-dashboard-client"

echo "UI Deploy complete!"
