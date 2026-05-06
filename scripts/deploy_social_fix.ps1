$vps = "root@178.104.245.26"
$remotePath = "/root/Verix-Bot"

echo "Deploying social manager fixes to VPS..."

# Sync the specific file
scp src/modules/socials/manager.js "${vps}:${remotePath}/src/modules/socials/manager.js"

echo "Restarting bot..."
ssh $vps "pm2 restart verix-bot"

echo "Social deploy complete!"
