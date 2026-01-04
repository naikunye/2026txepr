import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, Activity, ShoppingCart, Target, ArrowUpRight, TrendingUp, Zap, Radio } from 'lucide-react';

const revenueData = [
  { name: '00:00', value: 2400 },
  { name: '04:00', value: 1398 },
  { name: '08:00', value: 9800 },
  { name: '12:00', value: 3908 },
  { name: '16:00', value: 4800 },
  { name: '20:00', value: 3800 },
  { name: '23:59', value: 4300 },
];

const sourceData = [
  { name: '直接访问', value: 400, color: '#00F0FF' }, // Cyan
  { name: '社媒推广', value: 300, color: '#BC13FE' }, // Purple
  { name: '自然搜索', value: 300, color: '#39FF14' }, // Green
  { name: '付费广告', value: 200, color: '#FF003C' }, // Pink
];

export const DataIntelligenceModule: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-2 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-white tracking-wider">数据智脑 <span className="text-cyber-cyan text-sm align-top">V2.0</span></h1>
           <p className="text-gray-400 font-mono text-xs">实时 BI 与财务分析系统 / ONLINE</p>
        </div>
        <div className="flex bg-black border border-white/20 p-1">
           {['今日', '本周', '本月', '全年'].map((t, i) => (
             <button key={t} className={`px-4 py-1.5 text-xs font-bold transition-all ${i===0 ? 'bg-cyber-cyan text-black' : 'text-gray-500 hover:text-white'}`}>
               {t}
             </button>
           ))}
        </div>
      </div>

      {/* Gemini Insight Banner */}
      <div className="w-full tech-border p-6 flex items-start gap-4 relative overflow-hidden group">
        <div className="absolute inset-0 bg-cyber-purple/5 group-hover:bg-cyber-purple/10 transition-colors"></div>
        <div className="p-3 border border-cyber-purple text-cyber-purple bg-black relative z-10 shadow-neon-purple">
           <Sparkles size={24} />
        </div>
        <div className="flex-1 relative z-10">
           <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-white tracking-wide">AI 深度洞察</span>
              <span className="px-2 py-0.5 border border-cyber-purple text-[10px] font-mono text-cyber-purple flex items-center gap-1">
                 <Radio size={10} className="animate-pulse" /> LIVE
              </span>
           </div>
           <p className="text-sm text-gray-300 leading-relaxed font-mono">
             当前营收速率保持<span className="text-cyber-green font-bold">稳定</span>。然而，由于广告支出增加，净利润率接近 <span className="text-cyber-pink font-bold">0%</span>。建议优化“家居”类目 SKU 的物流链路成本。
           </p>
        </div>
        <button className="hidden md:flex px-4 py-2 bg-transparent border border-white/20 text-xs font-bold text-white hover:border-cyber-cyan hover:text-cyber-cyan transition-colors items-center gap-2">
           <Zap size={14} /> 生成报告
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { title: 'GMV (总交易额)', val: '¥124,500', icon: ShoppingCart, color: 'text-cyber-cyan', border: 'border-cyber-cyan' },
           { title: 'ROI (投产比)', val: '3.2x', icon: Target, color: 'text-cyber-purple', border: 'border-cyber-purple' },
           { title: 'AOV (客单价)', val: '¥42.80', icon: ShoppingCart, color: 'text-cyber-yellow', border: 'border-cyber-yellow' },
           { title: '净利润', val: '¥12,400', icon: Activity, color: 'text-cyber-green', border: 'border-cyber-green' }
         ].map((m, i) => (
           <div key={i} className="bg-black/40 border border-white/10 p-5 hover:border-white/30 transition-all relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${m.color.replace('text-', 'bg-')}`}></div>
              <div className="flex justify-between items-start mb-3">
                 <div className={`p-2 border ${m.border} bg-black/50 ${m.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                    <m.icon size={18} />
                 </div>
                 <div className="flex items-center text-cyber-green text-xs font-mono font-bold">
                    <ArrowUpRight size={12} /> +4.2%
                 </div>
              </div>
              <div className="text-xs font-bold text-gray-500 font-mono uppercase tracking-wider mb-1">{m.title}</div>
              <div className="text-2xl font-black text-white tracking-tight">{m.val}</div>
           </div>
         ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Flow */}
        <div className="lg:col-span-2 tech-border p-8 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 营收趋势流
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono">
                 <span className="flex items-center gap-1.5 text-gray-400"><div className="w-2 h-2 bg-cyber-cyan"></div> 实际收入</span>
                 <span className="flex items-center gap-1.5 text-gray-400"><div className="w-2 h-2 border border-cyber-cyan"></div> AI预测</span>
              </div>
           </div>
           <div className="flex-1 w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueData}>
                    <defs>
                       <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `¥${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }}
                      itemStyle={{ color: '#00F0FF' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Source Estimations */}
        <div className="tech-border p-8 flex flex-col relative">
           <div className="mb-6">
              <h3 className="text-lg font-bold text-white">渠道占比</h3>
              <p className="text-xs text-gray-500 mt-1 font-mono">Revenue Mix by Source</p>
           </div>
           <div className="flex-1 w-full h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={sourceData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                    >
                       {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '0' }} />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="text-4xl font-black text-white tracking-tighter">4</div>
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">主要渠道</div>
              </div>
           </div>
           
           <div className="mt-4 grid grid-cols-2 gap-2">
             {sourceData.map((s) => (
               <div key={s.name} className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                 <div className="w-2 h-2" style={{backgroundColor: s.color, boxShadow: `0 0 5px ${s.color}`}}></div>
                 {s.name}
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};