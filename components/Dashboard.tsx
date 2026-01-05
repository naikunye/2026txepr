import React from 'react';
import { MetricData } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { Wallet, Globe, ArrowUpRight, TrendingUp, Package, Clock, Zap, Cpu, Activity, AlertTriangle } from 'lucide-react';

// Simulated Data
const chartData = [
  { name: 'Mon', value: 4000 }, { name: 'Tue', value: 3000 }, { name: 'Wed', value: 2000 }, 
  { name: 'Thu', value: 2780 }, { name: 'Fri', value: 1890 }, { name: 'Sat', value: 2390 }, { name: 'Sun', value: 3490 }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-cyber-border pb-6 pt-2 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row justify-between items-end gap-4">
         <div>
            <div className="text-xs font-mono text-cyber-cyan/70 uppercase tracking-widest mb-1 flex items-center gap-2">
               <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-ping"></span>
               系统时间: 2026.01.04
            </div>
            <h1 className="text-4xl font-black text-cyber-text tracking-wider text-glow">全域指挥中心</h1>
         </div>
         <div className="flex items-center gap-3">
             <span className="flex items-center gap-2 px-4 py-2 border border-cyber-green/30 bg-cyber-green/5 text-cyber-green text-xs font-mono tracking-wider">
                <Activity size={14} />
                系统状态: 正常运转
             </span>
         </div>
      </div>

      {/* Main BENTO GRID Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[180px]">
         
         {/* Widget 1: Global Map (Cross-border Core) - Spans 2x2 */}
         <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 tech-border p-0 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-panel via-black/20 to-black/20 opacity-90 z-0"></div>
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
               <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2 text-cyber-text">
                     <Globe className="text-cyber-cyan" /> 全球运营态势
                  </h3>
                  <p className="text-cyber-dim mt-1 font-mono text-xs">实时追踪 12 个活跃物流节点</p>
               </div>
               
               {/* Status Pills */}
               <div className="flex gap-3">
                  <div className="px-4 py-2 border-l-2 border-cyber-green bg-cyber-bg/50 backdrop-blur text-xs font-mono text-cyber-text">
                     <span className="text-cyber-green mr-2 animate-pulse">●</span> 美西仓: 活跃
                  </div>
                  <div className="px-4 py-2 border-l-2 border-cyber-yellow bg-cyber-bg/50 backdrop-blur text-xs font-mono text-cyber-text">
                     <span className="text-cyber-yellow mr-2 animate-pulse">●</span> 欧洲中心: 延迟
                  </div>
               </div>
            </div>

            {/* Abstract Globe Hologram */}
            <div className="absolute top-1/2 right-[-10%] w-[400px] h-[400px] rounded-full border border-cyber-cyan/20 -translate-y-1/2 group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute top-1/2 right-[-5%] w-[300px] h-[300px] rounded-full border border-cyber-cyan/30 border-dashed -translate-y-1/2 animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute top-1/2 right-[5%] w-[150px] h-[150px] rounded-full bg-cyber-cyan/10 blur-xl -translate-y-1/2"></div>
         </div>

         {/* Widget 2: Net Revenue - Large Graph */}
         <div className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 tech-border p-6 relative overflow-hidden bg-cyber-panel">
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <div className="text-xs font-mono text-cyber-dim uppercase tracking-widest">净营收 (Net Revenue)</div>
                  <div className="text-3xl font-bold text-cyber-text mt-1 text-glow">¥1,245,890</div>
               </div>
               <div className="w-10 h-10 border border-cyber-green bg-cyber-green/10 flex items-center justify-center text-cyber-green">
                  <TrendingUp size={20} />
               </div>
            </div>
            {/* Smooth Chart at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-60">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#39FF14" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Area type="monotone" dataKey="value" stroke="#39FF14" strokeWidth={2} fill="url(#colorVal)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Widget 3: Inventory Health */}
         <div className="tech-border p-6 flex flex-col justify-between hover:bg-cyber-text/5 transition-colors bg-cyber-panel">
            <div className="flex justify-between items-start">
               <div className="w-10 h-10 border border-cyber-pink bg-cyber-pink/10 flex items-center justify-center text-cyber-pink">
                  <Package size={20} />
               </div>
               <span className="text-[10px] font-bold bg-cyber-pink/20 text-cyber-pink px-2 py-1 border border-cyber-pink/50">库存警报</span>
            </div>
            <div>
               <div className="text-2xl font-bold text-cyber-text">12 SKU</div>
               <div className="text-xs text-cyber-dim font-mono">库存水位低于阈值</div>
            </div>
            <div className="w-full bg-gray-800 h-1 mt-2 overflow-hidden">
               <div className="bg-cyber-pink h-full w-[35%] shadow-neon-pink"></div>
            </div>
         </div>

         {/* Widget 4: Logistics Efficiency */}
         <div className="tech-border p-6 flex flex-col justify-between hover:bg-cyber-text/5 transition-colors bg-cyber-panel">
            <div className="flex justify-between items-start">
               <div className="w-10 h-10 border border-cyber-cyan bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
                  <Clock size={20} />
               </div>
               <span className="text-[10px] font-bold text-cyber-dim font-mono">平均时效</span>
            </div>
            <div>
               <div className="text-2xl font-bold text-cyber-text">14.2 天</div>
               <div className="text-xs text-cyber-dim font-mono">中国 &rarr; 美西</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-cyber-green font-mono">
               <ArrowUpRight size={12} /> 效率提升 12%
            </div>
         </div>
      </div>

      {/* Secondary Section: Smart Insights */}
      <div className="mt-8">
         <h2 className="text-xl font-bold text-cyber-text mb-4 px-2 flex items-center gap-2">
            <Cpu size={20} className="text-cyber-purple" /> 
            AI 智能洞察
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Insight Card 1 */}
            <div className="tech-border bg-cyber-panel p-5 flex gap-4 items-center cursor-pointer group">
               <div className="w-12 h-12 bg-cyber-purple/10 border border-cyber-purple flex items-center justify-center text-cyber-purple shadow-neon-purple group-hover:bg-cyber-purple group-hover:text-black transition-all">
                  <Zap size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-cyber-text text-sm">营销 ROI 飙升</h4>
                  <p className="text-xs text-cyber-dim leading-tight mt-1">TikTok 广告转化率提升 +24%</p>
               </div>
            </div>

            {/* Insight Card 2 */}
            <div className="tech-border bg-cyber-panel p-5 flex gap-4 items-center cursor-pointer group">
               <div className="w-12 h-12 bg-cyber-cyan/10 border border-cyber-cyan flex items-center justify-center text-cyber-cyan shadow-neon-cyan group-hover:bg-cyber-cyan group-hover:text-black transition-all">
                  <Globe size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-cyber-text text-sm">新市场机会</h4>
                  <p className="text-xs text-cyber-dim leading-tight mt-1">德国市场对 SKU 20-25 需求激增</p>
               </div>
            </div>

             {/* Insight Card 3 */}
            <div className="tech-border bg-cyber-panel p-5 flex gap-4 items-center cursor-pointer group">
               <div className="w-12 h-12 bg-cyber-pink/10 border border-cyber-pink flex items-center justify-center text-cyber-pink shadow-neon-pink group-hover:bg-cyber-pink group-hover:text-white transition-all">
                  <AlertTriangle size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-cyber-text text-sm">现金流预警</h4>
                  <p className="text-xs text-cyber-dim leading-tight mt-1">供应商款项将在 3 天后到期</p>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};