import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell, ComposedChart, Line, Legend, PieChart, Pie
} from 'recharts';
import { 
  CreditCard, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, 
  Bitcoin, Globe, RefreshCcw, Landmark, FileText, PieChart as PieIcon,
  TrendingUp, TrendingDown, ArrowRightLeft, ShieldCheck, Download,
  Plus, Filter, Search, Calendar, Tag, MoreHorizontal, X, Check, Trash2,
  ChevronDown, Calculator, ShoppingBag, Navigation, Megaphone, Percent,
  Package, Warehouse, AlertTriangle, Zap
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

// ... Initial transactions kept simplified for this view ...
const initialTransactions: Transaction[] = [
  { id: 'TX-9921', desc: 'Amazon 结算款 (US)', amount: 45230.00, type: 'in', currency: 'USD', category: '销售收入', date: '2025-01-04 14:20', status: 'Cleared' },
  { id: 'TX-9920', desc: '供应商付款: 深圳科技', amount: 120000.00, type: 'out', currency: 'CNY', category: '采购成本', date: '2025-01-04 09:15', status: 'Processing' },
  { id: 'TX-9919', desc: 'FedEx 物流账单', amount: 3450.50, type: 'out', currency: 'USD', category: '物流费用', date: '2025-01-03 18:00', status: 'Cleared' },
  { id: 'TX-9918', desc: 'TikTok Shop 提现 (UK)', amount: 8200.00, type: 'in', currency: 'GBP', category: '销售收入', date: '2025-01-02 11:30', status: 'Cleared' },
  { id: 'TX-9917', desc: 'AWS 云服务费', amount: 450.00, type: 'out', currency: 'USD', category: '运营杂费', date: '2025-01-01 10:00', status: 'Cleared' },
];

const categories = ['销售收入', '采购成本', '物流费用', '市场营销', '运营杂费', '税费', '薪资人力'];
const currencies = ['USD', 'CNY', 'EUR', 'GBP', 'USDT'];

// Vibrant Apple Colors for Categories
const categoryColors: Record<string, string> = {
    '采购成本': '#8E8E93',
    '物流费用': '#0A84FF', // Blue
    '市场营销': '#BF5AF2', // Purple
    '平台佣金': '#FF453A', // Red
    '运营杂费': '#FFD60A', // Yellow
    '税费': '#FF9F0A', // Orange
    '薪资人力': '#30D158', // Green
    '销售收入': '#30D158'
};

export const FinanceModule: React.FC = () => {
  const [activeCurrency, setActiveCurrency] = useState('USD');
  const [transactions, setTransactions] = usePersistence<Transaction[]>('AERO_FINANCE_DATA', initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  
  // Chart States
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [costStructureData, setCostStructureData] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'out', currency: 'USD', category: '运营杂费', status: 'Cleared'
  });

  useEffect(() => {
      // Logic same as previous, just need to update colors for charts
      const expenses = transactions.filter(t => t.type === 'out');
      const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
      const costMap: Record<string, number> = {};
      expenses.forEach(t => { costMap[t.category] = (costMap[t.category] || 0) + t.amount; });
      const costs = Object.keys(costMap).map(cat => ({
          name: cat,
          value: totalExpense > 0 ? parseFloat(((costMap[cat] / totalExpense) * 100).toFixed(1)) : 0,
          color: categoryColors[cat] || '#888'
      })).sort((a, b) => b.value - a.value);
      setCostStructureData(costs);

      // Simple Cash Flow Calc
      const monthMap: Record<string, { revenue: number, expenses: number }> = {};
      transactions.forEach(t => {
          try {
              const d = new Date(t.date);
              if(isNaN(d.getTime())) return;
              const m = d.getMonth() + 1 + '月';
              if (!monthMap[m]) monthMap[m] = { revenue: 0, expenses: 0 };
              if (t.type === 'in') monthMap[m].revenue += t.amount;
              else monthMap[m].expenses += t.amount;
          } catch(e) {}
      });
      const flowData = Object.keys(monthMap).map(m => ({
            name: m, revenue: monthMap[m].revenue, expenses: monthMap[m].expenses, net: monthMap[m].revenue - monthMap[m].expenses
        }));
      if (flowData.length === 0) {
          const currentMonth = (new Date().getMonth() + 1) + '月';
          setCashFlowData([{ name: currentMonth, revenue: 0, expenses: 0, net: 0 }]);
      } else {
          setCashFlowData(flowData);
      }

      setTotalBalance(transactions.reduce((acc, t) => t.type === 'in' ? acc + t.amount : acc - t.amount, 0));
  }, [transactions]);

  // Helpers
  const handleAddTransaction = () => {
    if (!newTx.amount || !newTx.desc) return;
    const tx: Transaction = {
      id: `TX-${Math.floor(Math.random() * 10000)}`, desc: newTx.desc, amount: Number(newTx.amount),
      type: newTx.type as 'in' | 'out', currency: newTx.currency as string, category: newTx.category as string,
      date: new Date().toISOString(), status: newTx.status as any
    };
    setTransactions([tx, ...transactions]);
    setIsModalOpen(false);
    setNewTx({ type: 'out', currency: 'USD', category: '运营杂费', status: 'Cleared', desc: '', amount: undefined });
  };
  
  const handleDelete = (id: string) => { if (confirm('确认删除?')) setTransactions(transactions.filter(t => t.id !== id)); };

  const filteredTransactions = transactions.filter(t => {
    return (t.desc.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
           (filterType === 'all' || t.type === filterType);
  });

  // --- Components ---

  const CurrencyCard = ({ code, symbol, balance, trend, trendVal, gradient }: any) => (
    <div 
      onClick={() => setActiveCurrency(code)}
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 rounded-3xl p-6 h-40 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.02] ${
        activeCurrency === code ? 'ring-2 ring-white/50' : ''
      }`}
      style={{ background: gradient }}
    >
       {/* Glass Overlay */}
       <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
       
       <div className="flex justify-between items-start z-10 relative text-white">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white font-mono text-xs shadow-sm">
                {symbol}
             </div>
             <span className="font-bold text-sm tracking-wide opacity-90">{code}</span>
          </div>
          <div className="bg-black/20 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold">
             {trend === 'up' ? <TrendingUp size={10} className="text-white"/> : <TrendingDown size={10} className="text-white"/>}
             {trendVal}
          </div>
       </div>
       
       <div className="z-10 relative text-white">
          <div className="text-3xl font-black tracking-tight drop-shadow-md">{balance}</div>
          <div className="text-[10px] opacity-70 font-mono mt-1 uppercase tracking-widest">可用余额 (Available)</div>
       </div>

       {/* Decorative Lines */}
       <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );

  const Modal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
        <div className="bg-[#1c1c1e] w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden border border-white/10">
           <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">新建交易记录</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
           </div>
           <div className="p-6 space-y-4">
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                 <button onClick={() => setNewTx({...newTx, type: 'in'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newTx.type === 'in' ? 'bg-cyber-green text-black' : 'text-gray-400 hover:text-white'}`}>收入 (Income)</button>
                 <button onClick={() => setNewTx({...newTx, type: 'out'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newTx.type === 'out' ? 'bg-cyber-red text-white' : 'text-gray-400 hover:text-white'}`}>支出 (Expense)</button>
              </div>
              <div>
                 <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">金额</label>
                 <input type="number" value={newTx.amount || ''} onChange={e => setNewTx({...newTx, amount: e.target.valueAsNumber})} placeholder="0.00" className="input-holo w-full p-3 text-xl font-mono font-bold text-white placeholder-gray-600" autoFocus />
              </div>
              <div>
                 <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">摘要</label>
                 <input value={newTx.desc || ''} onChange={e => setNewTx({...newTx, desc: e.target.value})} placeholder="输入交易描述..." className="input-holo w-full p-3 text-sm text-white placeholder-gray-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">分类</label>
                     <select value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="input-holo w-full p-3 text-sm">
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">币种</label>
                     <select value={newTx.currency} onChange={e => setNewTx({...newTx, currency: e.target.value})} className="input-holo w-full p-3 text-sm">
                          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
              </div>
              <button onClick={handleAddTransaction} className="w-full py-3.5 bg-cyber-blue text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 mt-2">保存记录</button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 pb-6 space-y-6 animate-in fade-in duration-500 relative">
       <Modal />

       {/* Header */}
       <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-6 -mx-6 px-6 shadow-sm mb-6 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                财务中心 <span className="text-cyber-blue text-xs px-2 py-0.5 border border-cyber-blue rounded-full bg-cyber-blue/10">PRO</span>
             </h1>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-white/20 text-gray-300 text-xs font-bold rounded-xl hover:bg-white/10 transition-all">
                <RefreshCcw size={14} /> 同步
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-cyber-blue text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/30">
                <ArrowRightLeft size={14} /> 转账
             </button>
          </div>
       </div>
       
       {/* Top Row: Global Assets */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 flex flex-col gap-6">
             {/* Total Asset Card */}
             <div className="apple-glass p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-end relative z-10">
                   <div>
                      <div className="flex items-center gap-2 text-cyber-blue font-mono text-xs mb-2">
                         <ShieldCheck size={14} /> 资金保险箱 (SECURE VAULT)
                      </div>
                      <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest">总资产估值 (USD)</h2>
                      <div className="text-5xl font-black text-white mt-2 tracking-tight flex items-baseline gap-2 text-glow">
                         ${totalBalance.toLocaleString()} <span className="text-2xl text-gray-600">.00</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Currency Grid (Apple Wallet Style) */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CurrencyCard code="USD" symbol="$" balance="1,240,500" trend="up" trendVal="2.4%" gradient="linear-gradient(135deg, #0A84FF 0%, #007AFF 100%)" />
                <CurrencyCard code="CNY" symbol="¥" balance="8,400,200" trend="down" trendVal="0.5%" gradient="linear-gradient(135deg, #FF453A 0%, #FF3B30 100%)" />
                <CurrencyCard code="EUR" symbol="€" balance="45,200" trend="up" trendVal="1.2%" gradient="linear-gradient(135deg, #30D158 0%, #28CD41 100%)" />
                <CurrencyCard code="USDT" symbol="₮" balance="125,000" trend="up" trendVal="0.1%" gradient="linear-gradient(135deg, #BF5AF2 0%, #AF52DE 100%)" />
             </div>
          </div>

          {/* Right: Cost Structure */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="apple-glass p-6 h-full flex flex-col">
                <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-6">
                   <PieIcon size={16} className="text-cyber-purple"/> 成本结构分析
                </h3>
                <div className="flex-1 min-h-[250px] relative w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={costStructureData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value" stroke="none">
                            {costStructureData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                         </Pie>
                         <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: 'none', borderRadius: '12px', color: '#fff' }} />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-gray-500 text-[10px] uppercase">净利率</span>
                      <span className="text-3xl font-black text-white">18%</span>
                   </div>
                </div>
                <div className="space-y-3 mt-4">
                   {costStructureData.slice(0, 4).map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-gray-300">{item.name}</span>
                         </div>
                         <span className="text-white font-mono font-bold">{item.value}%</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>

       {/* Middle: Cash Flow Chart (Existing) */}
       <div className="apple-glass p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-cyber-green"/> 现金流与利润趋势
             </h3>
          </div>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashFlowData}>
                   <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid stroke="#333" vertical={false} strokeDasharray="3 3" />
                   <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                   <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: 'none', borderRadius: '12px', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                   <Bar dataKey="revenue" barSize={12} fill="url(#colorRev)" radius={[4, 4, 0, 0]} />
                   <Line type="monotone" dataKey="net" stroke="#30D158" strokeWidth={3} dot={{r: 4, fill: '#000', stroke: '#30D158', strokeWidth: 2}} />
                </ComposedChart>
             </ResponsiveContainer>
          </div>
       </div>

       {/* Transactions Table */}
       <div className="apple-glass p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
             <h3 className="text-lg font-bold text-white">交易明细</h3>
             <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg">
                   <Plus size={14} /> 新建
                </button>
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-black/40 text-gray-500 font-medium text-xs uppercase sticky top-0 backdrop-blur-md">
                   <tr>
                      <th className="p-4 pl-6">状态</th>
                      <th className="p-4">摘要说明</th>
                      <th className="p-4">日期</th>
                      <th className="p-4 text-right pr-6">金额</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                         <td className="p-4 pl-6">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${tx.status === 'Cleared' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{tx.status}</span>
                         </td>
                         <td className="p-4">
                            <div className="text-white font-medium">{tx.desc}</div>
                            <div className="text-xs text-gray-500">{tx.category} • {tx.type === 'in' ? '收入' : '支出'}</div>
                         </td>
                         <td className="p-4 text-gray-500 text-xs font-mono">{new Date(tx.date).toLocaleDateString()}</td>
                         <td className={`p-4 pr-6 text-right font-mono font-bold ${tx.type === 'in' ? 'text-cyber-green' : 'text-white'}`}>
                            {tx.type === 'in' ? '+' : '-'} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};