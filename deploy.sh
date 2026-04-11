#!/usr/bin/env bash
# deploy.sh — quick update script for the LuckyDraw lottery app on the VPS.
#
# Run this from the repo root after pulling new code:
#   cd /var/www/lottery
#   git pull origin main
#   bash deploy.sh
#
# The script will:
#   1. Install / update backend dependencies (production only)
#   2. Install / update frontend dependencies and rebuild
#   3. Restart the Node.js app gracefully with PM2

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"

echo "==> [1/3] Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install --omit=dev

echo "==> [2/3] Building frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build

echo "==> [3/3] Restarting app via PM2..."
# Graceful reload keeps the process alive during restart (zero downtime).
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
pm2 save

echo ""
echo "✅  Deploy complete! Check logs with: pm2 logs lottery-app"
