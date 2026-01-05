import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell, ComposedChart, Line, Legend, PieChart, Pie
} from 'recharts';
import { 
  CreditCard, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, 
  Bitcoin, Globe, RefreshCcw, Landmark, FileText, PieChart as PieIcon,
  TrendingUp, TrendingDown, ArrowRightLeft, ShieldCheck, Download,
  Plus, Filter, Search, Calendar, Tag, MoreHorizontal, X, Check, Trash2,
  ChevronDown
} from 'lucide-react';

// --- Types ---

interface Transaction {
  id: string;
  desc: string;
  amount: number;
  type: 'in' | 'out';
  currency: string;
  category: string;
  date: string;
  status: 'Cleared' | 'Processing' | 'Pending';
}

// --- Mock Data ---

const cashFlowData = [
  { name: 'Jan', revenue: 4000, expenses: 2400, net: 1600 },
  { name: 'Feb', revenue: 3000, expenses: 1398, net: 1602 },
  { name: 'Mar', revenue: 5000, expenses: 3800, net: 1200 },
  { name: 'Apr', revenue: 7780, expenses: 3908, net: 3872 },
  { name: 'May', revenue: 6890, expenses: 4800, net: 2090 },
  { name: 'Jun', revenue: 8390, expenses: 3800, net: 4590 },
  { name: 'Jul', revenue: 9490, expenses: 4300, net: 5190 },
];

const costStructureData = [
  { name: 'COGS (产品成本)', value: 35, color: '#333' },
  { name: 'Logistics (物流)', value: 25, color: '#00F0FF' },
  { name: 'Marketing (营销)', value: 20, color: '#BC13FE' },
  { name: 'Platform (佣金)', value: 15, color: '#FF003C' },
  { name: 'Ops (运营杂费)', value: 5, color: '#FCEE0A' },
];

const initialTransactions: Transaction[] = [
  { id: 'TX-9921', desc: 'Amazon Settlement (US)', amount: 45230.00, type: 'in', currency: 'USD', category: 'Sales', date: '2025-01-04 14:20', status: 'Cleared' },
  { id: 'TX-9920', desc: 'Supplier Payment: Shenzhen Tech', amount: 120000.00, type: 'out', currency: 'CNY', category: 'COGS', date: '2025-01-04 09:15', status: 'Processing' },
  { id: 'TX-9919', desc: 'FedEx Logistics Invoice', amount: 3450.50, type: 'out', currency: 'USD', category: 'Logistics', date: '2025-01-03 18:00', status: 'Cleared' },
  { id: 'TX-9918', desc: 'TikTok Shop Payout (UK)', amount: 8200.00, type: 'in', currency: 'GBP', category: 'Sales', date: '2025-01-02 11:30', status: 'Cleared' },
  { id: 'TX-9917', desc: 'AWS Cloud Services', amount: 450.00, type: 'out', currency: 'USD', category: 'Ops', date: '2025-01-01 10:00', status: 'Cleared' },
];

const categories = ['Sales', 'COGS', 'Logistics', 'Marketing', 'Ops', 'Tax', 'Salary'];
const currencies = ['USD', 'CNY', 'EUR', 'GBP', 'USDT'];

// --- Components ---

export const FinanceModule: React.FC = () => {
  const [activeCurrency, setActiveCurrency] = useState('USD');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'out',
    currency: 'USD',
    category: 'Ops',
    status: 'Cleared'
  });

  // --- Helpers ---
  const handleAddTransaction = () => {
    if (!newTx.amount || !newTx.desc) return;
    
    const tx: Transaction = {
      id: `TX-${Math.floor(Math.random() * 10000)}`,
      desc: newTx.desc,
      amount: Number(newTx.amount),
      type: newTx.type as 'in' | 'out',
      currency: newTx.currency as string,
      category: newTx.category as string,
      date: new Date().toLocaleString(),
      status: newTx.status as any
    };

    setTransactions([tx, ...transactions]);
    setIsModalOpen(false);
    setNewTx({ type: 'out', currency: 'USD', category: 'Ops', status: 'Cleared', desc: '', amount: undefined });
  };

  const handleDelete = (id: string) => {
    if (confirm('确认删除此条流水记录吗？此操作不可逆。')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.desc.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  // --- Sub-components ---

  const CurrencyCard = ({ code, symbol, balance, trend, trendVal, chartColor }: any) => (
    <div 
      onClick={() => setActiveCurrency(code)}
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 group border rounded-xl p-5 h-36 flex flex-col justify-between ${
        activeCurrency === code 
          ? 'bg-cyber-cyan/10 border-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
          : 'bg-black/40 border-white/10 hover:border-white/30'
      }`}
    >
       <div className="flex justify-between items-start z-10 relative">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white font-mono text-xs">
                {symbol}
             </div>
             <span className="font-bold text-gray-400 text-sm tracking-wider">{code}</span>
          </div>
          <div className={`text-xs font-mono flex items-center ${trend === 'up' ? 'text-cyber-green' : 'text-cyber-pink'}`}>
             {trend === 'up' ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
             {trendVal}
          </div>
       </div>
       
       <div className="z-10 relative">
          <div className="text-2xl font-black text-white tracking-tight">{balance}</div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">Available Balance</div>
       </div>

       {/* Background Chart Effect */}
       <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={cashFlowData}>
                <Area type="monotone" dataKey="revenue" stroke={chartColor} fill={chartColor} fillOpacity={0.4} />
             </AreaChart>
          </ResponsiveContainer>
       </div>
    </div>
  );

  const Modal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#0c0c0c] border border-white/10 w-full max-w-md rounded-lg shadow-2xl relative">
           <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <FileText size={18} className="text-cyber-cyan"/> 记账 (Record Transaction)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
           </div>
           
           <div className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="flex bg-black p-1 border border-white/10 rounded">
                 <button 
                   onClick={() => setNewTx({...newTx, type: 'in'})}
                   className={`flex-1 py-2 text-xs font-bold transition-all ${newTx.type === 'in' ? 'bg-cyber-green text-black' : 'text-gray-500 hover:text-white'}`}
                 >
                    + 收入 (Income)
                 </button>
                 <button 
                   onClick={() => setNewTx({...newTx, type: 'out'})}
                   className={`flex-1 py-2 text-xs font-bold transition-all ${newTx.type === 'out' ? 'bg-cyber-pink text-black' : 'text-gray-500 hover:text-white'}`}
                 >
                    - 支出 (Expense)
                 </button>
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-2">
                    <label className="text-[10px] text-gray-500 font-mono uppercase mb-1 block">金额 (Amount)</label>
                    <input 
                      type="number" 
                      value={newTx.amount || ''}
                      onChange={e => setNewTx({...newTx, amount: e.target.valueAsNumber})}
                      placeholder="0.00" 
                      className="w-full bg-black border border-white/20 p-2 text-white font-mono focus:border-cyber-cyan outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase mb-1 block">币种</label>
                    <select 
                      value={newTx.currency}
                      onChange={e => setNewTx({...newTx, currency: e.target.value})}
                      className="w-full bg-black border border-white/20 p-2 text-white font-mono focus:border-cyber-cyan outline-none"
                    >
                       {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              {/* Desc */}
              <div>
                 <label className="text-[10px] text-gray-500 font-mono uppercase mb-1 block">交易摘要 (Description)</label>
                 <input 
                    value={newTx.desc || ''}
                    onChange={e => setNewTx({...newTx, desc: e.target.value})}
                    placeholder="e.g. 物流费用支付" 
                    className="w-full bg-black border border-white/20 p-2 text-white text-sm focus:border-cyber-cyan outline-none"
                 />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase mb-1 block">分类 (Category)</label>
                    <select 
                      value={newTx.category}
                      onChange={e => setNewTx({...newTx, category: e.target.value})}
                      className="w-full bg-black border border-white/20 p-2 text-white text-sm focus:border-cyber-cyan outline-none"
                    >
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase mb-1 block">状态 (Status)</label>
                    <select 
                      value={newTx.status}
                      onChange={e => setNewTx({...newTx, status: e.target.value as any})}
                      className="w-full bg-black border border-white/20 p-2 text-white text-sm focus:border-cyber-cyan outline-none"
                    >
                       <option value="Cleared">已入账 (Cleared)</option>
                       <option value="Processing">处理中 (Processing)</option>
                       <option value="Pending">待定 (Pending)</option>
                    </select>
                 </div>
              </div>

              <button 
                onClick={handleAddTransaction}
                className="w-full py-3 bg-cyber-cyan text-black font-bold uppercase tracking-wider hover:bg-white transition-all shadow-neon-cyan mt-4"
              >
                 确认记账
              </button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
       
       <Modal />

       {/* Sticky Header */}
       <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-2 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] mb-6 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-black text-white tracking-wider flex items-center gap-3">
                财务中心 <span className="text-cyber-cyan text-sm px-2 py-0.5 border border-cyber-cyan rounded align-top mt-1 font-mono">GLOBAL</span>
             </h1>
             <p className="text-gray-400 font-mono text-xs mt-1">全球资金归集 / 智能记账 / 利润分析</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-white/20 text-gray-300 text-xs font-bold hover:bg-white hover:text-black transition-all">
                <RefreshCcw size={14} /> 实时汇率同步
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-cyber-cyan text-black text-xs font-bold hover:bg-white transition-all shadow-neon-cyan">
                <ArrowRightLeft size={14} /> 内部转账
             </button>
          </div>
       </div>
       
       {/* Top Row: Global Assets Overview */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Total Consolidated Assets */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             {/* Asset Summary Card */}
             <div className="tech-border p-8 bg-gradient-to-br from-cyber-panel to-black relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Landmark size={120} className="text-cyber-cyan" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-end relative z-10">
                   <div>
                      <div className="flex items-center gap-2 text-cyber-cyan font-mono text-xs mb-2">
                         <ShieldCheck size={14} /> 资金安全托管中
                      </div>
                      <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest">全球总资产估值 (USD)</h2>
                      <div className="text-5xl font-black text-white mt-2 text-glow flex items-baseline gap-2">
                         $2,845,920<span className="text-2xl text-gray-500">.45</span>
                      </div>
                      <div className="mt-4 flex gap-6 text-sm font-mono">
                         <span className="text-cyber-green flex items-center gap-1"><ArrowUpRight size={14}/> +$12,400 (今日)</span>
                         <span className="text-gray-500">汇率损益: <span className="text-cyber-pink">-$240.00</span></span>
                      </div>
                   </div>
                   
                   {/* Mini Actions */}
                   <div className="flex gap-2 mt-4 md:mt-0">
                      <div className="text-center px-4">
                         <div className="text-xs text-gray-500 mb-1">待结算</div>
                         <div className="text-white font-bold">$450k</div>
                      </div>
                      <div className="w-[1px] bg-white/10"></div>
                      <div className="text-center px-4">
                         <div className="text-xs text-gray-500 mb-1">冻结中</div>
                         <div className="text-white font-bold">$12k</div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Currency Wallets Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CurrencyCard code="USD" symbol="$" balance="1,240,500" trend="up" trendVal="2.4%" chartColor="#00F0FF" />
                <CurrencyCard code="CNY" symbol="¥" balance="8,400,200" trend="down" trendVal="0.5%" chartColor="#FF003C" />
                <CurrencyCard code="EUR" symbol="€" balance="45,200" trend="up" trendVal="1.2%" chartColor="#39FF14" />
                <CurrencyCard code="USDT" symbol="₮" balance="125,000" trend="up" trendVal="0.1%" chartColor="#BC13FE" />
             </div>
          </div>

          {/* Right: Profit & Loss Waterfall / Cost Structure */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="tech-border p-6 bg-black/40 h-full flex flex-col">
                <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-6">
                   <PieIcon size={16} className="text-cyber-purple"/> 成本结构分析 (Cost Structure)
                </h3>
                
                {/* Fixed Container Height to prevent clipping */}
                <div className="flex-1 min-h-[250px] relative w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                            data={costStructureData}
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="80%" 
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                         >
                            {costStructureData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                         />
                      </PieChart>
                   </ResponsiveContainer>
                   {/* Center Stats */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-gray-500 text-[10px] uppercase">净利润率</span>
                      <span className="text-3xl font-black text-white">18%</span>
                   </div>
                </div>

                <div className="space-y-3 mt-4">
                   {costStructureData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-gray-400">{item.name}</span>
                         </div>
                         <span className="text-white font-mono">{item.value}%</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>

       {/* Middle Row: Cash Flow Analytics (Complex Chart) */}
       <div className="tech-border p-6 bg-black/40">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <TrendingUp size={20} className="text-cyber-green"/> 现金流与利润趋势 (Cash Flow & P&L)
                </h3>
             </div>
             <div className="flex gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 text-gray-400"><div className="w-3 h-3 bg-cyber-cyan opacity-50"></div> 收入 (Revenue)</div>
                <div className="flex items-center gap-2 text-gray-400"><div className="w-3 h-3 bg-cyber-pink opacity-50"></div> 支出 (Expense)</div>
                <div className="flex items-center gap-2 text-white"><div className="w-3 h-1 bg-cyber-green"></div> 净现金流 (Net)</div>
             </div>
          </div>
          
          <div className="h-[350px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashFlowData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                   <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#FF003C" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#FF003C" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid stroke="#222" vertical={false} strokeDasharray="3 3" />
                   <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#050505', border: '1px solid #333', color: '#fff' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   />
                   <Bar dataKey="revenue" barSize={20} fill="url(#colorRev)" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="expenses" barSize={20} fill="url(#colorExp)" radius={[4, 4, 0, 0]} />
                   <Line type="monotone" dataKey="net" stroke="#39FF14" strokeWidth={3} dot={{r: 4, fill: '#000', stroke: '#39FF14', strokeWidth: 2}} />
                </ComposedChart>
             </ResponsiveContainer>
          </div>
       </div>

       {/* Bottom Row: The Interactive Ledger (Transactions) */}
       <div className="tech-border p-0 bg-black/40 overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0c0c0c]">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-white"/> 全球流水账本 (Global Ledger)
             </h3>
             <div className="flex gap-3">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                   <input 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="搜索交易号 / 对方账户..." 
                      className="bg-black border border-white/20 pl-10 pr-4 py-2 text-xs text-white outline-none w-64 focus:border-cyber-cyan transition-colors" 
                   />
                </div>
                
                {/* Filter Buttons */}
                <div className="flex bg-black border border-white/20 rounded overflow-hidden">
                   <button onClick={() => setFilterType('all')} className={`px-3 py-1 text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>全部</button>
                   <button onClick={() => setFilterType('in')} className={`px-3 py-1 text-xs font-bold transition-all ${filterType === 'in' ? 'bg-cyber-green text-black' : 'text-gray-500 hover:text-white'}`}>收入</button>
                   <button onClick={() => setFilterType('out')} className={`px-3 py-1 text-xs font-bold transition-all ${filterType === 'out' ? 'bg-cyber-pink text-black' : 'text-gray-500 hover:text-white'}`}>支出</button>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-cyber-cyan text-black text-xs font-bold hover:bg-white transition-all flex items-center gap-2 shadow-neon-cyan"
                >
                   <Plus size={14} /> 记一笔
                </button>
             </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 font-mono text-xs uppercase sticky top-0 backdrop-blur-sm z-10">
                   <tr>
                      <th className="p-4 pl-6">交易状态</th>
                      <th className="p-4">摘要 / 类别</th>
                      <th className="p-4">交易时间</th>
                      <th className="p-4">币种</th>
                      <th className="p-4 text-right pr-6">金额</th>
                      <th className="p-4 w-10">操作</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                         <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                               <div className={`w-2 h-2 rounded-full ${tx.status === 'Cleared' ? 'bg-cyber-green shadow-[0_0_8px_#39FF14]' : tx.status === 'Processing' ? 'bg-cyber-yellow animate-pulse' : 'bg-gray-500'}`}></div>
                               <div>
                                  <div className="text-white font-bold text-xs">{tx.status === 'Cleared' ? '已入账' : tx.status === 'Processing' ? '处理中' : '待处理'}</div>
                                  <div className="text-[10px] text-gray-500 font-mono">{tx.id}</div>
                               </div>
                            </div>
                         </td>
                         <td className="p-4">
                            <div className="text-white font-medium group-hover:text-cyber-cyan transition-colors">{tx.desc}</div>
                            <div className="flex gap-2 mt-1">
                               <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{tx.category}</span>
                               <span className={`text-[10px] font-bold ${tx.type === 'in' ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                                  {tx.type === 'in' ? 'INCOME' : 'EXPENSE'}
                               </span>
                            </div>
                         </td>
                         <td className="p-4 text-gray-400 font-mono text-xs">
                            {tx.date}
                         </td>
                         <td className="p-4">
                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-300">
                               {tx.currency}
                            </span>
                         </td>
                         <td className={`p-4 pr-6 text-right font-mono font-bold text-base ${tx.type === 'in' ? 'text-cyber-green' : 'text-white'}`}>
                            {tx.type === 'in' ? '+' : '-'} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </td>
                         <td className="p-4 text-center">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                              className="text-gray-600 hover:text-cyber-pink transition-colors p-2"
                              title="删除记录"
                            >
                               <Trash2 size={16} />
                            </button>
                         </td>
                      </tr>
                   ))}
                   {filteredTransactions.length === 0 && (
                      <tr>
                         <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                            没有找到符合条件的交易记录。
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
          <div className="p-3 bg-black/50 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
             <span>显示 {filteredTransactions.length} 条记录</span>
             <button className="flex items-center gap-1 hover:text-white transition-colors">
                <Download size={12} /> 导出报表 (Excel)
             </button>
          </div>
       </div>

    </div>
  );
};