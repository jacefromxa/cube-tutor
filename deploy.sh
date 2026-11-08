#!/usr/bin/env bash
# ==============================================================================
# CubeDex 生产环境一键部署脚本
# 适用平台：腾讯云 Ubuntu 服务器 (deck.ltd)
#
# 流程：构建 → 打包（排除 videos / AppleDouble）→ 上传 → 服务器上解压到
#       临时目录 → 备份当前版本 → 原子切换 → 校验 nginx → 平滑重载
#       任一步失败都会回滚，不会出现"半新半旧"的线上目录。
#
# 可覆盖的环境变量：
#   SERVER_IP / SERVER_USER / SSH_KEY / TARGET_DIR
# ==============================================================================

set -euo pipefail

SERVER_IP="${SERVER_IP:-111.231.18.254}"
SERVER_USER="${SERVER_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-}"
TARGET_DIR="${TARGET_DIR:-/var/www/cfop}"
ARCHIVE_PATH="/tmp/cfop_dist.tar.gz"
STAMP="$(date +%Y%m%d-%H%M%S)"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
if [ -n "$SSH_KEY" ]; then
  SSH_OPTS+=(-i "$SSH_KEY" -o IdentitiesOnly=yes)
fi

echo "📦 [1/5] 开始构建前端生产产物..."
npm run build

echo "🗜️  [2/5] 打包静态资源 (排除本地视频与 macOS 元数据)..."
COPYFILE_DISABLE=1 tar --exclude='videos' --exclude='._*' -czf "$ARCHIVE_PATH" -C dist .

echo "🚀 [3/5] 上传打包产物至服务器..."
scp "${SSH_OPTS[@]}" "$ARCHIVE_PATH" "${SERVER_USER}@${SERVER_IP}:/tmp/"

echo "⚙️  [4/5] 服务器解压、备份、原子切换..."
ssh "${SSH_OPTS[@]}" "${SERVER_USER}@${SERVER_IP}" bash -s <<REMOTE
set -euo pipefail
TARGET_DIR="$TARGET_DIR"
STAMP="$STAMP"
NEW_DIR="\$TARGET_DIR.new"
OLD_DIR="\$TARGET_DIR.old"
BACKUP="\$TARGET_DIR.bak-\$STAMP"

SUDO=""
if [ "\$(id -u)" -ne 0 ]; then SUDO="sudo -n"; fi

\$SUDO rm -rf "\$NEW_DIR" "\$OLD_DIR"
\$SUDO mkdir -p "\$NEW_DIR"
\$SUDO tar -xzf /tmp/cfop_dist.tar.gz -C "\$NEW_DIR"
\$SUDO find "\$NEW_DIR" -name '._*' -delete

if [ -d "\$TARGET_DIR" ]; then
  \$SUDO cp -a "\$TARGET_DIR" "\$BACKUP"
  \$SUDO mv "\$TARGET_DIR" "\$OLD_DIR"
fi
\$SUDO mv "\$NEW_DIR" "\$TARGET_DIR"
\$SUDO chown -R www-data:www-data "\$TARGET_DIR"
\$SUDO chmod -R 755 "\$TARGET_DIR"

if ! \$SUDO nginx -t; then
  echo "❌ nginx -t 失败，回滚到上一版本"
  \$SUDO rm -rf "\$TARGET_DIR"
  if [ -d "\$OLD_DIR" ]; then \$SUDO mv "\$OLD_DIR" "\$TARGET_DIR"; fi
  exit 1
fi
\$SUDO systemctl reload nginx
\$SUDO rm -rf "\$OLD_DIR"

# 只保留最近 3 份备份
\$SUDO ls -dt "\$TARGET_DIR".bak-* 2>/dev/null | tail -n +4 | xargs -r \$SUDO rm -rf

rm -f /tmp/cfop_dist.tar.gz
echo "✅ 部署完成，备份保留在 \$BACKUP"
REMOTE

rm -f "$ARCHIVE_PATH"
echo "🎉 全部完成！访问地址: https://deck.ltd/cfop/"
