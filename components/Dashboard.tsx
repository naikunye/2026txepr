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
       { name: '周一', value: avgDaily * 0.8 },
       { name: '周二', value: avgDaily * 1.1 },
       { name: '周三', value: avgDaily * 0.9 },
       { name: '周四', value: avgDaily * 1.2 },
       { name: '周五', value: avgDaily * 1.0 },
       { name: '周六', value: avgDaily * 1.3 },
       { name: '周日', value: avgDaily * 1.5 },
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
    <div className="px-8 py-6 space-y-8 animate-in fade-in duration-700 w-full mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-6">
         <div>
            <h1 className="text-4xl font-black text-white tracking-tight text-glow">
                指挥中心
            </h1>
            <p className="text-cyber-dim mt-2 text-sm font-medium tracking-wide flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse"></span>
               全域实时监控系统 • {now.toLocaleDateString()}
            </p>
         </div>

         {/* Glass Clock Pill */}
         <div className="flex-1 w-full xl:w-auto flex justify-end">
            <div className="flex items-center gap-6 bg-white/5 border border-white/10 backdrop-blur-2xl px-8 py-4 rounded-full shadow-2xl">
                <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                    <div className="text-right">
                        <div className="text-[10px] text-cyber-blue font-bold uppercase tracking-widest mb-1">洛杉矶 (LAX)</div>
                        <div className="text-3xl font-bold text-white leading-none tracking-tight font-mono text-glow-blue">
                            {formatTime('America/Los_Angeles')}
                        </div>
                    </div>
                </div>
                <div className="hidden sm:block text-right border-r border-white/10 pr-8">
                    <div className="text-[10px] text-cyber-purple font-bold uppercase tracking-widest mb-1">纽约 (NYC)</div>
                    <div className="text-xl font-medium text-gray-300 leading-none font-mono">
                        {formatTime('America/New_York')}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${metrics.exceptionShipments > 0 ? 'bg-cyber-red animate-pulse shadow-[0_0_10px_#FF453A]' : 'bg-cyber-green shadow-[0_0_10px_#30D158]'}`}></div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Online</span>
                </div>
            </div>
         </div>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[220px]">
         
         {/* Widget 1: Global Status (Rich Dark Blue/Purple Mesh) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 apple-glass p-10 relative overflow-hidden group">
            {/* Background Gradient Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-indigo/30 via-transparent to-cyber-blue/10 pointer-events-none animate-pulse-slow"></div>
            <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-cyber-blue/20 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
               <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-cyber-blue to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-glow-blue">
                     <Globe size={28} />
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight text-glow">
                     全球运营状态
                  </h3>
                  <p className="text-gray-300 mt-3 text-sm max-w-lg leading-relaxed font-light">
                     正在实时监控 <span className="text-white font-bold">{metrics.totalProducts}</span> 个活跃 SKU，跨越 <span className="text-white font-bold">{metrics.activeShipments}</span> 个国际物流单。系统核心神经网络运行平稳。
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className={`p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 transition-all hover:bg-white/10 hover:border-white/20 hover:translate-y-[-2px]`}>
                     <div className={`w-3 h-3 rounded-full ${metrics.exceptionShipments > 0 ? 'bg-cyber-red shadow-[0_0_10px_#FF453A]' : 'bg-cyber-green shadow-[0_0_10px_#30D158]'}`}></div>
                     <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">物流运输</div>
                        <div className="text-base font-bold text-white">{metrics.exceptionShipments > 0 ? `${metrics.exceptionShipments} 个异常` : '运转正常'}</div>
                     </div>
                  </div>
                  <div className={`p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 transition-all hover:bg-white/10 hover:border-white/20 hover:translate-y-[-2px]`}>
                     <div className={`w-3 h-3 rounded-full ${metrics.lowStockCount > 0 ? 'bg-cyber-orange shadow-[0_0_10px_#FF9F0A]' : 'bg-cyber-green shadow-[0_0_10px_#30D158]'}`}></div>
                     <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">库存状况</div>
                        <div className="text-base font-bold text-white">{metrics.lowStockCount > 0 ? `${metrics.lowStockCount} 个告急` : '健康'}</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Widget 2: Revenue (Emerald/Green Gradient) */}
         <div className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 apple-glass p-8 relative overflow-hidden flex flex-col justify-between group">
             <div className="absolute inset-0 bg-gradient-to-br from-cyber-green/10 to-transparent pointer-events-none group-hover:opacity-70 transition-opacity"></div>
             
            <div className="flex justify-between items-start z-10">
               <div>
                  <div className="text-xs font-bold text-cyber-green uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyber-green rounded-full"></div> 总营收 (CNY)
                  </div>
                  <div className="text-4xl font-black text-white tracking-tight font-mono text-glow">
                     ¥{metrics.revenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
               </div>
               <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md border ${metrics.profit >= 0 ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/20' : 'bg-cyber-red/10 text-cyber-red border-cyber-red/20'}`}>
                  {metrics.profit >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                  {metrics.profit >= 0 ? '+12.5%' : '-2.1%'}
               </div>
            </div>
            <div className="h-24 w-full mt-4 -mx-4 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData}>
                     <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={metrics.profit >= 0 ? "#30D158" : "#FF453A"} stopOpacity={0.6}/>
                           <stop offset="95%" stopColor={metrics.profit >= 0 ? "#30D158" : "#FF453A"} stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="name" hide />
                     <Tooltip 
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                            return (
                                <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl text-xs animate-in fade-in zoom-in-95 duration-200 min-w-[100px]">
                                    <div className="text-gray-400 mb-1 font-medium tracking-wide">{label}</div>
                                    <div className={`font-black font-mono text-lg ${metrics.profit >= 0 ? 'text-cyber-green text-glow-green' : 'text-cyber-red text-glow-red'}`}>
                                        ¥{Number(payload[0].value).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </div>
                                </div>
                            );
                            }
                            return null;
                        }}
                        cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '3 3' }}
                     />
                     <Area type="monotone" dataKey="value" stroke={metrics.profit >= 0 ? "#30D158" : "#FF453A"} strokeWidth={3} fill="url(#colorVal)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Widget 3: Inventory (Pink/Purple) */}
         <div className="apple-glass p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity"></div>
            
            <div className="flex justify-between items-start relative z-10">
               <div className="w-12 h-12 bg-gradient-to-br from-cyber-pink to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Package size={22} />
               </div>
               {metrics.lowStockCount > 0 && <span className="w-3 h-3 bg-cyber-red rounded-full shadow-[0_0_10px_#FF453A] animate-pulse"></span>}
            </div>
            <div className="relative z-10 mt-4">
               <div className="text-4xl font-black text-white font-mono tracking-tight text-glow-purple">
                  {metrics.lowStockCount} <span className="text-base font-bold text-gray-400">SKU</span>
               </div>
               <div className="text-xs text-cyber-pink font-bold mt-2 uppercase tracking-widest">需紧急补货</div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-4 relative z-10">
               <div className="h-full bg-cyber-pink rounded-full shadow-[0_0_10px_rgba(255,55,95,0.8)]" style={{ width: `${Math.min(100, (metrics.lowStockCount / Math.max(1, metrics.totalProducts))*100)}%` }}></div>
            </div>
         </div>

         {/* Widget 4: Logistics (Blue/Teal) */}
         <div className="apple-glass p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity"></div>

            <div className="flex justify-between items-start relative z-10">
               <div className="w-12 h-12 bg-gradient-to-br from-cyber-cyan to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Map size={22} />
               </div>
               <ArrowUpRight size={20} className="text-cyber-cyan" />
            </div>
            <div className="relative z-10 mt-4">
               <div className="text-4xl font-black text-white font-mono tracking-tight text-glow-blue">{metrics.activeShipments}</div>
               <div className="text-xs text-cyber-cyan font-bold mt-2 uppercase tracking-widest">正在运输中</div>
            </div>
         </div>
      </div>

      {/* AI Insights Bar */}
      <div className="apple-glass p-2 rounded-full flex items-center backdrop-blur-3xl shadow-2xl border border-white/20 animate-float">
         <div className="bg-gradient-to-r from-cyber-blue to-cyber-indigo text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(94,92,230,0.5)]">
            <Zap size={18} fill="currentColor" />
            <span className="font-bold text-sm tracking-wide">AI 洞察</span>
         </div>
         <div className="px-8 py-2 text-sm font-medium text-white truncate drop-shadow-md">
            {aiInsight}
         </div>
      </div>
    </div>
  );
};