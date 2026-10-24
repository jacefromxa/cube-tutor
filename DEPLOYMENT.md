# Cube-Tutor 服务器部署与更新指南

本文档记录了 **Cube-Tutor** 系统的线上生产架构、资源拓扑及日常一键部署方法，防止配置与步骤遗忘。

---

## 一、生产环境基础架构与拓扑

| 组件 | 规格 / 地址 | 说明 |
| :--- | :--- | :--- |
| **服务器** | 腾讯云 Ubuntu (`111.231.18.254`) | 运行 Nginx 1.24 作为反向代理与静态资源服务器 |
| **SSH 登录** | `ubuntu@111.231.18.254` | 具有 `sudo` 管理权限 |
| **线上访问地址** | `https://deck.ltd/cfop/` | 页面基准路径为 `/cfop/` |
| **服务器目录** | `/var/www/cfop/` | Nginx 指向的静态文件发布根目录（所有者 `www-data:www-data`） |
| **媒体云存储** | 腾讯云 COS + CDN (`https://media.deck.ltd`) | 托管全站 11 个核心 MP4 视频，支持 HTTP 206 分段按需加载 |

> [!TIP]
> **关于视频存储**：由于全站视频全部通过 `.env` 中的 `VITE_COS_URL=https://media.deck.ltd` 走 CDN 分段加载，**服务器本地（`/var/www/cfop/`）无需存放任何视频文件**，既极大节省服务器磁盘空间，又大幅度缩减了每次构建上传的体积（仅约 28MB，数秒即可传完）。

---

## 二、一键更新部署（最推荐）

项目中已配置了一键自动化部署脚本 [`deploy.sh`](file:///Users/Zhuanz/Documents/cube-tutor/deploy.sh)。在本地项目根目录下直接执行：

```bash
./deploy.sh
```

### 脚本会自动完成以下动作：
1. 本地执行 `npm run build` 打包。
2. 将 `dist/` 目录打包为 `tar.gz`（自动排除本地大体积 `videos/` 文件夹）。
3. 通过 SCP 将压缩包推送到服务器 `/home/ubuntu/`。
4. 在服务器解压覆盖至 `/var/www/cfop/`，重设 `www-data` 权限。
5. 自动运行 `nginx -t` 测试并平滑重载 Nginx，最后清理临时压缩包。

---

## 三、手动更新部署步骤备忘

如果某些情况下无法使用脚本，可按以下标准步骤在终端手动操作：

### 1. 本地打包与压缩
```bash
# 1. 编译前端
npm run build

# 2. 压缩产物（注意排除 videos 目录）
cd dist
tar --exclude='videos' -czf /tmp/cfop_dist.tar.gz .
cd ..
```

### 2. 上传至服务器
```bash
scp /tmp/cfop_dist.tar.gz ubuntu@111.231.18.254:/home/ubuntu/
```

### 3. 服务器解压与权限重置
登录服务器或执行远程指令：
```bash
ssh ubuntu@111.231.18.254
```
在服务器上执行：
```bash
# 解压覆盖到发布目录
sudo tar -xzf /home/ubuntu/cfop_dist.tar.gz -C /var/www/cfop/

# 修正目录所有权与权限
sudo chown -R www-data:www-data /var/www/cfop
sudo chmod -R 755 /var/www/cfop

# 测试并重载 Nginx
sudo nginx -t && sudo systemctl reload nginx

# 清理上传包
rm -f /home/ubuntu/cfop_dist.tar.gz
```

---

## 四、Nginx 核心配置备忘

服务器配置文件路径：`/etc/nginx/sites-available/mtg-primer`

关键配置块如下：
```nginx
# Cube-Tutor CFOP service:
location = /cfop {
    return 301 /cfop/;
}

# 带哈希的 JS/CSS 静态资产：1年强缓存
location /cfop/assets/ {
    alias /var/www/cfop/assets/;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}

# 514 张 Case 形态切图与图标：30 天不可变强缓存 (0流量秒开)
location /cfop/images/ {
    alias /var/www/cfop/images/;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
    access_log off;
}

# 静态页面（不缓存 HTML 以确保每次发版秒级生效）
location /cfop/ {
    alias /var/www/cfop/;
    index index.html;
    try_files $uri $uri/ /cfop/index.html;
    add_header Cache-Control "no-cache";
}
```

---

## 五、环境配置文件说明（`.env`）

项目根目录的 [`.env`](file:///Users/Zhuanz/Documents/cube-tutor/.env) 中：
```ini
VITE_COS_URL=https://media.deck.ltd
```
- **作用**：控制 [`src/utils/assetUrl.js`](file:///Users/Zhuanz/Documents/cube-tutor/src/utils/assetUrl.js) 将所有视频相对路径动态解析为 `https://media.deck.ltd/videos/...`。
- 如需切换视频源或临时改回本地视频测试，只需将该变量置空即可。

---

## 六、常见问题排查（FAQ）

1. **更新后网页没有立即生效？**
   - 检查浏览器缓存，按 `Cmd + Shift + R`（Mac）或 `Ctrl + F5`（Windows）强制刷新。
   - 检查线上加载的 JS 哈希是否变动：
     ```bash
     curl -s https://deck.ltd/cfop/ | grep 'index-'
     ```
2. **视频无法播放或提示 403 / 证书错误？**
   - 确认为腾讯云 COS 配置了 `media.deck.ltd` 的 HTTPS 证书。
   - 检查 COS 防盗链 Referer 是否包含了 `deck.ltd` 与 `https://deck.ltd`。
3. **切图缺失或卡片白屏？**
   - 检查 `/var/www/cfop/images/` 目录是否存在且具有读权限（权限应为 `755`，所属 `www-data`）。

