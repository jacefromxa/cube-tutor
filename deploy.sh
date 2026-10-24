#!/usr/bin/env bash
# ==============================================================================
# Cube-Tutor 生产环境一键部署脚本
# 适用平台：腾讯云 Ubuntu 服务器 (deck.ltd)
# ==============================================================================

set -e

SERVER_IP="111.231.18.254"
SERVER_USER="ubuntu"
TARGET_DIR="/var/www/cfop"
ARCHIVE_PATH="/tmp/cfop_dist.tar.gz"

echo "📦 [1/4] 开始构建前端生产产物..."
npm run build

echo "🗜️  [2/4] 打包静态资源 (自动排除本地视频以极速同步)..."
cd dist
tar --exclude='videos' -czf "$ARCHIVE_PATH" .
cd ..

echo "🚀 [3/4] 上传打包产物至服务器..."
scp "$ARCHIVE_PATH" "${SERVER_USER}@${SERVER_IP}:/home/${SERVER_USER}/"

echo "⚙️  [4/4] 服务器解压部署、修正权限并平滑重载 Nginx..."
ssh -t "${SERVER_USER}@${SERVER_IP}" "
  sudo tar -xzf /home/${SERVER_USER}/cfop_dist.tar.gz -C ${TARGET_DIR}/ && \
  sudo chown -R www-data:www-data ${TARGET_DIR} && \
  sudo chmod -R 755 ${TARGET_DIR} && \
  sudo nginx -t && \
  sudo systemctl reload nginx && \
  rm -f /home/${SERVER_USER}/cfop_dist.tar.gz && \
  echo '✨ 部署完成！访问地址: https://deck.ltd/cfop/'
"

rm -f "$ARCHIVE_PATH"
echo "🎉 全部完成！"

