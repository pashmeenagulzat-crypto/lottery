# Hostinger VPS Deployment Guide

Full step-by-step instructions for deploying the LuckyDraw lottery application on a **Hostinger VPS** (Ubuntu 22.04 LTS).

> ⚠️ **Hostinger shared hosting does NOT support Node.js.** You need a **Hostinger VPS** (KVM 1 or higher) or a Hostinger Cloud plan.

---

## Prerequisites

- Hostinger VPS running Ubuntu 22.04 LTS
- A domain name pointed at your VPS (e.g. `reelsmx.fun`)
- SSH access to the VPS as `root` (or a sudo user)

---

## STEP 1 — Initial VPS Setup

```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify
node -v   # should print v18.x.x
npm -v

# Install PM2 (process manager), Nginx, Git
npm install -g pm2
apt install -y nginx git

# Configure firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## STEP 2 — Set Up MySQL

```bash
# Install MySQL server
apt install -y mysql-server

# Secure the installation (set root password, remove test DB, etc.)
mysql_secure_installation

# Log in to MySQL and create the database + user
mysql -u root -p
```

Inside the MySQL shell:

```sql
CREATE DATABASE u864793484_reel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'u864793484_reel'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON u864793484_reel.* TO 'u864793484_reel'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## STEP 3 — Clone the Repository

```bash
cd /var/www
git clone https://github.com/pashmeenagulzat-crypto/lottery.git
cd lottery
```

---

## STEP 4 — Import the Database Schema

```bash
mysql -u u864793484_reel -p u864793484_reel < backend/schema.sql
```

This creates all tables and inserts a default admin user (`mobile: 9999999999`).

---

## STEP 5 — Configure the Backend

```bash
cd /var/www/lottery/backend
cp .env.example .env
nano .env
```

Set the following values:

```env
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=u864793484_reel
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_NAME=u864793484_reel

JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars
JWT_EXPIRES_IN=7d

# Must match your domain exactly (no trailing slash)
CORS_ORIGIN=https://reelsmx.fun

OTP_EXPIRY_MINUTES=10
```

Install production dependencies:

```bash
npm install --omit=dev
```

---

## STEP 6 — Build the Frontend

```bash
cd /var/www/lottery/frontend
npm install
npm run build
```

This produces `frontend/dist/`. The backend (`server.js`) automatically serves these
files as the React SPA when they exist at `../frontend/dist`.

---

## STEP 7 — Start the Backend with PM2

```bash
cd /var/www/lottery/backend

# Start using the included PM2 ecosystem config
pm2 start ecosystem.config.js --env production

# Save the process list so it survives reboots
pm2 save

# Generate and run the startup command (follow the printed instructions)
pm2 startup
```

Verify everything is running:

```bash
pm2 logs lottery-app      # live logs
pm2 status                # process list
curl http://localhost:5000/health   # should return {"success":true,...}
```

> **OTP note**: In production mode, OTPs are NOT returned in the API response.
> They are printed to the PM2 log (`pm2 logs lottery-app`). For real SMS delivery,
> integrate a provider (e.g. Fast2SMS, Twilio) in `backend/utils/otpGenerator.js`.

---

## STEP 8 — Configure Nginx as Reverse Proxy

```bash
# Copy the included Nginx config
sudo cp /var/www/lottery/deployment/nginx.conf /etc/nginx/sites-available/lottery

# Enable the site
sudo ln -s /etc/nginx/sites-available/lottery /etc/nginx/sites-enabled/

# Remove the default site if still enabled
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

The config proxies all traffic (HTTP and WebSocket) to Node.js on port 5000.
Edit `/etc/nginx/sites-available/lottery` and replace `reelsmx.fun` with your
actual domain if it is different.

---

## STEP 9 — Enable HTTPS with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx -d reelsmx.fun -d www.reelsmx.fun
```

Certbot automatically edits the Nginx config to add SSL and HTTP → HTTPS redirect.
Certificates auto-renew via a systemd timer — no manual action needed.

---

## STEP 10 — Point DNS to Your VPS

In the Hostinger DNS panel for `reelsmx.fun`:

| Type | Name | Value |
|------|------|-------|
| A    | @    | `<YOUR_VPS_IP>` |
| A    | www  | `<YOUR_VPS_IP>` |

DNS changes can take up to 24 hours to propagate globally.

---

## STEP 11 — Verify the Deployment

1. Open `https://reelsmx.fun` — the lottery app should load.
2. Log in as admin: mobile **`9999999999`**, get the OTP from `pm2 logs lottery-app`.
3. Create a lottery in the Admin panel and verify real-time ticket counts via Socket.io.
4. Test the wallet deposit flow (submit → approve in admin panel).

---

## Quick Update (After Code Changes)

```bash
cd /var/www/lottery

# Pull latest code
git pull origin main

# Run the included deploy script (installs deps + rebuilds frontend + restarts PM2)
bash deploy.sh
```

---

## File Structure Reference

```
lottery/
├── backend/
│   ├── ecosystem.config.js   # PM2 process config
│   ├── uploads/              # User-uploaded files (screenshots)
│   └── .env                  # Production secrets (never commit)
├── frontend/
│   └── dist/                 # Built React app (served by Node.js)
├── deployment/
│   └── nginx.conf            # Nginx reverse proxy config
├── deploy.sh                 # Quick update script
└── DEPLOYMENT.md             # This file
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| 502 Bad Gateway | Node.js not running | `pm2 restart lottery-app` |
| CORS errors in browser | Wrong `CORS_ORIGIN` in `.env` | Set it to your exact domain with `https://` |
| Socket.io not connecting | Missing Upgrade headers | Verify Nginx `proxy_set_header Upgrade` lines are present |
| OTP never arrives | Production mode hides OTP | Read from logs: `pm2 logs lottery-app` |
| DB connection failed | Wrong credentials in `.env` | Double-check `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| 413 Request Entity Too Large | Upload too big | Increase `client_max_body_size` in `nginx.conf` |
