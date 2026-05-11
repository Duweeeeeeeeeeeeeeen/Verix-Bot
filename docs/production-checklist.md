# Verix Production Checklist

## Deploy rapido

Sulla VPS:

```bash
cd /root/Verix-Bot
./scripts/deploy_pm2.sh
```

Lo script esegue:

- `git pull --ff-only origin main`
- build della dashboard Next
- restart pulito via `ecosystem.config.cjs`
- `pm2 save`
- health check su `http://localhost:5001/api/health`

## Verifiche dopo deploy

```bash
pm2 list
curl -s http://localhost:5001/api/health
curl -I -L https://verixbot.com
pm2 logs verix-bot --lines 80 --nostream
pm2 logs verix-dashboard-client --lines 60 --nostream
```

Stato atteso:

- `verix-bot`: `online`
- `verix-dashboard-client`: `online`
- health endpoint: `"status":"ok"`
- sito: `HTTP/1.1 200 OK`

## PM2

I processi sono definiti in:

```bash
/root/Verix-Bot/ecosystem.config.cjs
```

Comandi utili:

```bash
pm2 restart verix-bot --update-env
pm2 restart verix-dashboard-client --update-env
pm2 save
pm2 describe verix-bot
pm2 describe verix-dashboard-client
```

I log sono ruotati da `pm2-logrotate`:

- max size: `20M`
- retain: `14`
- compress: `true`
- rotate interval: ogni giorno a mezzanotte

## Slash command Discord

In produzione il bot non registra piu i comandi slash a ogni avvio.

Per registrare i comandi dopo averli modificati:

```bash
cd /root/Verix-Bot
REGISTER_COMMANDS_ON_START=true pm2 restart verix-bot --update-env
```

Dopo la registrazione, tornare al comportamento normale:

```bash
pm2 restart verix-bot --update-env
```

## Variabili ambiente importanti

File VPS:

```bash
/root/Verix-Bot/.env
```

Da verificare prima della pubblicazione:

- `DISCORD_TOKEN`
- `CLIENT_ID`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DASHBOARD_FRONTEND_URL`
- `DASHBOARD_CALLBACK_URL`
- `SESSION_SECRET`
- `MONGO_URI` oppure `MONGODB_URI`
- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `ENCRYPTION_KEY`

Nota: `ENCRYPTION_KEY` oggi ha fallback legacy per non rompere token gia cifrati. Prima della pubblicazione va impostata una chiave stabile da almeno 32 caratteri e, se necessario, va pianificata la migrazione dei token privati.

## Backup MongoDB

Prima di modifiche rischiose o prima della pubblicazione:

```bash
mkdir -p /root/backups/verix
mongodump --uri "$MONGO_URI" --archive="/root/backups/verix/mongo-$(date +%F-%H%M).archive" --gzip
```

Verifica backup:

```bash
ls -lh /root/backups/verix
```

Restore, da usare solo quando serve davvero:

```bash
mongorestore --uri "$MONGO_URI" --archive="/root/backups/verix/NOME_BACKUP.archive" --gzip --drop
```

## Backup env

```bash
mkdir -p /root/backups/verix
cp /root/Verix-Bot/.env "/root/backups/verix/env-$(date +%F-%H%M).backup"
chmod 600 /root/backups/verix/env-*.backup
```

Non committare mai `.env` o backup env nel repository.

## Rollback rapido

Vedere gli ultimi commit:

```bash
cd /root/Verix-Bot
git log --oneline -5
```

Rollback a un commit noto:

```bash
git checkout <commit>
./scripts/deploy_pm2.sh
```

Per tornare a `main`:

```bash
git checkout main
git pull --ff-only origin main
./scripts/deploy_pm2.sh
```

## Controlli prima della pubblicazione

- Health endpoint `ok`
- Nessun errore recente in `pm2 logs`
- `ENCRYPTION_KEY` impostata
- `SESSION_SECRET` forte
- OAuth Discord callback corretto
- Nginx/HTTPS funzionanti
- Backup Mongo recente
- Backup `.env` recente
- Comandi slash registrati dopo l'ultima modifica comandi
