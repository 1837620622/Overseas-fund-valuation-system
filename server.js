/**
 * ============================================================
 * 海外基金实时估值系统 - 后端服务
 * ============================================================
 * 功能：提供美股/QDII基金的实时估值数据接口
 * 数据源：
 *   1. wx.569555.xyz - 基金持仓和估值数据（公开API）
 *   2. api.xiaobeiyangji.com - 小贝养基API（备用数据源）
 * 
 * 作者：Vx:1837620622（传康kk）
 * 邮箱：2040168455@qq.com
 * ============================================================
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const schedule = require('node-schedule');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 中间件配置
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 数据缓存（减少对数据源的请求频率）
// ============================================================
let dataCache = {
    fundData: null,           // 数据源1：wx.569555.xyz 基金估值数据
    xiaobeiData: null,        // 数据源2：小贝养基 基金估值数据
    combinedData: null,       // 综合估值数据
    lastUpdate: null,         // 最后更新时间
    marketIndex: null,        // 市场指数数据
    nightFundList: null       // 夜间美股基金列表
};

// 缓存有效期（毫秒）- 1分钟（高频更新保证数据准确性）
const CACHE_DURATION = 1 * 60 * 1000;

// ============================================================
// 小贝养基API配置
// ============================================================
const XIAOBEI_CONFIG = {
    baseUrl: 'https://api.xiaobeiyangji.com/yangji-api/api',
    token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlvbklkIjoibzg5Nm81MWdrRXBDZklGNG50ZlVBQUpxZ3ZVMCIsImlhdCI6MTc2NTQyMTg3NywiZXhwIjoxNzY4MDEzODc3fQ.EPoZ2FbtqYjsCC1z37frFs8CBoVVZRgcAem-xeE0NVg',
    unionId: 'o896o51gkEpCfIF4ntfUAAJqgvU0',
    version: '3.4.1.X'
};

// 小贝养基请求头
const xiaobeiHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.7(0x13080712) UnifiedPCMacWechat(0xf264151c) XWEB/17078',
    'authorization': XIAOBEI_CONFIG.token,
    'xweb_xhr': '1',
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://servicewechat.com/wxafb3b016f1fe7c53/37/page-frame.html',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9'
};

// ============================================================
// 公共请求头配置（模拟微信小程序环境）
// ============================================================
const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.7(0x13080712) UnifiedPCMacWechat(0xf264151c) XWEB/17078',
    'xweb_xhr': '1',
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://servicewechat.com/wxf039419fedfa40dd/11/page-frame.html',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9'
};

// ============================================================
// 辅助函数：从小贝养基获取夜间美股基金列表
// ============================================================
async function fetchXiaobeiNightFundList() {
    try {
        const response = await axios.post(
            `${XIAOBEI_CONFIG.baseUrl}/get-night-us-fund-list`,
            {
                page: 1,
                type: 'all',
                sort: 'desc',
                unionId: XIAOBEI_CONFIG.unionId,
                version: XIAOBEI_CONFIG.version
            },
            { headers: xiaobeiHeaders, timeout: 15000 }
        );

        if (response.data && response.data.code === 200) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('[小贝养基] 获取夜间基金列表失败:', error.message);
        return null;
    }
}

// ============================================================
// 辅助函数：从小贝养基获取市场指数
// ============================================================
async function fetchXiaobeiMarketIndex() {
    try {
        const response = await axios.post(
            `${XIAOBEI_CONFIG.baseUrl}/get-market-index-list`,
            {
                unionId: XIAOBEI_CONFIG.unionId,
                version: XIAOBEI_CONFIG.version
            },
            { headers: xiaobeiHeaders, timeout: 15000 }
        );

        if (response.data && response.data.code === 200) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('[小贝养基] 获取市场指数失败:', error.message);
        return null;
    }
}

// ============================================================
// 辅助函数：从wx.569555.xyz获取基金持仓估值
// ============================================================
async function fetchWxFundData() {
    try {
        const response = await axios.get('https://wx.569555.xyz/nasdaq/dataUS.json', {
            headers: commonHeaders,
            timeout: 15000
        });

        if (response.data && response.data.success === '1') {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('[WX数据源] 获取基金数据失败:', error.message);
        return null;
    }
}

// ============================================================
// 辅助函数：提取基金核心名称（用于模糊匹配）
// ============================================================
function extractCoreName(name) {
    return name
        .replace(/\(QDII.*?\)/g, '')
        .replace(/（QDII.*?）/g, '')
        .replace(/人民币/g, '')
        .replace(/股票型/g, '')
        .replace(/混合型/g, '')
        .replace(/指数型/g, '')
        .replace(/发起式/g, '')
        .replace(/股票/g, '')
        .replace(/混合/g, '')
        .replace(/[AC]$/g, '')
        .replace(/[-\s]/g, '')
        .trim();
}

// ============================================================
// 辅助函数：综合两个数据源的估值
// ============================================================
function combineValuationData(wxData, xiaobeiData) {
    if (!wxData || !wxData.categoryImpacts) {
        return null;
    }

    // 创建小贝数据的多级映射
    const xiaobeiMap = {};
    const xiaobeiCoreMap = {};
    
    if (xiaobeiData && xiaobeiData.list) {
        xiaobeiData.list.forEach(fund => {
            // 完整名称映射
            xiaobeiMap[fund.name] = fund;
            xiaobeiMap[fund.code] = fund;
            
            // 核心名称映射（用于模糊匹配）
            const coreName = extractCoreName(fund.name);
            xiaobeiCoreMap[coreName] = fund;
        });
    }

    // 综合估值数据
    let combinedFunds = [];
    const matchedXiaobeiIds = new Set();

    // 1. 处理WX数据源（基准）
    combinedFunds = wxData.categoryImpacts.map(fund => {
        let xiaobeiMatch = null;
        
        // 策略1：直接名称匹配
        if (xiaobeiMap[fund.name]) {
            xiaobeiMatch = xiaobeiMap[fund.name];
        }
        
        // 策略2：核心名称模糊匹配
        if (!xiaobeiMatch) {
            const wxCoreName = extractCoreName(fund.name);
            
            // 精确核心名称匹配
            if (xiaobeiCoreMap[wxCoreName]) {
                xiaobeiMatch = xiaobeiCoreMap[wxCoreName];
            }
            
            // 包含匹配
            if (!xiaobeiMatch) {
                for (const [coreName, xbFund] of Object.entries(xiaobeiCoreMap)) {
                    if (coreName.includes(wxCoreName) || wxCoreName.includes(coreName)) {
                        if (Math.abs(coreName.length - wxCoreName.length) <= 5) {
                            xiaobeiMatch = xbFund;
                            break;
                        }
                    }
                }
            }
        }

        const wxImpact = fund.estimatedImpact || 0;
        let xiaobeiImpact = null;
        let combinedImpact = wxImpact;
        let source = 'source1'; // 默认为估值1

        if (xiaobeiMatch) {
            matchedXiaobeiIds.add(xiaobeiMatch._id || xiaobeiMatch.code);
            xiaobeiImpact = (xiaobeiMatch.change || 0) * 100;
            // 匹配成功：算法综合 (0.6 * 估值2 + 0.4 * 估值1)
            combinedImpact = xiaobeiImpact * 0.6 + wxImpact * 0.4;
            source = 'combined';
        }

        return {
            id: fund.id, // WX ID
            name: fund.name,
            val1: wxImpact,                    // 估值1 (WX)
            val2: xiaobeiImpact,               // 估值2 (Xiaobei)
            estimatedImpact: combinedImpact,   // 最终估值
            source: source,
            stocks: fund.stocks || [],
            code: xiaobeiMatch ? xiaobeiMatch.code : null
        };
    });

    // 2. 添加未匹配的小贝数据
    if (xiaobeiData && xiaobeiData.list) {
        xiaobeiData.list.forEach(fund => {
            const id = fund._id || fund.code;
            if (!matchedXiaobeiIds.has(id)) {
                // 排除一些显然不是目标基金的（比如纯指数）如果不在此次需求范围内
                // 这里暂时全部加入，标记为 source2
                const impact = (fund.change || 0) * 100;
                combinedFunds.push({
                    id: 'xb_' + fund.code,
                    name: fund.name,
                    val1: null,
                    val2: impact,
                    estimatedImpact: impact,
                    source: 'source2',
                    stocks: [], // 小贝API此接口未返回持仓详情
                    code: fund.code
                });
            }
        });
    }

    return {
        success: '1',
        categoryImpacts: combinedFunds,
        indexs: wxData.indexs,
        timestamp: wxData.timestamp,
        description: '系统实时估值',
        hiddenOvernight: wxData.hiddenOvernight
    };
}

// ============================================================
// API路由：获取基金估值数据（综合双数据源）
// ============================================================
app.get('/api/fund-valuation', async (req, res) => {
    try {
        const now = Date.now();
        
        // 检查缓存是否有效
        if (dataCache.combinedData && dataCache.lastUpdate && 
            (now - dataCache.lastUpdate) < CACHE_DURATION) {
            const matchedCount = dataCache.combinedData.categoryImpacts.filter(f => f.source === 'combined').length;
            return res.json({
                success: true,
                data: dataCache.combinedData,
                cached: true,
                sources: { 
                    wx: true, 
                    xiaobei: !!dataCache.xiaobeiData,
                    matchedCount: matchedCount,
                    totalCount: dataCache.combinedData.categoryImpacts.length
                },
                lastUpdate: new Date(dataCache.lastUpdate).toISOString()
            });
        }

        // 并行获取两个数据源的数据
        console.log('[数据获取] 开始并行获取双数据源...');
        const [wxData, xiaobeiData] = await Promise.all([
            fetchWxFundData(),
            fetchXiaobeiNightFundList()
        ]);

        console.log('[数据获取] WX数据:', wxData ? '成功' : '失败');
        console.log('[数据获取] 小贝数据:', xiaobeiData ? '成功' : '失败');

        if (wxData) {
            // 综合两个数据源
            const combinedData = combineValuationData(wxData, xiaobeiData);
            
            // 更新缓存
            dataCache.fundData = wxData;
            dataCache.xiaobeiData = xiaobeiData;
            dataCache.combinedData = combinedData;
            dataCache.lastUpdate = now;

            const matchedCount = combinedData.categoryImpacts.filter(f => f.source === 'combined').length;
            return res.json({
                success: true,
                data: combinedData,
                cached: false,
                sources: { 
                    wx: true, 
                    xiaobei: !!xiaobeiData,
                    matchedCount: matchedCount,
                    totalCount: combinedData.categoryImpacts.length
                },
                lastUpdate: new Date(now).toISOString()
            });
        } else {
            throw new Error('主数据源获取失败');
        }
    } catch (error) {
        console.error('获取基金估值数据失败:', error.message);
        
        // 如果有缓存数据，返回缓存
        if (dataCache.combinedData) {
            return res.json({
                success: true,
                data: dataCache.combinedData,
                cached: true,
                stale: true,
                lastUpdate: dataCache.lastUpdate ? new Date(dataCache.lastUpdate).toISOString() : null,
                error: '获取最新数据失败，返回缓存数据'
            });
        }

        return res.status(500).json({
            success: false,
            error: '获取数据失败: ' + error.message
        });
    }
});

// ============================================================
// API路由：获取综合市场指数（双数据源）
// ============================================================
app.get('/api/market-index-combined', async (req, res) => {
    try {
        const xiaobeiIndex = await fetchXiaobeiMarketIndex();
        
        if (xiaobeiIndex) {
            // 格式化为统一结构
            const formattedIndex = xiaobeiIndex.map(idx => ({
                code: idx.code,
                name: idx.name,
                market: idx.market,
                current: idx.current,
                change: idx.chg,
                percent: idx.percent,
                openingTime: idx.openingTime || null
            }));

            return res.json({
                success: true,
                source: 'xiaobei',
                data: formattedIndex
            });
        }

        // 降级到wx数据源
        if (dataCache.fundData && dataCache.fundData.indexs) {
            return res.json({
                success: true,
                source: 'wx',
                data: dataCache.fundData.indexs
            });
        }

        throw new Error('无法获取市场指数');
    } catch (error) {
        console.error('获取市场指数失败:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// API路由：获取市场指数数据
// ============================================================
app.get('/api/market-index', async (req, res) => {
    try {
        const now = Date.now();
        
        // 检查缓存
        if (dataCache.marketIndex && dataCache.lastUpdate && 
            (now - dataCache.lastUpdate) < CACHE_DURATION) {
            return res.json({
                success: true,
                data: dataCache.marketIndex,
                cached: true
            });
        }

        // 尝试从主数据源的indexs字段获取
        if (dataCache.fundData && dataCache.fundData.indexs) {
            return res.json({
                success: true,
                data: dataCache.fundData.indexs,
                source: 'fundData'
            });
        }

        // 如果没有缓存，先获取基金数据
        const response = await axios.get('https://wx.569555.xyz/nasdaq/dataUS.json', {
            headers: commonHeaders,
            timeout: 15000
        });

        if (response.data && response.data.indexs) {
            dataCache.marketIndex = response.data.indexs;
            return res.json({
                success: true,
                data: response.data.indexs,
                cached: false
            });
        }

        throw new Error('无法获取市场指数数据');
    } catch (error) {
        console.error('获取市场指数失败:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// API路由：搜索基金
// ============================================================
app.get('/api/search', async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({
                success: false,
                error: '请提供搜索关键词'
            });
        }

        // 确保有数据
        if (!dataCache.fundData) {
            const response = await axios.get('https://wx.569555.xyz/nasdaq/dataUS.json', {
                headers: commonHeaders,
                timeout: 15000
            });
            dataCache.fundData = response.data;
            dataCache.lastUpdate = Date.now();
        }

        // 在基金数据中搜索
        const results = [];
        const searchTerm = keyword.toLowerCase();

        if (dataCache.fundData && dataCache.fundData.categoryImpacts) {
            dataCache.fundData.categoryImpacts.forEach(fund => {
                if (fund.name.toLowerCase().includes(searchTerm)) {
                    results.push({
                        id: fund.id,
                        name: fund.name,
                        estimatedImpact: fund.estimatedImpact,
                        stockCount: fund.stocks ? fund.stocks.length : 0
                    });
                }
            });
        }

        return res.json({
            success: true,
            keyword: keyword,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('搜索失败:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// API路由：获取单个基金详情
// ============================================================
app.get('/api/fund/:id', async (req, res) => {
    try {
        const fundId = parseInt(req.params.id);

        // 确保有数据
        if (!dataCache.fundData) {
            const response = await axios.get('https://wx.569555.xyz/nasdaq/dataUS.json', {
                headers: commonHeaders,
                timeout: 15000
            });
            dataCache.fundData = response.data;
            dataCache.lastUpdate = Date.now();
        }

        if (dataCache.fundData && dataCache.fundData.categoryImpacts) {
            const fund = dataCache.fundData.categoryImpacts.find(f => f.id === fundId);
            
            if (fund) {
                // 解析股票持仓数据
                const holdings = fund.stocks ? fund.stocks.map(stock => {
                    const parts = stock.split('@');
                    return {
                        name: parts[0] || '',
                        weight: parseFloat(parts[1]) || 0,
                        change: parseFloat(parts[2]) || 0
                    };
                }) : [];

                return res.json({
                    success: true,
                    data: {
                        id: fund.id,
                        name: fund.name,
                        estimatedImpact: fund.estimatedImpact,
                        holdings: holdings,
                        totalHoldings: holdings.length
                    }
                });
            }
        }

        return res.status(404).json({
            success: false,
            error: '未找到该基金'
        });
    } catch (error) {
        console.error('获取基金详情失败:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// API路由：获取所有基金列表（简化版）
// ============================================================
app.get('/api/funds', async (req, res) => {
    try {
        // 确保有数据
        if (!dataCache.fundData) {
            const response = await axios.get('https://wx.569555.xyz/nasdaq/dataUS.json', {
                headers: commonHeaders,
                timeout: 15000
            });
            dataCache.fundData = response.data;
            dataCache.lastUpdate = Date.now();
        }

        if (dataCache.fundData && dataCache.fundData.categoryImpacts) {
            const funds = dataCache.fundData.categoryImpacts.map(fund => ({
                id: fund.id,
                name: fund.name,
                estimatedImpact: fund.estimatedImpact,
                stockCount: fund.stocks ? fund.stocks.length : 0
            }));

            // 按估值涨跌幅排序
            funds.sort((a, b) => b.estimatedImpact - a.estimatedImpact);

            return res.json({
                success: true,
                timestamp: dataCache.fundData.timestamp || '',
                description: dataCache.fundData.description || '',
                count: funds.length,
                data: funds
            });
        }

        throw new Error('暂无数据');
    } catch (error) {
        console.error('获取基金列表失败:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// API路由：刷新缓存
// ============================================================
app.post('/api/refresh', async (req, res) => {
    try {
        const response = await axios.get('https://wx.569555.xyz/nasdaq/dataUS.json', {
            headers: commonHeaders,
            timeout: 15000
        });

        if (response.data && response.data.success === '1') {
            dataCache.fundData = response.data;
            dataCache.lastUpdate = Date.now();

            return res.json({
                success: true,
                message: '数据刷新成功',
                lastUpdate: new Date(dataCache.lastUpdate).toISOString()
            });
        }

        throw new Error('刷新失败');
    } catch (error) {
        console.error('刷新缓存失败:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// API路由：系统状态
// ============================================================
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'running',
        version: '1.0.0',
        cacheInfo: {
            hasFundData: !!dataCache.fundData,
            lastUpdate: dataCache.lastUpdate ? new Date(dataCache.lastUpdate).toISOString() : null,
            fundCount: dataCache.fundData?.categoryImpacts?.length || 0
        },
        serverTime: new Date().toISOString()
    });
});

// ============================================================
// 根路由：返回前端页面
// ============================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// 定时任务：每1分钟自动刷新双数据源
// ============================================================
schedule.scheduleJob('*/1 * * * *', async () => {
    console.log('[定时任务] 开始刷新双数据源...');
    try {
        const [wxData, xiaobeiData] = await Promise.all([
            fetchWxFundData(),
            fetchXiaobeiNightFundList()
        ]);

        if (wxData) {
            const combinedData = combineValuationData(wxData, xiaobeiData);
            dataCache.fundData = wxData;
            dataCache.xiaobeiData = xiaobeiData;
            dataCache.combinedData = combinedData;
            dataCache.lastUpdate = Date.now();
            console.log('[定时任务] 双数据源刷新成功, 匹配基金数:', 
                combinedData.categoryImpacts.filter(f => f.source === 'combined').length);
        }
    } catch (error) {
        console.error('[定时任务] 数据刷新失败:', error.message);
    }
});

// ============================================================
// 启动服务器
// ============================================================
app.listen(PORT, () => {
    console.log('============================================================');
    console.log('  海外基金实时估值系统');
    console.log('============================================================');
    console.log(`  服务地址: http://localhost:${PORT}`);
    console.log(`  API文档: http://localhost:${PORT}/api/status`);
    console.log('============================================================');
    console.log('  作者: Vx:1837620622（传康kk）');
    console.log('  邮箱: 2040168455@qq.com');
    console.log('============================================================');

    // 启动时预加载双数据源
    Promise.all([
        fetchWxFundData(),
        fetchXiaobeiNightFundList()
    ]).then(([wxData, xiaobeiData]) => {
        if (wxData) {
            const combinedData = combineValuationData(wxData, xiaobeiData);
            dataCache.fundData = wxData;
            dataCache.xiaobeiData = xiaobeiData;
            dataCache.combinedData = combinedData;
            dataCache.lastUpdate = Date.now();
            const matchedCount = combinedData.categoryImpacts.filter(f => f.source === 'combined').length;
            console.log('[初始化] 双数据源预加载成功');
            console.log('[初始化] WX数据源: 17只基金');
            console.log('[初始化] 小贝数据源:', xiaobeiData ? `${xiaobeiData.list?.length || 0}只基金` : '获取失败');
            console.log('[初始化] 综合匹配:', matchedCount, '只基金');
        }
    }).catch(error => {
        console.error('[初始化] 数据预加载失败:', error.message);
    });
});
