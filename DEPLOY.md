# 部署指南 | Deployment Guide

> ⚠️ **重要提示**：本项目是 Node.js + Express 应用，**不支持** Cloudflare Workers 部署。请使用以下平台。

---

## 🚀 Railway（推荐）

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

### 部署步骤

1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 点击 **New Project** → **Deploy from GitHub repo**
4. 选择 `Overseas-fund-valuation-system` 仓库
5. Railway 自动检测并部署
6. 部署完成后获取公网域名

---

## 🌐 Render

1. 访问 https://render.com
2. 点击 **New** → **Web Service**
3. 连接 GitHub 仓库
4. 配置：
   - **Name**: `overseas-fund-valuation`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. 点击 **Create Web Service**

---

## ⚡ Vercel

```bash
npm install -g vercel
cd Overseas-fund-valuation-system
vercel
```

按提示操作即可完成部署。

---

## 🖥️ 自建服务器

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 克隆项目
git clone https://github.com/1837620622/Overseas-fund-valuation-system.git
cd Overseas-fund-valuation-system

# 安装依赖
npm install

# 启动服务
pm2 start server.js --name "fund-valuation"

# 保存进程列表
pm2 save

# 设置开机启动
pm2 startup
```

### 使用 Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t fund-valuation .
docker run -d -p 3000:3000 fund-valuation
```

---

## ❌ 不支持的平台

| 平台 | 原因 |
|------|------|
| Cloudflare Workers | 不支持 Node.js 原生模块（fs, path, http等） |
| Cloudflare Pages Functions | 仅支持无服务器函数，不支持 Express |

---

## 🔧 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `3000` | 服务端口 |

---

## ✅ 健康检查

部署完成后访问以下端点验证：

- `/api/status` - 系统状态
- `/api/fund-valuation` - 基金数据

---

## 👨‍💻 作者

- **微信**: 1837620622（传康kk）
- **邮箱**: 2040168455@qq.com
