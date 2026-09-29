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
| `VPS_APP_DIR` | `/opt/tria` |

## VPS first-time setup (run once)

```bash
# 1. Generate an SSH key pair if you don't have one
ssh-keygen -t ed25519 -f ~/.ssh/tria_deploy -N ""

# 2. Copy the PUBLIC key to the VPS
ssh-copy-id -i ~/.ssh/tria_deploy.pub -p 2223 root@27.72.104.154

# 3. Paste the PRIVATE key into GitHub Secrets → VPS_SSH_KEY

# 4. SSH into VPS and create the app directory + production env
ssh -p 2223 root@27.72.104.154
mkdir -p /opt/tria/runtime
cp /path/to/.env.production /opt/tria/.env.production
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
4. VPS extracts into `/opt/tria`, keeps `.env.production` untouched.
5. On first deploy, `npx prisma db push` initialises the database schema.
6. `docker compose up -d --build` rebuilds the container with the new code.
7. Health check polls `http://127.0.0.1:8082/` until the app is ready.

## Manual deploy

```bash
ssh -p 2223 root@27.72.104.154
cd /opt/tria
docker compose -f deploy/docker-compose.prod.yml up -d --build --remove-orphans
```

## Database migrations

The workflow runs `prisma db push` on first deploy only.
For schema changes on subsequent deploys, SSH in and run:

```bash
cd /opt/tria
docker compose -f deploy/docker-compose.prod.yml run --rm --no-deps \
  -w /app web npx prisma db push --skip-generate
```

## View logs

```bash
docker compose -f /opt/tria/deploy/docker-compose.prod.yml logs -f web
```
