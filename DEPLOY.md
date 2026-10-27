# TRIA CAFE — Production Deploy

## Repository secrets needed

Add these in GitHub → Settings → Secrets → Actions:

| Secret | Example | Notes |
|---|---|---|
| `VPS_HOST` | `27.72.104.154` | Public IP of triacafe.vn |
| `VPS_PORT` | `2223` | SSH port |
| `VPS_USER` | `root` | |
| `VPS_SSH_KEY` | *(paste private key)* | SSH key that can connect to VPS |

Repository variable (Settings → Variables):

| Variable | Value |
|---|---|
| `VPS_APP_DIR` | `/home/app/triacafe.vn` |

## VPS first-time setup (run once)

```bash
# 1. Generate an SSH key pair if you don't have one
ssh-keygen -t ed25519 -f ~/.ssh/tria_deploy -N ""

# 2. Copy the PUBLIC key to the VPS
ssh-copy-id -i ~/.ssh/tria_deploy.pub -p 2223 root@27.72.104.154

# 3. Paste the PRIVATE key into GitHub Secrets → VPS_SSH_KEY
#    On Windows PowerShell:
#      Get-Content "$env:USERPROFILE\.ssh\tria_deploy" -Raw

# 4. SSH into VPS and create the app directory + production env
ssh -p 2223 root@27.72.104.154
mkdir -p /home/app/triacafe.vn/runtime
docker volume create deploy_tria_postgres_data
cp /path/to/.env.production /home/app/triacafe.vn/.env.production
```

## VPS prerequisites

```bash
# Docker + Compose v2
apt update && apt install -y docker.io docker-compose-plugin
systemctl enable --now docker

# Nginx (reverse proxy — see /etc/nginx/sites-available/triacafe.vn)
apt install -y nginx
```

## Nginx config for triacafe.vn

The existing config already proxies port 80/443 → 8082.
Ensure it looks like:

```nginx
server {
    listen 443 ssl;
    server_name triacafe.vn www.triacafe.vn;

    ssl_certificate /etc/nginx/ssl/hsm.novatech.vn.pem;
    ssl_certificate_key /etc/nginx/ssl/hsm.novatech.vn.key;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## How auto-deploy works

1. Push to `master` or `main` → GitHub Actions runs.
2. First the `validate` job runs `tsc --noEmit` + `eslint .` (must pass).
3. Then `deploy` uploads the source tarball to VPS via SCP.
4. VPS extracts into `/home/app/triacafe.vn`, keeps `.env.production` untouched.
5. On every deploy, the `migrator` service runs `prisma db push` before the web container starts, keeping the VPS database schema in sync with Prisma.
6. Compose uses the isolated project name `triacafe-prod` and rebuilds only TRIA.
7. Health check polls `http://127.0.0.1:8082/` until the app is ready.

## Manual deploy

```bash
ssh -p 2223 root@27.72.104.154
cd /home/app/triacafe.vn
docker compose --project-name triacafe-prod --env-file .env.production -f deploy/docker-compose.prod.yml run --build --rm migrator
docker compose --project-name triacafe-prod --env-file .env.production -f deploy/docker-compose.prod.yml up -d --build --remove-orphans
```

## Database migrations

The GitHub Actions deployment runs `prisma db push` on every deploy, before starting the web container. For a manual deploy or a schema update outside the workflow, run the migrator before rebuilding/restarting the web service:

```bash
cd /home/app/triacafe.vn
docker compose --project-name triacafe-prod --env-file .env.production -f deploy/docker-compose.prod.yml run --build --rm migrator
```

## NovaSEO article publishing

Set `NOVASEO_WEBHOOK_SECRET` in `.env.production` to the same strong secret configured as `platformSettings.webhook.secret` in NovaSEO. In the NovaSEO project's webhook settings, use:

```text
URL: https://triacafe.vn/api/integrations/novaseo/articles
Secret: the same value as NOVASEO_WEBHOOK_SECRET
```

NovaSEO signs the exact JSON request body with HMAC-SHA256 in `X-NovaSEO-Signature`. Published articles must include title, SEO title, meta description, primary/secondary keywords, slug and HTML content. NovaSEO content IDs are stored as source IDs so retries update the same article rather than creating duplicates. After setting the VPS secret, redeploy/restart the app to load it.

## Chatbot product publishing

Set `TRIA_CHATBOT_WEBHOOK_SECRET` in the VPS `.env.production` to a strong shared secret. In the chatbot tenant's Website channel, choose `TRIA CAFE`, set the website URL to `https://triacafe.vn`, and enter the same value as the API Key / Webhook secret. Publish products with the Website platform enabled. The chatbot signs each request with HMAC-SHA256 in `X-Tria-Signature`; TRIA upserts products by the chatbot source ID, so republishing updates the existing product. Product edits and status changes sync too; deleting a linked chatbot product unpublishes it on TRIA.

The TRIA deploy workflow reads `.env.production` on every deployment. After adding or changing `TRIA_CHATBOT_WEBHOOK_SECRET`, run a deployment/restart so the web container loads it. Product image URLs uploaded by the chatbot use `https://chatbot.novatechhp.vn`.

## View logs

```bash
docker compose --project-name triacafe-prod --env-file /home/app/triacafe.vn/.env.production -f /home/app/triacafe.vn/deploy/docker-compose.prod.yml logs -f web
```
