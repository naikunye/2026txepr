import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { Wallet, Globe, ArrowUpRight, TrendingUp, Package, Clock, Zap, Cpu, Activity, RefreshCcw, Sun, Map } from 'lucide-react';
import { usePersistence } from '../hooks/usePersistence';

interface Transaction { amount: number; type: 'in' | 'out'; currency?: string; }
interface Shipment { status: string; id: string; }
interface Product { inventory: { current: number; safetyDays: number; dailyVelocity: number }; productName: string; }

const RATES: Record<string, number> = { 'USD': 7.25, 'GBP': 9.10, 'EUR': 7.85, 'CNY': 1.00, 'USDT': 7.28, 'HKD': 0.92 };

export const Dashboard: React.FC = () => {
  const [now, setNow] = useState(new Date());

  const [transactions] = usePersistence<Transaction[]>('AERO_FINANCE_DATA', []);
  const [shipments] = usePersistence<Shipment[]>('AERO_LOGISTICS_DATA', []);
  const [products] = usePersistence<Product[]>('AERO_RESTOCK_DATA', []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (zone: string) => {
    try {
        return now.toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false });
    } catch(e) { return "00:00"; }
  };

  const metrics = useMemo(() => {
    let totalRevCNY = 0;
    let totalExpCNY = 0;

    transactions.forEach(t => {
        const currency = t.currency?.toUpperCase() || 'USD';
        const rate = RATES[currency] || 1; 
        const amountCNY = t.amount * rate;
        if (t.type === 'in') totalRevCNY += amountCNY;
        else totalExpCNY += amountCNY;
    });
    
    const avgDaily = totalRevCNY / 30; 
    const chartData = [
       { name: 'Mon', value: avgDaily * 0.8 },
       { name: 'Tue', value: avgDaily * 1.1 },
       { name: 'Wed', value: avgDaily * 0.9 },
       { name: 'Thu', value: avgDaily * 1.2 },
       { name: 'Fri', value: avgDaily * 1.0 },
       { name: 'Sat', value: avgDaily * 1.3 },
       { name: 'Sun', value: avgDaily * 1.5 },
    ];

    const activeShipments = shipments.filter(s => s.status === 'transport' || s.status === 'customs').length;
    const exceptionShipments = shipments.filter(s => s.status === 'exception').length;
    const lowStockCount = products.filter(p => {
       const daysCover = p.inventory.dailyVelocity > 0 ? p.inventory.current / p.inventory.dailyVelocity : 999;
       return daysCover < p.inventory.safetyDays;
    }).length;

    return {
      revenue: totalRevCNY,
      profit: totalRevCNY - totalExpCNY,
      activeShipments,
      exceptionShipments,
      lowStockCount,
      totalProducts: products.length,
      chartData
    };
  }, [transactions, shipments, products]);

  const aiInsight = useMemo(() => {
    if (metrics.exceptionShipments > 0) return `⚠️ 警报: 检测到 ${metrics.exceptionShipments} 个物流异常，请及时处理。`;
    else if (metrics.lowStockCount > 2) return `📦 库存预警: ${metrics.lowStockCount} 个 SKU 低于安全库存水位。`;
    else if (metrics.revenue > 0 && metrics.profit < 0) return `📉 财务预警: 本周期检测到净利润为负，请检查支出。`;
    else return `✅ 系统正常: 各项运营指标运行平稳。`;
  }, [metrics]);

  return (
    <div className="px-8 py-6 space-y-8 animate-in fade-in duration-700 w-full max-w-[1600px] mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-6">
         <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
                仪表盘 (Dashboard)
            </h1>
            <p className="text-cyber-dim mt-1 text-sm font-medium">
               实时全域监控 • {now.toLocaleDateString()}
            </p>
         </div>

         {/* Glass Clock Pill */}
         <div className="flex-1 w-full xl:w-auto flex justify-end">
            <div className="flex items-center gap-6 bg-white/5 border border-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg">
                <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-cyber-blue font-bold uppercase">Los Angeles</div>
                        <div className="text-2xl font-semibold text-white leading-none tracking-tight">
                            {formatTime('America/Los_Angeles')}
                        </div>
                    </div>
                </div>
                <div className="hidden sm:block text-right border-r border-white/10 pr-6">
                    <div className="text-[10px] text-cyber-purple font-bold uppercase">New York</div>
                    <div className="text-lg font-medium text-gray-300 leading-none">
                        {formatTime('America/New_York')}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${metrics.exceptionShipments > 0 ? 'bg-cyber-red animate-pulse' : 'bg-cyber-green'}`}></div>
                    <span className="text-xs font-medium text-gray-300">在线</span>
                </div>
            </div>
         </div>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[200px]">
         
         {/* Widget 1: Global Status (Rich Dark Blue/Purple Mesh) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 tech-border p-8 relative overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-indigo/20 via-transparent to-cyber-blue/10 pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
               <div>
                  <div className="w-12 h-12 bg-cyber-blue/20 rounded-2xl flex items-center justify-center text-cyber-blue mb-4 border border-cyber-blue/20 shadow-lg shadow-cyber-blue/10">
                     <Globe size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                     全球运营状态
                  </h3>
                  <p className="text-cyber-dim mt-2 text-sm max-w-md leading-relaxed">
                     正在实时监控 <span className="text-white font-semibold">{metrics.totalProducts}</span> 个活跃 SKU，跨越 <span className="text-white font-semibold">{metrics.activeShipments}</span> 个国际物流单。系统核心模块运行状态最佳。
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className={`p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md flex items-center gap-3 transition-colors ${metrics.exceptionShipments > 0 ? 'border-cyber-red/30 bg-cyber-red/5' : 'hover:bg-white/5'}`}>
                     <div className={`w-2 h-2 rounded-full ${metrics.exceptionShipments > 0 ? 'bg-cyber-red' : 'bg-cyber-green'}`}></div>
                     <div>
                        <div className="text-xs text-gray-400 font-medium uppercase">物流运输</div>
                        <div className="text-sm font-semibold text-white">{metrics.exceptionShipments > 0 ? `${metrics.exceptionShipments} 个异常` : '运转正常'}</div>
                     </div>
                  </div>
                  <div className={`p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md flex items-center gap-3 transition-colors ${metrics.lowStockCount > 0 ? 'border-cyber-orange/30 bg-cyber-orange/5' : 'hover:bg-white/5'}`}>
                     <div className={`w-2 h-2 rounded-full ${metrics.lowStockCount > 0 ? 'bg-cyber-orange' : 'bg-cyber-green'}`}></div>
                     <div>
                        <div className="text-xs text-gray-400 font-medium uppercase">库存状况</div>
                        <div className="text-sm font-semibold text-white">{metrics.lowStockCount > 0 ? `${metrics.lowStockCount} 个告急` : '健康'}</div>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Soft decorative blob */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyber-blue/10 rounded-full blur-[80px] pointer-events-none"></div>
         </div>

         {/* Widget 2: Revenue (Emerald/Green Gradient) */}
         <div className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 tech-border p-6 relative overflow-hidden flex flex-col justify-between">
             <div className="absolute inset-0 bg-gradient-to-br from-cyber-green/10 to-transparent pointer-events-none"></div>
             
            <div className="flex justify-between items-start z-10">
               <div>
                  <div className="text-xs font-bold text-cyber-dim uppercase tracking-wide">总营收 (CNY)</div>
                  <div className="text-3xl font-bold text-white mt-1 tracking-tight">
                     ¥{metrics.revenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
               </div>
               <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${metrics.profit >= 0 ? 'bg-cyber-green/20 text-cyber-green' : 'bg-cyber-red/20 text-cyber-red'}`}>
                  {metrics.profit >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                  {metrics.profit >= 0 ? '+12.5%' : '-2.1%'}
               </div>
            </div>
            <div className="h-20 w-full mt-4 -mx-2 opacity-80">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData}>
                     <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={metrics.profit >= 0 ? "#30D158" : "#FF453A"} stopOpacity={0.4}/>
                           <stop offset="95%" stopColor={metrics.profit >= 0 ? "#30D158" : "#FF453A"} stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Area type="monotone" dataKey="value" stroke={metrics.profit >= 0 ? "#30D158" : "#FF453A"} strokeWidth={3} fill="url(#colorVal)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Widget 3: Inventory (Pink/Purple) */}
         <div className="tech-border p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink/10 to-transparent pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
               <div className="w-10 h-10 bg-cyber-pink/20 rounded-xl flex items-center justify-center text-cyber-pink border border-cyber-pink/20">
                  <Package size={20} />
               </div>
               {metrics.lowStockCount > 0 && <span className="w-2 h-2 bg-cyber-red rounded-full shadow-[0_0_8px_#FF453A]"></span>}
            </div>
            <div className="relative z-10">
               <div className="text-2xl font-bold text-white">
                  {metrics.lowStockCount} SKU
               </div>
               <div className="text-xs text-gray-400 font-medium">需补货</div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2 relative z-10">
               <div className="h-full bg-cyber-pink rounded-full shadow-[0_0_10px_rgba(255,55,95,0.5)]" style={{ width: `${Math.min(100, (metrics.lowStockCount / Math.max(1, metrics.totalProducts))*100)}%` }}></div>
            </div>
         </div>

         {/* Widget 4: Logistics (Blue/Teal) */}
         <div className="tech-border p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 to-transparent pointer-events-none"></div>

            <div className="flex justify-between items-start relative z-10">
               <div className="w-10 h-10 bg-cyber-cyan/20 rounded-xl flex items-center justify-center text-cyber-cyan border border-cyber-cyan/20">
                  <Map size={20} />
               </div>
               <ArrowUpRight size={16} className="text-gray-500" />
            </div>
            <div className="relative z-10">
               <div className="text-2xl font-bold text-white">{metrics.activeShipments}</div>
               <div className="text-xs text-gray-400 font-medium">运输中</div>
            </div>
         </div>
      </div>

      {/* AI Insights Bar */}
      <div className="tech-border p-1.5 bg-white/5 rounded-full flex items-center backdrop-blur-3xl shadow-lg border border-white/10">
         <div className="bg-gradient-to-r from-cyber-blue to-cyber-indigo text-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-blue-900/50">
            <Zap size={16} fill="currentColor" />
            <span className="font-bold text-sm">AI 洞察</span>
         </div>
         <div className="px-6 py-2 text-sm font-medium text-gray-200 truncate">
            {aiInsight}
         </div>
      </div>
    </div>
  );
};
