import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { Wallet, Globe, ArrowUpRight, TrendingUp, Package, Clock, Zap, Cpu, Activity, AlertTriangle, TrendingDown, RefreshCcw, Calendar, Sun, Moon } from 'lucide-react';
import { usePersistence } from '../hooks/usePersistence';

// Interfaces (aligned with other modules)
interface Transaction { amount: number; type: 'in' | 'out'; currency?: string; }
interface Shipment { status: string; id: string; }
interface Product { inventory: { current: number; safetyDays: number; dailyVelocity: number }; productName: string; }

// Exchange Rates (In a real app, fetch via API)
const RATES: Record<string, number> = {
    'USD': 7.25,
    'GBP': 9.10,
    'EUR': 7.85,
    'CNY': 1.00,
    'USDT': 7.28,
    'HKD': 0.92
};

export const Dashboard: React.FC = () => {
  const [now, setNow] = useState(new Date());

  // --- Real-time Data Subscriptions ---
  const [transactions] = usePersistence<Transaction[]>('AERO_FINANCE_DATA', []);
  const [shipments] = usePersistence<Shipment[]>('AERO_LOGISTICS_DATA', []);
  const [products] = usePersistence<Product[]>('AERO_RESTOCK_DATA', []);

  // --- Clock Timer (UI Only) ---
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (zone: string) => {
    try {
        return now.toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false });
    } catch(e) { return "00:00"; }
  };

  const formatDate = (zone: string) => {
    try {
        return now.toLocaleDateString('en-US', { timeZone: zone, month: 'short', day: 'numeric', weekday: 'short' });
    } catch(e) { return "Jan 01"; }
  };

  // --- Reactive Metrics Calculation ---
  const metrics = useMemo(() => {
    // 1. Finance Processing
    let totalRevCNY = 0;
    let totalExpCNY = 0;

    transactions.forEach(t => {
        const currency = t.currency?.toUpperCase() || 'USD';
        const rate = RATES[currency] || 1; 
        const amountCNY = t.amount * rate;

        if (t.type === 'in') totalRevCNY += amountCNY;
        else totalExpCNY += amountCNY;
    });
    
    // Generate Mock Chart Data shaped by real totals
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

    // 2. Logistics Processing
    const activeShipments = shipments.filter(s => s.status === 'transport' || s.status === 'customs').length;
    const exceptionShipments = shipments.filter(s => s.status === 'exception').length;

    // 3. Inventory Processing
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

  // --- Dynamic AI Insight Generation ---
  const aiInsight = useMemo(() => {
    if (metrics.exceptionShipments > 0) {
       return `检测到 ${metrics.exceptionShipments} 个物流异常单，建议优先介入处理以避免客户投诉。`;
    } else if (metrics.lowStockCount > 2) {
       return `库存警报：${metrics.lowStockCount} 个 SKU 低于安全水位，建议立即启动补货流程。`;
    } else if (metrics.revenue > 0 && metrics.profit < 0) {
       return `财务预警：本月处于亏损状态 (净亏 ¥${Math.abs(metrics.profit).toLocaleString()})，请检查支出结构。`;
    } else if (metrics.revenue === 0 && metrics.totalProducts === 0) {
       return `系统初始化完成。请前往“智能备货”或“财务中心”导入初始数据。`;
    } else {
       return `系统运行平稳。当前净利 ¥${metrics.profit.toLocaleString()}，全链路运转正常。`;
    }
  }, [metrics]);

  return (
    <div className="px-6 pb-6 space-y-8 animate-in fade-in duration-700">
      
      {/* Sticky Header Section - Updated padding/margins */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-cyber-border pb-4 pt-6 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col xl:flex-row justify-between items-end xl:items-center gap-6">
         
         {/* Title Area */}
         <div>
            <h1 className="text-3xl font-black text-cyber-text tracking-wider text-glow flex items-center gap-3">
                全域指挥中心 <span className="px-2 py-0.5 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/50 text-[10px] font-mono tracking-widest">LIVE</span>
            </h1>
            <p className="text-cyber-dim mt-1 font-mono text-xs hidden md:block">
               AERO.OS OPERATIONAL DASHBOARD // v3.3.0 (Reactive)
            </p>
         </div>

         {/* Prominent World Clock Bar */}
         <div className="flex-1 w-full xl:w-auto flex justify-end">
            <div className="flex flex-wrap items-center gap-2 bg-black border border-white/10 p-2 rounded-lg shadow-lg backdrop-blur-md overflow-hidden relative group">
                {/* Decoration Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink opacity-50"></div>

                {/* 1. US WEST (LAX) - Prominent Date & Time */}
                <div className="flex items-center gap-3 px-4 py-1 border-r border-white/10 bg-white/5 rounded-l">
                    <div className="text-right">
                        <div className="text-[10px] text-cyber-cyan font-bold tracking-widest flex items-center justify-end gap-1">
                             <Sun size={10} className="animate-pulse" /> 美西 (LAX)
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono uppercase">
                             {formatDate('America/Los_Angeles')}
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white font-mono leading-none tracking-tight">
                        {formatTime('America/Los_Angeles')}
                    </div>
                </div>

                {/* 2. US CENTRAL (ORD) */}
                <div className="flex flex-col justify-center px-4 border-r border-white/10 hidden sm:flex">
                    <div className="text-[9px] text-cyber-yellow font-bold tracking-widest mb-0.5">美中 (ORD)</div>
                    <div className="text-xl font-bold text-gray-300 font-mono leading-none">
                        {formatTime('America/Chicago')}
                    </div>
                </div>

                {/* 3. US EAST (NYC) */}
                <div className="flex flex-col justify-center px-4 hidden sm:flex">
                    <div className="text-[9px] text-cyber-pink font-bold tracking-widest mb-0.5">美东 (NYC)</div>
                    <div className="text-xl font-bold text-gray-300 font-mono leading-none">
                        {formatTime('America/New_York')}
                    </div>
                </div>

                {/* System Status Pills (Compact) */}
                <div className="pl-4 ml-auto xl:border-l xl:border-white/10 flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-gray-500 font-mono">CNY BASE</span>
                        <div className="flex items-center gap-1 text-[10px] text-cyber-dim">
                            <RefreshCcw size={10} className="animate-spin-slow"/> REAL-TIME
                        </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${metrics.exceptionShipments > 0 ? 'bg-red-500 animate-ping' : 'bg-cyber-green'}`}></div>
                </div>
            </div>
         </div>
      </div>

      {/* Main BENTO GRID Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[180px]">
         
         {/* Widget 1: Global Status (Context Aware) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 tech-border p-0 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-panel via-black/20 to-black/20 opacity-90 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
               <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2 text-cyber-text">
                     <Globe className="text-cyber-cyan" /> 全球运营态势
                  </h3>
                  <p className="text-cyber-dim mt-1 font-mono text-xs">
                     正在追踪 {metrics.totalProducts} 个 SKU，{metrics.activeShipments} 票在途货物
                  </p>
               </div>
               
               {/* Live Status Pills */}
               <div className="flex flex-col gap-3">
                  <div className={`px-4 py-3 border-l-4 bg-cyber-bg/50 backdrop-blur text-sm font-bold text-cyber-text flex justify-between items-center ${metrics.exceptionShipments > 0 ? 'border-cyber-pink' : 'border-cyber-green'}`}>
                     <span>物流网络状态</span>
                     <span className={metrics.exceptionShipments > 0 ? 'text-cyber-pink' : 'text-cyber-green'}>
                        {metrics.exceptionShipments > 0 ? `⚠️ ${metrics.exceptionShipments} 个异常节点` : '● 所有节点正常'}
                     </span>
                  </div>
                  <div className={`px-4 py-3 border-l-4 bg-cyber-bg/50 backdrop-blur text-sm font-bold text-cyber-text flex justify-between items-center ${metrics.lowStockCount > 0 ? 'border-cyber-yellow' : 'border-cyber-green'}`}>
                     <span>库存健康度</span>
                     <span className={metrics.lowStockCount > 0 ? 'text-cyber-yellow' : 'text-cyber-green'}>
                        {metrics.lowStockCount > 0 ? `⚠️ ${metrics.lowStockCount} SKU 需补货` : '● 库存充足'}
                     </span>
                  </div>
               </div>
            </div>

            {/* Background Animation */}
            <div className="absolute top-1/2 right-[-10%] w-[400px] h-[400px] rounded-full border border-cyber-cyan/20 -translate-y-1/2 group-hover:scale-105 transition-transform duration-1000"></div>
         </div>

         {/* Widget 2: Real Revenue Graph (CNY Normalized) */}
         <div className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 tech-border p-6 relative overflow-hidden bg-cyber-panel">
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <div className="text-xs font-mono text-cyber-dim uppercase tracking-widest">总营收 (Total Revenue CNY)</div>
                  <div className="text-3xl font-bold text-cyber-text mt-1 text-glow font-mono">
                     ¥{metrics.revenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
               </div>
               <div className={`w-10 h-10 border bg-opacity-10 flex items-center justify-center ${metrics.profit >= 0 ? 'border-cyber-green bg-cyber-green text-cyber-green' : 'border-cyber-pink bg-cyber-pink text-cyber-pink'}`}>
                  {metrics.profit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
               </div>
            </div>
            {/* Chart */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-60">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData}>
                     <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={metrics.profit >= 0 ? "#39FF14" : "#FF003C"} stopOpacity={0.4}/>
                           <stop offset="95%" stopColor={metrics.profit >= 0 ? "#39FF14" : "#FF003C"} stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={metrics.profit >= 0 ? "#39FF14" : "#FF003C"} 
                        strokeWidth={2} 
                        fill="url(#colorVal)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Widget 3: Inventory Health (Real Data) */}
         <div className={`tech-border p-6 flex flex-col justify-between hover:bg-cyber-text/5 transition-colors bg-cyber-panel ${metrics.lowStockCount > 0 ? 'border-cyber-pink/50' : ''}`}>
            <div className="flex justify-between items-start">
               <div className={`w-10 h-10 border bg-opacity-10 flex items-center justify-center ${metrics.lowStockCount > 0 ? 'border-cyber-pink bg-cyber-pink text-cyber-pink' : 'border-cyber-dim bg-gray-800 text-gray-400'}`}>
                  <Package size={20} />
               </div>
               {metrics.lowStockCount > 0 && (
                   <span className="text-[10px] font-bold bg-cyber-pink/20 text-cyber-pink px-2 py-1 border border-cyber-pink/50 animate-pulse">ACTION REQUIRED</span>
               )}
            </div>
            <div>
               <div className={`text-2xl font-bold ${metrics.lowStockCount > 0 ? 'text-cyber-pink' : 'text-cyber-text'}`}>
                  {metrics.lowStockCount} SKU
               </div>
               <div className="text-xs text-cyber-dim font-mono">低于安全库存水位</div>
            </div>
            <div className="w-full bg-gray-800 h-1 mt-2 overflow-hidden">
               <div className={`h-full w-[${Math.min(100, (metrics.lowStockCount / Math.max(1, metrics.totalProducts))*100)}%] ${metrics.lowStockCount > 0 ? 'bg-cyber-pink shadow-neon-pink' : 'bg-gray-600'}`}></div>
            </div>
         </div>

         {/* Widget 4: Logistics Status (Real Data) */}
         <div className="tech-border p-6 flex flex-col justify-between hover:bg-cyber-text/5 transition-colors bg-cyber-panel">
            <div className="flex justify-between items-start">
               <div className="w-10 h-10 border border-cyber-cyan bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
                  <Clock size={20} />
               </div>
               <span className="text-[10px] font-bold text-cyber-dim font-mono">物流监控</span>
            </div>
            <div>
               <div className="text-2xl font-bold text-cyber-text">{metrics.activeShipments} 票</div>
               <div className="text-xs text-cyber-dim font-mono">运输与清关中</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-cyber-cyan font-mono">
               <ArrowUpRight size={12} /> 实时更新
            </div>
         </div>
      </div>

      {/* Secondary Section: Dynamic AI Insights */}
      <div className="mt-8">
         <h2 className="text-xl font-bold text-cyber-text mb-4 px-2 flex items-center gap-2">
            <Cpu size={20} className="text-cyber-purple" /> 
            AI 智能决策建议
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Primary Insight */}
            <div className="col-span-1 md:col-span-2 tech-border bg-cyber-panel p-5 flex gap-4 items-center cursor-pointer group border-cyber-purple/30">
               <div className="w-12 h-12 bg-cyber-purple/10 border border-cyber-purple flex items-center justify-center text-cyber-purple shadow-neon-purple shrink-0">
                  <Zap size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-cyber-text text-sm">AERO 核心洞察</h4>
                  <p className="text-xs text-cyber-text/80 leading-tight mt-1 font-mono">{aiInsight}</p>
               </div>
            </div>

            {/* Quick Profit Stat */}
            <div className="tech-border bg-cyber-panel p-5 flex gap-4 items-center cursor-pointer group">
               <div className={`w-12 h-12 border flex items-center justify-center shrink-0 ${metrics.profit >= 0 ? 'bg-cyber-green/10 border-cyber-green text-cyber-green' : 'bg-cyber-pink/10 border-cyber-pink text-cyber-pink'}`}>
                  <Wallet size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-cyber-text text-sm">净利润 (Net Profit)</h4>
                  <p className={`text-sm font-bold font-mono mt-1 ${metrics.profit >= 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                     {metrics.profit >= 0 ? '+' : ''}¥{metrics.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </p>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};
