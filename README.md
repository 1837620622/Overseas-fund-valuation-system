<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway">
</p>

<h1 align="center">🌐 海外基金实时估值系统</h1>
<h3 align="center">Global Fund Real-time Valuation System</h3>

<p align="center">
  <strong>双数据源融合 · 实时估值 · 中英双语</strong><br>
  <strong>Dual-Source Fusion · Real-time Valuation · Bilingual</strong>
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-部署指南">部署指南</a> •
  <a href="#-api文档">API文档</a> •
  <a href="#-english">English</a>
</p>

---

## 📸 界面预览

系统采用赛博朋克科技风格设计，支持中英文切换，完美适配手机、平板和电脑。

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🔄 **双数据源融合** | 综合两个独立数据源，估值更准确 |
| ⚡ **1分钟自动刷新** | 高频数据更新，实时掌握行情 |
| 🌍 **中英文切换** | 一键切换界面语言 |
| 📱 **响应式设计** | 完美适配 Mobile / iPad / PC |
| 🎨 **科技风UI** | 赛博朋克玻璃态设计 |
| 📊 **43+只基金** | 覆盖主流QDII和海外基金 |
| 💧 **水印保护** | 防止内容被盗用 |
| ⚠️ **免责弹窗** | 投资风险提示 |

## 🎯 估值算法

```
综合估值 = (模型A × 40%) + (模型B × 60%)
```

- **模型A**：基于季报持仓数据计算
- **模型B**：实时市场数据整合

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### Mac / Linux

```bash
# 克隆仓库
git clone https://github.com/1837620622/Overseas-fund-valuation-system.git
cd Overseas-fund-valuation-system

# 安装依赖
npm install

# 启动服务
npm start
```

### Windows

```bash
# 克隆仓库
git clone https://github.com/1837620622/Overseas-fund-valuation-system.git
cd Overseas-fund-valuation-system

# 安装依赖
npm install

# 启动服务
npm start
```

服务启动后访问：`http://localhost:3000`

---

## ☁️ 部署指南

### Railway（推荐）

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. 点击上方按钮或访问 https://railway.app
2. 选择 "Deploy from GitHub repo"
3. 连接本仓库，自动部署

### Render

1. 访问 https://render.com
2. 创建 New Web Service
3. 连接 GitHub 仓库
4. 设置：
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 自建服务器

```bash
# 使用 PM2 管理进程
npm install -g pm2
pm2 start server.js --name "fund-valuation"
pm2 save
pm2 startup
```

---

## 📡 API文档

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/fund-valuation` | GET | 获取所有基金估值（双数据源） |
| `/api/funds` | GET | 获取基金列表 |
| `/api/fund/:id` | GET | 获取单只基金详情和持仓 |
| `/api/search?keyword=` | GET | 搜索基金 |
| `/api/market-index` | GET | 获取市场指数 |
| `/api/refresh` | POST | 强制刷新数据 |
| `/api/status` | GET | 系统状态 |

### 响应示例

```json
{
  "success": true,
  "data": {
    "categoryImpacts": [
      {
        "id": 1,
        "name": "华宝纳斯达克精选",
        "val1": 0.16,
        "val2": 0.42,
        "estimatedImpact": 0.32,
        "source": "combined"
      }
    ]
  },
  "sources": {"matchedCount": 4}
}
```

---

## 📁 项目结构

```
Overseas-fund-valuation-system/
├── public/
│   └── index.html      # 前端页面（SPA）
├── server.js           # 后端服务
├── package.json        # 依赖配置
├── railway.json        # Railway配置
├── README.md           # 说明文档
└── DEPLOY.md           # 部署指南
```

---

## ⚠️ 免责声明

本系统数据**仅供参考**，不构成任何投资建议。基金估值基于公开数据计算，可能与实际净值存在偏差。投资有风险，入市需谨慎。

---

## 👨‍💻 作者信息

- **微信**: 1837620622（传康kk）
- **邮箱**: 2040168455@qq.com
- **咸鱼 / B站**: 万能程序员

---

<h2 id="-english">🌐 English Version</h2>

### Features

- **Dual-Source Data Fusion**: Combines two independent data sources for more accurate valuations
- **1-Minute Auto Refresh**: High-frequency data updates
- **Bilingual Support**: Chinese/English interface switching
- **Responsive Design**: Optimized for Mobile, Tablet, and Desktop
- **Cyberpunk UI**: Modern futuristic design with glass morphism effects
- **43+ Funds**: Track QDII and overseas stock funds in real-time

### Quick Start

```bash
git clone https://github.com/1837620622/Overseas-fund-valuation-system.git
cd Overseas-fund-valuation-system
npm install
npm start
```

Visit `http://localhost:3000`

### Valuation Algorithm

```
Combined Valuation = (Model A × 40%) + (Model B × 60%)
```

- **Model A**: Position-based calculation from quarterly reports
- **Model B**: Real-time market data integration

### Deployment

Deploy easily on **Railway**, **Render**, or **Vercel** by connecting this GitHub repository.

### Disclaimer

This system is for **reference only** and does not constitute investment advice. Fund valuations are estimates and may differ from actual NAV. Invest wisely.

---

<p align="center">
  Made with ❤️ by 万能程序员（传康KK）
</p>
