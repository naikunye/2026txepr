import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { CreditCard, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Bitcoin } from 'lucide-react';

const data = [
  { name: '一', value: 400 }, { name: '二', value: 300 }, { name: '三', value: 500 },
  { name: '四', value: 280 }, { name: '五', value: 590 }, { name: '六', value: 430 }, { name: '日', value: 600 },
];

export const FinanceModule: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-2 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] mb-6">
          <h1 className="text-3xl font-black text-white tracking-wider">资金账户</h1>
          <p className="text-gray-400 font-mono text-xs mt-1">CRYPTO & FIAT ASSETS</p>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Card (Cyber Card) */}
          <div className="lg:col-span-1 h-64 bg-black border border-white/10 p-6 text-white relative overflow-hidden group hover:border-cyber-purple transition-colors">
             {/* Glitch Overlay */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
             
             <div className="relative z-10 flex justify-between items-start">
                <div className="w-12 h-8 border border-cyber-yellow bg-cyber-yellow/20 flex items-center justify-center">
                   <div className="w-8 h-4 bg-cyber-yellow"></div>
                </div>
                <span className="font-mono text-lg text-cyber-purple drop-shadow-[0_0_5px_#BC13FE]">**** 4288</span>
             </div>
             
             <div className="relative z-10 mt-12">
                <div className="text-xs text-gray-400 font-mono mb-1">TOTAL BALANCE</div>
                <div className="text-3xl font-black tracking-tight text-white text-glow">$1,240,500.00</div>
             </div>

             {/* Animated Gradient Blob */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyber-purple blur-[50px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
             <div className="bg-black/40 border border-white/10 p-6 flex flex-col justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 border border-cyber-green text-cyber-green flex items-center justify-center bg-black"><ArrowUpRight size={16} /></div>
                   <span className="text-sm font-bold text-gray-400">总收入</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">$45,200</div>
             </div>
             <div className="bg-black/40 border border-white/10 p-6 flex flex-col justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 border border-cyber-pink text-cyber-pink flex items-center justify-center bg-black"><ArrowDownRight size={16} /></div>
                   <span className="text-sm font-bold text-gray-400">总支出</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">$12,800</div>
             </div>
             
             {/* Mini Chart */}
             <div className="col-span-2 bg-black/40 border border-white/10 p-6 h-48 relative">
                <div className="text-sm font-bold text-gray-400 mb-4 font-mono">周资金流向 (Weekly Flow)</div>
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data}>
                      <Bar dataKey="value" fill="#333" stroke="#00F0FF" strokeWidth={1} barSize={30} />
                      <Tooltip 
                        cursor={{fill: 'rgba(0, 240, 255, 0.1)'}}
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #00F0FF', color: '#fff' }}
                      />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>

       {/* Transactions List */}
       <div className="tech-border p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <Bitcoin size={20} className="text-cyber-yellow" /> 近期交易记录
          </h3>
          <div className="space-y-4">
             {[1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 border-b border-white/5 cursor-pointer group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-gray-700 bg-black flex items-center justify-center text-gray-500 group-hover:text-cyber-cyan group-hover:border-cyber-cyan transition-colors">
                         <DollarSign size={18} />
                      </div>
                      <div>
                         <div className="font-bold text-white text-sm">物流支付单 #{100+i}</div>
                         <div className="text-xs text-gray-500 font-mono">深圳中心枢纽 • 1月{i+1}日</div>
                      </div>
                   </div>
                   <div className="font-mono font-bold text-cyber-pink">-$2,400.00</div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};