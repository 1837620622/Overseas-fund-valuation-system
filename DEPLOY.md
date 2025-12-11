# 部署指南 | Deployment Guide

## Cloudflare Pages 部署 (推荐)

由于 Cloudflare Workers 不直接支持 Node.js Express，推荐使用以下替代方案：

### 方案一：Render.com (免费)

1. 访问 https://render.com
2. 点击 "New Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. 点击 "Create Web Service"

### 方案二：Railway (推荐)

1. 访问 https://railway.app
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择仓库，自动部署
4. 获取分配的域名

### 方案三：Vercel

1. 安装 Vercel CLI: `npm i -g vercel`
2. 在项目目录运行: `vercel`
3. 按提示完成部署

### 方案四：自建服务器

```bash
# 使用 PM2 管理进程
npm install -g pm2
pm2 start server.js --name "fund-valuation"
pm2 save
pm2 startup
```

## 环境变量

| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| PORT | 3000 | 服务端口 |

## 健康检查

部署后访问 `/api/status` 验证服务状态。
