import React, { useState, useEffect } from 'react';
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
import { usePersistence } from '../hooks/usePersistence';

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

const initialTransactions: Transaction[] = [
  { id: 'TX-9921', desc: 'Amazon Settlement (US)', amount: 45230.00, type: 'in', currency: 'USD', category: 'Sales', date: '2025-01-04 14:20', status: 'Cleared' },
  { id: 'TX-9920', desc: 'Supplier Payment: Shenzhen Tech', amount: 120000.00, type: 'out', currency: 'CNY', category: 'COGS', date: '2025-01-04 09:15', status: 'Processing' },
  { id: 'TX-9919', desc: 'FedEx Logistics Invoice', amount: 3450.50, type: 'out', currency: 'USD', category: 'Logistics', date: '2025-01-03 18:00', status: 'Cleared' },
  { id: 'TX-9918', desc: 'TikTok Shop Payout (UK)', amount: 8200.00, type: 'in', currency: 'GBP', category: 'Sales', date: '2025-01-02 11:30', status: 'Cleared' },
  { id: 'TX-9917', desc: 'AWS Cloud Services', amount: 450.00, type: 'out', currency: 'USD', category: 'Ops', date: '2025-01-01 10:00', status: 'Cleared' },
  // Historical data for chart visuals (simulated past months)
  { id: 'TX-HIST-1', desc: 'Dec Sales', amount: 9800, type: 'in', currency: 'USD', category: 'Sales', date: '2024-12-15 10:00', status: 'Cleared' },
  { id: 'TX-HIST-2', desc: 'Dec COGS', amount: 4000, type: 'out', currency: 'USD', category: 'COGS', date: '2024-12-16 10:00', status: 'Cleared' },
  { id: 'TX-HIST-3', desc: 'Nov Sales', amount: 8500, type: 'in', currency: 'USD', category: 'Sales', date: '2024-11-15 10:00', status: 'Cleared' },
  { id: 'TX-HIST-4', desc: 'Nov Ads', amount: 3000, type: 'out', currency: 'USD', category: 'Marketing', date: '2024-11-16 10:00', status: 'Cleared' },
];

const categories = ['Sales', 'COGS', 'Logistics', 'Marketing', 'Ops', 'Tax', 'Salary'];
const currencies = ['USD', 'CNY', 'EUR', 'GBP', 'USDT'];

const categoryColors: Record<string, string> = {
    'COGS': '#333',
    'Logistics': '#00F0FF',
    'Marketing': '#BC13FE',
    'Platform': '#FF003C',
    'Ops': '#FCEE0A',
    'Tax': '#666',
    'Salary': '#39FF14',
    'Sales': '#39FF14'
};

// --- Components ---

export const FinanceModule: React.FC = () => {
  const [activeCurrency, setActiveCurrency] = useState('USD');
  
  // Use Persistence
  const [transactions, setTransactions] = usePersistence<Transaction[]>('AERO_FINANCE_DATA', initialTransactions);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  
  // Chart Data State
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [costStructureData, setCostStructureData] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'out',
    currency: 'USD',
    category: 'Ops',
    status: 'Cleared'
  });

  // --- Dynamic Calculation Effect ---
  useEffect(() => {
      // 1. Calculate Cost Structure (Expenses only)
      const expenses = transactions.filter(t => t.type === 'out');
      const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
      
      const costMap: Record<string, number> = {};
      expenses.forEach(t => {
          costMap[t.category] = (costMap[t.category] || 0) + t.amount;
      });

      const costs = Object.keys(costMap).map(cat => ({
          name: cat,
          value: totalExpense > 0 ? parseFloat(((costMap[cat] / totalExpense) * 100).toFixed(1)) : 0,
          color: categoryColors[cat] || '#888'
      })).sort((a, b) => b.value - a.value);
      setCostStructureData(costs);

      // 2. Calculate Cash Flow (Group by Month) - Simple approximation using string matching or Date parsing
      const monthMap: Record<string, { revenue: number, expenses: number }> = {};
      
      transactions.forEach(t => {
          // Attempt to parse date. Formats might vary, so we handle basic ISO or YYYY-MM-DD
          try {
              const d = new Date(t.date);
              if(isNaN(d.getTime())) return; // skip invalid dates
              const key = d.toLocaleString('en-US', { month: 'short' }); // e.g., 'Jan'
              if (!monthMap[key]) monthMap[key] = { revenue: 0, expenses: 0 };
              
              if (t.type === 'in') monthMap[key].revenue += t.amount;
              else monthMap[key].expenses += t.amount;
          } catch(e) {}
      });

      // Order months? Ideally use a full date sort, but for this mock-ish view, standard calendar order or just existing keys is fine.
      // Let's force a standard order if keys exist
      const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const flowData = monthsOrder
        .filter(m => monthMap[m])
        .map(m => ({
            name: m,
            revenue: monthMap[m].revenue,
            expenses: monthMap[m].expenses,
            net: monthMap[m].revenue - monthMap[m].expenses
        }));
      
      // If empty (new system), seed with empty months
      if (flowData.length === 0) {
          const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
          setCashFlowData([{ name: currentMonth, revenue: 0, expenses: 0, net: 0 }]);
      } else {
          setCashFlowData(flowData);
      }

      // 3. Total Balance (Simple Sum of all in - out)
      const balance = transactions.reduce((acc, t) => t.type === 'in' ? acc + t.amount : acc - t.amount, 0);
      setTotalBalance(balance);

  }, [transactions]);

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
      date: new Date().toISOString(), // Use ISO for consistency now
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
          : 'bg-cyber-panel border-cyber-border hover:border-cyber-dim'
      }`}
    >
       <div className="flex justify-between items-start z-10 relative">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-cyber-bg flex items-center justify-center border border-cyber-border text-cyber-text font-mono text-xs">
                {symbol}
             </div>
             <span className="font-bold text-cyber-dim text-sm tracking-wider">{code}</span>
          </div>
          <div className={`text-xs font-mono flex items-center ${trend === 'up' ? 'text-cyber-green' : 'text-cyber-pink'}`}>
             {trend === 'up' ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
             {trendVal}
          </div>
       </div>
       
       <div className="z-10 relative">
          <div className="text-2xl font-black text-cyber-text tracking-tight">{balance}</div>
          <div className="text-[10px] text-cyber-dim font-mono mt-1">Available Balance</div>
       </div>

       {/* Background Chart Effect */}
       <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={cashFlowData.length > 0 ? cashFlowData : [{revenue:0},{revenue:0}]}>
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
        <div className="bg-cyber-panel border border-cyber-border w-full max-w-md rounded-lg shadow-2xl relative">
           <div className="p-6 border-b border-cyber-border flex justify-between items-center bg-cyber-bg/50">
              <h3 className="text-lg font-bold text-cyber-text flex items-center gap-2">
                 <FileText size={18} className="text-cyber-cyan"/> 记账 (Record Transaction)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-cyber-dim hover:text-cyber-text"><X size={20} /></button>
           </div>
           
           <div className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="flex bg-cyber-bg p-1 border border-cyber-border rounded">
                 <button 
                   onClick={() => setNewTx({...newTx, type: 'in'})}
                   className={`flex-1 py-2 text-xs font-bold transition-all ${newTx.type === 'in' ? 'bg-cyber-green text-black' : 'text-cyber-dim hover:text-cyber-text'}`}
                 >
                    + 收入 (Income)
                 </button>
                 <button 
                   onClick={() => setNewTx({...newTx, type: 'out'})}
                   className={`flex-1 py-2 text-xs font-bold transition-all ${newTx.type === 'out' ? 'bg-cyber-pink text-black' : 'text-cyber-dim hover:text-cyber-text'}`}
                 >
                    - 支出 (Expense)
                 </button>
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-2">
                    <label className="text-[10px] text-cyber-dim font-mono uppercase mb-1 block">金额 (Amount)</label>
                    <input 
                      type="number" 
                      value={newTx.amount || ''}
                      onChange={e => setNewTx({...newTx, amount: e.target.valueAsNumber})}
                      placeholder="0.00" 
                      className="w-full bg-cyber-bg border border-cyber-border p-2 text-cyber-text font-mono focus:border-cyber-cyan outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] text-cyber-dim font-mono uppercase mb-1 block">币种</label>
                    <select 
                      value={newTx.currency}
                      onChange={e => setNewTx({...newTx, currency: e.target.value})}
                      className="w-full bg-cyber-bg border border-cyber-border p-2 text-cyber-text font-mono focus:border-cyber-cyan outline-none"
                    >
                       {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              {/* Desc */}
              <div>
                 <label className="text-[10px] text-cyber-dim font-mono uppercase mb-1 block">交易摘要 (Description)</label>
                 <input 
                    value={newTx.desc || ''}
                    onChange={e => setNewTx({...newTx, desc: e.target.value})}
                    placeholder="e.g. 物流费用支付" 
                    className="w-full bg-cyber-bg border border-cyber-border p-2 text-cyber-text text-sm focus:border-cyber-cyan outline-none"
                 />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] text-cyber-dim font-mono uppercase mb-1 block">分类 (Category)</label>
                    <select 
                      value={newTx.category}
                      onChange={e => setNewTx({...newTx, category: e.target.value})}
                      className="w-full bg-cyber-bg border border-cyber-border p-2 text-cyber-text text-sm focus:border-cyber-cyan outline-none"
                    >
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] text-cyber-dim font-mono uppercase mb-1 block">状态 (Status)</label>
                    <select 
                      value={newTx.status}
                      onChange={e => setNewTx({...newTx, status: e.target.value as any})}
                      className="w-full bg-cyber-bg border border-cyber-border p-2 text-cyber-text text-sm focus:border-cyber-cyan outline-none"
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
    <div className="px-6 pb-6 space-y-6 animate-in fade-in duration-500 relative">
       
       <Modal />

       {/* Sticky Header with Adjusted Padding */}
       <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-cyber-border pb-4 pt-6 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] mb-6 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-black text-cyber-text tracking-wider flex items-center gap-3">
                财务中心 <span className="text-cyber-cyan text-sm px-2 py-0.5 border border-cyber-cyan rounded align-top mt-1 font-mono">GLOBAL</span>
             </h1>
             <p className="text-cyber-dim font-mono text-xs mt-1">全球资金归集 / 智能记账 / 利润分析</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-cyber-border text-cyber-dim text-xs font-bold hover:bg-cyber-text hover:text-cyber-bg transition-all">
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
             <div className="tech-border p-8 bg-gradient-to-br from-cyber-panel to-cyber-bg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Landmark size={120} className="text-cyber-cyan" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-end relative z-10">
                   <div>
                      <div className="flex items-center gap-2 text-cyber-cyan font-mono text-xs mb-2">
                         <ShieldCheck size={14} /> 资金安全托管中
                      </div>
                      <h2 className="text-cyber-dim text-sm font-bold uppercase tracking-widest">全球总资产估值 (USD)</h2>
                      <div className="text-5xl font-black text-cyber-text mt-2 text-glow flex items-baseline gap-2">
                         ${totalBalance.toLocaleString()} <span className="text-2xl text-cyber-dim">.00</span>
                      </div>
                      <div className="mt-4 flex gap-6 text-sm font-mono">
                         <span className="text-cyber-green flex items-center gap-1"><ArrowUpRight size={14}/> +$12,400 (今日)</span>
                         <span className="text-cyber-dim">汇率损益: <span className="text-cyber-pink">-$240.00</span></span>
                      </div>
                   </div>
                   
                   {/* Mini Actions */}
                   <div className="flex gap-2 mt-4 md:mt-0">
                      <div className="text-center px-4">
                         <div className="text-xs text-cyber-dim mb-1">待结算</div>
                         <div className="text-cyber-text font-bold">$450k</div>
                      </div>
                      <div className="w-[1px] bg-cyber-border"></div>
                      <div className="text-center px-4">
                         <div className="text-xs text-cyber-dim mb-1">冻结中</div>
                         <div className="text-cyber-text font-bold">$12k</div>
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
             <div className="tech-border p-6 bg-cyber-panel h-full flex flex-col">
                <h3 className="text-cyber-text font-bold text-sm flex items-center gap-2 mb-6">
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
                      <span className="text-cyber-dim text-[10px] uppercase">净利润率</span>
                      <span className="text-3xl font-black text-cyber-text">18%</span>
                   </div>
                </div>

                <div className="space-y-3 mt-4">
                   {costStructureData.length > 0 ? costStructureData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-cyber-dim">{item.name}</span>
                         </div>
                         <span className="text-cyber-text font-mono">{item.value}%</span>
                      </div>
                   )) : <div className="text-xs text-center text-gray-500 py-4">暂无支出数据</div>}
                </div>
             </div>
          </div>
       </div>

       {/* Middle Row: Cash Flow Analytics (Complex Chart) */}
       <div className="tech-border p-6 bg-cyber-panel">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-lg font-bold text-cyber-text flex items-center gap-2">
                   <TrendingUp size={20} className="text-cyber-green"/> 现金流与利润趋势 (Cash Flow & P&L)
                </h3>
             </div>
             <div className="flex gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyber-dim"><div className="w-3 h-3 bg-cyber-cyan opacity-50"></div> 收入 (Revenue)</div>
                <div className="flex items-center gap-2 text-cyber-dim"><div className="w-3 h-3 bg-cyber-pink opacity-50"></div> 支出 (Expense)</div>
                <div className="flex items-center gap-2 text-cyber-text"><div className="w-3 h-1 bg-cyber-green"></div> 净现金流 (Net)</div>
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
                   <CartesianGrid stroke="#333" vertical={false} strokeDasharray="3 3" />
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
       <div className="tech-border p-0 bg-cyber-panel overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-cyber-border flex justify-between items-center bg-cyber-bg/50">
             <h3 className="text-lg font-bold text-cyber-text flex items-center gap-2">
                <FileText size={20} className="text-cyber-text"/> 全球流水账本 (Global Ledger)
             </h3>
             <div className="flex gap-3">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-dim" size={14} />
                   <input 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="搜索交易号 / 对方账户..." 
                      className="bg-cyber-bg border border-cyber-border pl-10 pr-4 py-2 text-xs text-cyber-text outline-none w-64 focus:border-cyber-cyan transition-colors" 
                   />
                </div>
                
                {/* Filter Buttons */}
                <div className="flex bg-cyber-bg border border-cyber-border rounded overflow-hidden">
                   <button onClick={() => setFilterType('all')} className={`px-3 py-1 text-xs font-bold transition-all ${filterType === 'all' ? 'bg-cyber-text text-cyber-bg' : 'text-cyber-dim hover:text-cyber-text'}`}>全部</button>
                   <button onClick={() => setFilterType('in')} className={`px-3 py-1 text-xs font-bold transition-all ${filterType === 'in' ? 'bg-cyber-green text-black' : 'text-cyber-dim hover:text-cyber-text'}`}>收入</button>
                   <button onClick={() => setFilterType('out')} className={`px-3 py-1 text-xs font-bold transition-all ${filterType === 'out' ? 'bg-cyber-pink text-black' : 'text-cyber-dim hover:text-cyber-text'}`}>支出</button>
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
                <thead className="bg-cyber-bg/50 text-cyber-dim font-mono text-xs uppercase sticky top-0 backdrop-blur-sm z-10">
                   <tr>
                      <th className="p-4 pl-6">交易状态</th>
                      <th className="p-4">摘要 / 类别</th>
                      <th className="p-4">交易时间</th>
                      <th className="p-4">币种</th>
                      <th className="p-4 text-right pr-6">金额</th>
                      <th className="p-4 w-10">操作</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/50">
                   {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-cyber-bg/50 transition-colors group cursor-pointer">
                         <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                               <div className={`w-2 h-2 rounded-full ${tx.status === 'Cleared' ? 'bg-cyber-green shadow-[0_0_8px_#39FF14]' : tx.status === 'Processing' ? 'bg-cyber-yellow animate-pulse' : 'bg-gray-500'}`}></div>
                               <div>
                                  <div className="text-cyber-text font-bold text-xs">{tx.status === 'Cleared' ? '已入账' : tx.status === 'Processing' ? '处理中' : '待处理'}</div>
                                  <div className="text-[10px] text-cyber-dim font-mono">{tx.id}</div>
                               </div>
                            </div>
                         </td>
                         <td className="p-4">
                            <div className="text-cyber-text font-medium group-hover:text-cyber-cyan transition-colors">{tx.desc}</div>
                            <div className="flex gap-2 mt-1">
                               <span className="text-[10px] bg-cyber-bg px-1.5 py-0.5 rounded text-cyber-dim">{tx.category}</span>
                               <span className={`text-[10px] font-bold ${tx.type === 'in' ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                                  {tx.type === 'in' ? 'INCOME' : 'EXPENSE'}
                               </span>
                            </div>
                         </td>
                         <td className="p-4 text-cyber-dim font-mono text-xs">
                            {new Date(tx.date).toLocaleString()}
                         </td>
                         <td className="p-4">
                            <span className="px-2 py-1 bg-cyber-bg border border-cyber-border rounded text-[10px] font-mono text-cyber-text">
                               {tx.currency}
                            </span>
                         </td>
                         <td className={`p-4 pr-6 text-right font-mono font-bold text-base ${tx.type === 'in' ? 'text-cyber-green' : 'text-cyber-text'}`}>
                            {tx.type === 'in' ? '+' : '-'} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </td>
                         <td className="p-4 text-center">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                              className="text-cyber-dim hover:text-cyber-pink transition-colors p-2"
                              title="删除记录"
                            >
                               <Trash2 size={16} />
                            </button>
                         </td>
                      </tr>
                   ))}
                   {filteredTransactions.length === 0 && (
                      <tr>
                         <td colSpan={6} className="p-8 text-center text-cyber-dim text-sm">
                            没有找到符合条件的交易记录。
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
          <div className="p-3 bg-cyber-bg/50 border-t border-cyber-border flex justify-between items-center text-xs text-cyber-dim">
             <span>显示 {filteredTransactions.length} 条记录</span>
             <button className="flex items-center gap-1 hover:text-cyber-text transition-colors">
                <Download size={12} /> 导出报表 (Excel)
             </button>
          </div>
       </div>

    </div>
  );
};