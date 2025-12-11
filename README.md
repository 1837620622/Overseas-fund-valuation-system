<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare">
</p>

<h1 align="center">🌐 Global Fund Valuation System</h1>
<h3 align="center">海外基金实时估值系统</h3>

<p align="center">
  <strong>Real-time QDII/US Stock Fund Valuation with Dual-Source Data Fusion</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api">API</a> •
  <a href="#license">License</a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔄 **Dual-Source Fusion** | Combines two independent data sources for more accurate valuations |
| ⚡ **1-Minute Updates** | High-frequency automatic data refresh every 60 seconds |
| 🌍 **Bilingual Support** | Seamless Chinese/English interface switching |
| 📱 **Responsive Design** | Optimized for Mobile, Tablet, and Desktop |
| 🎨 **Cyberpunk UI** | Modern futuristic design with glass morphism effects |
| 📊 **47+ Funds** | Track QDII and overseas stock funds in real-time |
| 🔒 **Secure** | No user data collection, pure read-only data display |

## 🎯 Valuation Algorithm

```
Combined Valuation = (Model A × 40%) + (Model B × 60%)
```

- **Model A**: Position-based calculation from quarterly reports
- **Model B**: Real-time market data integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/global-fund-valuation.git
cd global-fund-valuation

# Install dependencies
npm install

# Start the server
npm start
```

The server will start at `http://localhost:3000`

## ☁️ Deployment

### Cloudflare Workers (Recommended)

1. Install Wrangler CLI:
```bash
npm install -g wrangler
wrangler login
```

2. Deploy:
```bash
wrangler deploy
```

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Connect your GitHub repository
2. Railway will auto-detect and deploy

### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`

## 📡 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fund-valuation` | GET | Get all fund valuations with dual-source data |
| `/api/funds` | GET | Get fund list |
| `/api/fund/:id` | GET | Get specific fund details with holdings |
| `/api/search?keyword=` | GET | Search funds by name or code |
| `/api/market-index` | GET | Get market indices (NASDAQ, S&P500, etc.) |
| `/api/refresh` | POST | Force refresh data from sources |
| `/api/status` | GET | System status and cache info |

### Example Response

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
        "source": "combined",
        "stocks": ["英伟达@9.9@-0.64", "微软@8.06@-2.74"]
      }
    ],
    "indexs": [
      {"inxnm": "纳斯达克", "rise_fall_per": "0.33%"}
    ]
  },
  "sources": {"wx": true, "xiaobei": true, "matchedCount": 4}
}
```

## 🏗️ Project Structure

```
global-fund-valuation/
├── public/
│   └── index.html      # Frontend (Single Page Application)
├── server.js           # Backend Express server
├── package.json        # Dependencies
├── wrangler.toml       # Cloudflare Workers config
├── railway.json        # Railway deployment config
└── README.md           # Documentation
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |

## 📱 Screenshots

<p align="center">
  <img src="https://via.placeholder.com/800x450/050b14/00f3ff?text=Global+Fund+Valuation+System" alt="Desktop View">
</p>

## ⚠️ Disclaimer

This system is for **reference only** and does not constitute investment advice. Fund valuations are estimates based on publicly available data and may differ from actual NAV. Always consult professional financial advisors before making investment decisions.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

- **WeChat**: 1837620622（传康kk）
- **Email**: 2040168455@qq.com
- **Bilibili / Xianyu**: 万能程序员

---

<p align="center">
  Made with ❤️ by 传康kk
</p>
