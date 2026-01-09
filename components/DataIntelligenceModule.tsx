import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell, PieChart, Pie, LineChart, Line, ComposedChart
} from 'recharts';
import { 
  Sparkles, Activity, ShoppingCart, Target, ArrowUpRight, TrendingUp, 
  Zap, Radio, Brain, Database, Box, BarChart2, DollarSign, TrendingDown,
  Layers, AlertTriangle, ArrowRight, Search, Filter, Trophy
} from 'lucide-react';
import { usePersistence } from '../hooks/usePersistence';

// --- Helper Components ---
interface CyberCardProps {
  children?: React.ReactNode;
  className?: string;
}

const CyberCard: React.FC<CyberCardProps> = ({ children, className = '' }) => (
    <div className={`apple-glass relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        {children}
    </div>
);

const KPICard = ({ title, value, sub, icon: Icon, color, trend }: any) => (
    <CyberCard className="p-6 flex flex-col justify-between h-[160px]">
        <div className="flex justify-between items-start z-10">
            <div className={`p-3 rounded-xl bg-black/40 border border-white/10 ${color}`}>
                <Icon size={20} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-black/40 border border-white/5 ${trend > 0 ? 'text-cyber-green' : 'text-red-500'}`}>
                    {trend > 0 ? <ArrowUpRight size={12}/> : <TrendingDown size={12}/>}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="z-10">
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</div>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                {value}
                {sub && <span className="text-xs text-gray-500 font-mono font-medium">{sub}</span>}
            </div>
        </div>
        {/* Background Glow */}
        <div className={`absolute -right-4 -bottom-4 w-32 h-32 bg-gradient-to-tl ${color.replace('text-', 'from-')}/20 to-transparent blur-3xl opacity-30`}></div>
    </CyberCard>
);

export const DataIntelligenceModule: React.FC = () => {
  // --- Data Sources ---
  const [transactions] = usePersistence<any[]>('AERO_FINANCE_DATA', []);
  const [products] = usePersistence<any[]>('AERO_RESTOCK_DATA', []);
  const [rates] = usePersistence<any>('AERO_EXCHANGE_RATES', { 'USD': 1, 'CNY': 7.25 });

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // --- Core Calculations ---
  const analytics = useMemo(() => {
      const exchangeRate = rates['CNY'] || 7.25;

      // 1. Finance Metrics
      let gmvRMB = 0;
      let totalExpenseRMB = 0;
      let profitRMB = 0;
      
      transactions.forEach(t => {
          // Simple heuristic: Inbound = Sales/GMV, Outbound = Cost
          // In real app, filter by category '销售收入'
          const amount = t.amount;
          const rate = t.currency === 'USD' ? exchangeRate : (t.currency === 'CNY' ? 1 : exchangeRate); // Simplified rate logic
          const valRMB = amount * rate;

          if (t.type === 'in') {
              gmvRMB += valRMB;
          } else {
              totalExpenseRMB += valRMB;
          }
      });
      profitRMB = gmvRMB - totalExpenseRMB;
      const profitMargin = gmvRMB > 0 ? (profitRMB / gmvRMB) * 100 : 0;

      // 2. Supply Chain Metrics (From Smart Restock)
      let totalInventoryAssetRMB = 0;
      let potentialRevenueRMB = 0;
      let totalStockQty = 0;
      let deadStockQty = 0; // Items with 0 velocity
      let topProducts: any[] = [];

      products.forEach(p => {
          const stock = (p.inventory?.current || 0);
          const cost = (p.supplier?.unitPriceRMB || 0);
          const priceUSD = (p.financials?.sellingPriceUSD || 0);
          const velocity = (p.inventory?.dailyVelocity || 0);

          totalInventoryAssetRMB += stock * cost;
          potentialRevenueRMB += stock * (priceUSD * exchangeRate);
          totalStockQty += stock;

          if (velocity === 0 && stock > 0) deadStockQty += stock;

          // Calculate Item Profitability
          const unitProfitUSD = priceUSD - (cost / exchangeRate) - (p.financials?.fulfillmentFeeUSD || 0) - (priceUSD * (p.financials?.referralFeeRate || 0.15));
          
          topProducts.push({
              id: p.id,
              name: p.productName,
              sku: p.skuCode,
              velocity,
              stock,
              margin: priceUSD > 0 ? (unitProfitUSD / priceUSD) * 100 : 0,
              revenueShare: 0 // Will calc later
          });
      });

      // Sort Top Products
      topProducts.sort((a, b) => b.velocity - a.velocity);
      topProducts = topProducts.slice(0, 5);

      // 3. Mock Trend Data (Since we don't have historical snapshots in this demo)
      const trendData = Array.from({length: 7}).map((_, i) => ({
          day: `D-${7-i}`,
          gmv: Math.max(0, gmvRMB / 30 * (0.8 + Math.random() * 0.4)), // Simulated daily variation
          cost: Math.max(0, totalExpenseRMB / 30 * (0.9 + Math.random() * 0.2)),
          profit: 0
      })).map(d => ({ ...d, profit: d.gmv - d.cost }));

      return {
          gmvRMB,
          profitRMB,
          profitMargin,
          totalInventoryAssetRMB,
          potentialRevenueRMB,
          stockTurnover: totalStockQty > 0 ? (products.reduce((a,b) => a + (b.inventory?.dailyVelocity||0), 0) * 30) / totalStockQty : 0, // Monthly Turnover Ratio
          deadStockRate: totalStockQty > 0 ? (deadStockQty / totalStockQty) * 100 : 0,
          topProducts,
          trendData
      };
  }, [transactions, products, rates]);

  return (
    <div className="h-full flex flex-col px-6 pb-6 animate-in fade-in duration-500 overflow-hidden relative">
      
      {/* 1. Header - UPDATED: Transparent & Blur */}
      <div className="sticky top-0 z-30 bg-transparent backdrop-blur-2xl border-b border-white/10 pb-4 pt-6 -mx-6 px-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-end gap-4 transition-all">
          <div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 text-glow">
                  数据智脑 <span className="px-2 py-0.5 rounded border border-cyber-purple text-[10px] text-cyber-purple font-mono tracking-widest bg-cyber-purple/10">BRAIN_CORE</span>
              </h1>
              <p className="text-gray-500 font-medium text-xs mt-1 flex items-center gap-2">
                  <Brain size={12} className="text-cyber-purple animate-pulse"/> 
                  全域数据融合 • 财务 x 供应链 (Financial Supply Chain)
              </p>
          </div>
          
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
              {['7d', '30d', '90d'].map((t: any) => (
                  <button 
                      key={t}
                      onClick={() => setTimeRange(t)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${timeRange === t ? 'bg-white/20 text-white shadow-inner' : 'text-gray-500 hover:text-white'}`}
                  >
                      {t}
                  </button>
              ))}
          </div>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-6">
          
          {/* KPI ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard 
                  title="GMV (总交易额)" 
                  value={`¥${(analytics.gmvRMB / 10000).toFixed(2)}w`} 
                  icon={ShoppingCart} 
                  color="text-cyber-cyan" 
                  trend={12.5}
              />
              <KPICard 
                  title="净利润 (Net Profit)" 
                  value={`¥${(analytics.profitRMB / 10000).toFixed(2)}w`} 
                  sub={`Margin: ${analytics.profitMargin.toFixed(1)}%`}
                  icon={DollarSign} 
                  color={analytics.profitRMB >= 0 ? "text-cyber-green" : "text-red-500"} 
                  trend={analytics.profitMargin > 15 ? 5.2 : -2.1}
              />
              <KPICard 
                  title="库存资产 (Inventory Asset)" 
                  value={`¥${(analytics.totalInventoryAssetRMB / 10000).toFixed(2)}w`} 
                  sub="Linked to Restock"
                  icon={Box} 
                  color="text-cyber-blue" 
                  trend={null}
              />
              <KPICard 
                  title="库存周转 (Monthly Turn)" 
                  value={`${analytics.stockTurnover.toFixed(2)}x`} 
                  sub={analytics.deadStockRate > 10 ? `⚠️ Dead Stock: ${analytics.deadStockRate.toFixed(0)}%` : 'Healthy Flow'}
                  icon={Activity} 
                  color="text-cyber-purple" 
                  trend={null}
              />
          </div>

          {/* MAIN CHARTS AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left: Profit Trend */}
              <CyberCard className="lg:col-span-2 p-6 min-h-[350px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp size={16} className="text-cyber-green"/> 盈亏趋势分析 (Profitability)
                      </h3>
                      <div className="flex gap-4 text-[10px] font-mono">
                          <span className="flex items-center gap-1 text-cyber-cyan"><div className="w-2 h-2 bg-cyber-cyan rounded-full"></div> GMV</span>
                          <span className="flex items-center gap-1 text-cyber-green"><div className="w-2 h-2 bg-cyber-green rounded-full"></div> Net Profit</span>
                      </div>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={analytics.trendData}>
                              <defs>
                                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#30D158" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#30D158" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="day" stroke="#555" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                              <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `¥${val/1000}k`} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                  itemStyle={{ fontSize: '12px' }}
                              />
                              <Bar dataKey="gmv" barSize={20} fill="#00F0FF" radius={[4, 4, 0, 0]} opacity={0.3} />
                              <Area type="monotone" dataKey="profit" stroke="#30D158" strokeWidth={3} fill="url(#colorProfit)" />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </CyberCard>

              {/* Right: Asset Structure */}
              <CyberCard className="p-6 flex flex-col min-h-[350px]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Database size={16} className="text-cyber-blue"/> 资产结构 (Asset Mix)
                  </h3>
                  <p className="text-[10px] text-gray-500 mb-6">Real-time Asset Valuation</p>
                  
                  <div className="flex-1 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={[
                                      { name: 'Inventory (Cost)', value: analytics.totalInventoryAssetRMB, color: '#0A84FF' },
                                      { name: 'Cash (Profit)', value: Math.max(0, analytics.profitRMB), color: '#30D158' },
                                      { name: 'Ads Spend', value: Math.max(0, analytics.gmvRMB - analytics.profitRMB), color: '#BF5AF2' }
                                  ]}
                                  cx="50%" cy="50%"
                                  innerRadius={60} outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                  stroke="none"
                              >
                                  {/* Cells */}
                                  {[
                                      { color: '#0A84FF' }, { color: '#30D158' }, { color: '#BF5AF2' }
                                  ].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} />
                          </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Center Stats */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="text-[10px] text-gray-500 font-bold uppercase">ROI</div>
                          <div className="text-3xl font-black text-white">{(analytics.gmvRMB / (analytics.totalInventoryAssetRMB || 1)).toFixed(1)}x</div>
                      </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-[10px] text-gray-400">
                          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyber-blue"></div> 库存资产</span>
                          <span className="text-white font-mono">¥{(analytics.totalInventoryAssetRMB/10000).toFixed(1)}w</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400">
                          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyber-green"></div> 现金利润</span>
                          <span className="text-white font-mono">¥{(analytics.profitRMB/10000).toFixed(1)}w</span>
                      </div>
                  </div>
              </CyberCard>
          </div>

          {/* TOP PRODUCTS RANKING */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Trophy size={16} className="text-cyber-yellow"/> 爆款龙虎榜 (Top Performers)
                  </h3>
                  <div className="text-xs text-gray-500 font-mono">Based on Sales Velocity</div>
              </div>
              <div className="p-0">
                  <table className="w-full text-left">
                      <thead className="bg-black/40 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          <tr>
                              <th className="px-6 py-4">Ranking</th>
                              <th className="px-6 py-4">Product / SKU</th>
                              <th className="px-6 py-4 text-right">Daily Velocity</th>
                              <th className="px-6 py-4 text-right">Stock Level</th>
                              <th className="px-6 py-4 text-right">Profit Margin</th>
                              <th className="px-6 py-4 text-center">Health</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs font-mono">
                          {analytics.topProducts.map((p, i) => (
                              <tr key={p.id} className="group hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4">
                                      <div className={`w-6 h-6 rounded flex items-center justify-center font-black ${i===0 ? 'bg-cyber-yellow text-black' : i===1 ? 'bg-gray-300 text-black' : i===2 ? 'bg-orange-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                                          {i + 1}
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="font-bold text-white text-sm mb-0.5 group-hover:text-cyber-cyan transition-colors">{p.name}</div>
                                      <div className="text-gray-500">{p.sku}</div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <div className="font-bold text-white text-base">{p.velocity} <span className="text-[10px] text-gray-500">pcs/day</span></div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <div className={`font-bold ${p.stock < p.velocity * 7 ? 'text-red-500' : 'text-white'}`}>{p.stock}</div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <div className="text-cyber-green font-bold">{p.margin.toFixed(1)}%</div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      {p.margin > 20 && p.velocity > 10 ? (
                                          <span className="px-2 py-1 rounded bg-cyber-green/10 text-cyber-green border border-cyber-green/20 text-[10px] font-bold">STAR ⭐</span>
                                      ) : p.stock < 10 ? (
                                          <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold">OOS ⚠️</span>
                                      ) : (
                                          <span className="px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/10 text-[10px]">NORMAL</span>
                                      )}
                                  </td>
                              </tr>
                          ))}
                          {analytics.topProducts.length === 0 && (
                              <tr>
                                  <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                                      暂无数据，请先在“智能备货”模块添加产品并设置日销量。
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

      </div>
    </div>
  );
};