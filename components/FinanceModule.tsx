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
  Package, Warehouse, AlertTriangle, Zap, Coins, Save, Edit3, Settings
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
  platform: string; // New: e.g. Amazon, TikTok, Shopify
  date: string;
  status: 'Cleared' | 'Processing' | 'Pending';
  note?: string;
}

interface ExchangeRate {
  [key: string]: number; // Base is USD
}

// --- Initial Data ---
const initialTransactions: Transaction[] = [
  { id: 'TX-9921', desc: 'Amazon 北美站回款', amount: 45230.00, type: 'in', currency: 'USD', category: '销售收入', platform: 'Amazon', date: '2025-01-04T14:20', status: 'Cleared' },
  { id: 'TX-9920', desc: '采购付款: 深圳科技', amount: 120000.00, type: 'out', currency: 'CNY', category: '采购成本', platform: 'N/A', date: '2025-01-04T09:15', status: 'Processing' },
  { id: 'TX-9919', desc: 'FedEx 物流月结', amount: 3450.50, type: 'out', currency: 'USD', category: '物流费用', platform: 'FedEx', date: '2025-01-03T18:00', status: 'Cleared' },
  { id: 'TX-9918', desc: 'TikTok Shop 英国提现', amount: 8200.00, type: 'in', currency: 'GBP', category: '销售收入', platform: 'TikTok', date: '2025-01-02T11:30', status: 'Cleared' },
  { id: 'TX-9917', desc: 'AWS 云服务器费用', amount: 450.00, type: 'out', currency: 'USD', category: '运营杂费', platform: 'AWS', date: '2025-01-01T10:00', status: 'Cleared' },
];

const initialRates: ExchangeRate = {
    'USD': 1,
    'CNY': 7.25,
    'EUR': 0.92,
    'GBP': 0.79,
    'HKD': 7.82,
    'USDT': 1.00
};

const CATEGORIES = ['销售收入', '采购成本', '物流费用', '平台佣金', '市场营销', '运营杂费', '税费', '薪资人力', '其他'];
const PLATFORMS = ['Amazon', 'TikTok', 'Shopify', 'Temu', 'Independent', 'Offline', 'Other'];
const CURRENCIES = ['USD', 'CNY', 'EUR', 'GBP', 'HKD', 'USDT'];

const CATEGORY_COLORS: Record<string, string> = {
    '销售收入': '#30D158',
    '采购成本': '#FF453A',
    '物流费用': '#0A84FF',
    '平台佣金': '#FF9F0A',
    '市场营销': '#BF5AF2',
    '运营杂费': '#FFD60A',
    '税费': '#AC8E68',
    '薪资人力': '#64D2FF',
    '其他': '#8E8E93'
};

const CurrencyCard = ({ curr, balance, rate }: { curr: string, balance: number, rate: number }) => {
    const valUSD = curr === 'USD' ? balance : balance / rate;
    
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between group hover:bg-white/10 transition-colors relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
              <Coins size={64} />
          </div>
          
          <div className="flex justify-between items-start z-10">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                   {curr.substring(0,1)}
                </div>
                <span className="font-mono font-bold text-sm text-gray-300">{curr}</span>
             </div>
             {curr !== 'USD' && (
                 <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-gray-500 font-mono">
                     1 USD ≈ {rate}
                 </span>
             )}
          </div>

          <div className="z-10 mt-4">
              <div className="text-xl font-black text-white tracking-tight truncate">
                  {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-gray-500 mt-1 font-mono">
                  ≈ ${valUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
              </div>
          </div>
      </div>
    );
};

export const FinanceModule: React.FC = () => {
  // --- State ---
  const [transactions, setTransactions] = usePersistence<Transaction[]>('AERO_FINANCE_DATA', initialTransactions);
  const [rates, setRates] = usePersistence<ExchangeRate>('AERO_EXCHANGE_RATES', initialRates);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger'>('overview');
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null); // null means creating new
  const [tempTx, setTempTx] = useState<Partial<Transaction>>({});

  // Rate Editor State
  const [isRateEditorOpen, setIsRateEditorOpen] = useState(false);
  const [tempRates, setTempRates] = useState<ExchangeRate>(initialRates);

  // --- Calculations ---
  const financials = useMemo(() => {
      let totalAssetUSD = 0;
      let incomeUSD = 0;
      let expenseUSD = 0;
      
      const balanceMap: Record<string, number> = {};

      transactions.forEach(t => {
          // Calculate Balances per currency
          const rawAmount = t.type === 'in' ? t.amount : -t.amount;
          balanceMap[t.currency] = (balanceMap[t.currency] || 0) + rawAmount;

          // Convert to USD for global stats
          const rateToUSD = rates[t.currency] || 1; // Actually rates are USD based? Assuming rate is e.g. 1 USD = 7.25 CNY
          // If rates are 1 USD = X Currency:
          // Amount in USD = Amount / Rate
          
          const amountInUSD = t.currency === 'USD' ? t.amount : (t.amount / (rates[t.currency] || 1));

          if (t.type === 'in') incomeUSD += amountInUSD;
          else expenseUSD += amountInUSD;
      });

      // Calculate Total Asset Valuation based on balances
      Object.entries(balanceMap).forEach(([curr, amount]) => {
          const valUSD = curr === 'USD' ? amount : (amount / (rates[curr] || 1));
          totalAssetUSD += valUSD;
      });

      return { totalAssetUSD, incomeUSD, expenseUSD, balanceMap };
  }, [transactions, rates]);

  const chartData = useMemo(() => {
      // 1. Cost Structure (Pie)
      const costMap: Record<string, number> = {};
      transactions.filter(t => t.type === 'out').forEach(t => {
          const usd = t.currency === 'USD' ? t.amount : t.amount / (rates[t.currency] || 1);
          costMap[t.category] = (costMap[t.category] || 0) + usd;
      });
      const costPie = Object.keys(costMap).map(k => ({
          name: k, value: costMap[k], color: CATEGORY_COLORS[k] || '#888'
      })).sort((a,b) => b.value - a.value);

      // 2. Trend (Bar/Line)
      // Group by Month
      const trendMap: Record<string, {in: number, out: number}> = {};
      transactions.forEach(t => {
          const d = new Date(t.date);
          const key = `${d.getMonth() + 1}月`;
          if (!trendMap[key]) trendMap[key] = { in: 0, out: 0 };
          const usd = t.currency === 'USD' ? t.amount : t.amount / (rates[t.currency] || 1);
          if (t.type === 'in') trendMap[key].in += usd;
          else trendMap[key].out += usd;
      });
      const trendChart = Object.keys(trendMap).map(k => ({
          name: k, revenue: trendMap[k].in, expense: trendMap[k].out, net: trendMap[k].in - trendMap[k].out
      })); // In real app, sort by date

      return { costPie, trendChart };
  }, [transactions, rates]);

  // --- Handlers ---

  const openEditor = (tx?: Transaction) => {
      if (tx) {
          setEditingTx(tx);
          setTempTx({ ...tx });
      } else {
          setEditingTx(null);
          setTempTx({
              id: `TX-${Date.now()}`,
              type: 'out',
              currency: 'USD',
              category: '运营杂费',
              platform: 'Other',
              status: 'Cleared',
              date: new Date().toISOString().slice(0, 16), // datetime-local format
              amount: 0,
              desc: ''
          });
      }
      setIsEditorOpen(true);
  };

  const saveTransaction = () => {
      if (!tempTx.desc || !tempTx.amount) {
          alert("请填写描述和金额");
          return;
      }
      
      const payload = tempTx as Transaction;
      
      if (editingTx) {
          // Update
          setTransactions(prev => prev.map(t => t.id === editingTx.id ? payload : t));
      } else {
          // Create
          setTransactions(prev => [payload, ...prev]);
      }
      setIsEditorOpen(false);
  };

  const deleteTransaction = () => {
      if (!editingTx) return;
      if (confirm('确定要删除这条记录吗？')) {
          setTransactions(prev => prev.filter(t => t.id !== editingTx.id));
          setIsEditorOpen(false);
      }
  };

  const saveRates = () => {
      setRates(tempRates);
      setIsRateEditorOpen(false);
  };

  // --- Render Components ---

  return (
    <div className="h-full flex flex-col px-6 pb-6 animate-in fade-in duration-500 relative overflow-hidden">
        
        {/* HEADER */}
        <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-6 -mx-6 px-6 shadow-lg mb-6 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 text-glow">
                    财务核算 <span className="text-cyber-green text-xs px-2 py-0.5 border border-cyber-green rounded-full bg-cyber-green/10 font-mono">FINANCE_OS</span>
                </h1>
                <p className="text-gray-500 font-mono text-xs mt-1 flex items-center gap-2">
                    全域资金流监控 • 实时汇率折算
                </p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => { setTempRates({...rates}); setIsRateEditorOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 border border-white/20 text-gray-300 text-xs font-bold rounded-xl hover:bg-white/10 transition-all"
                >
                    <Settings size={14} /> 汇率配置
                </button>
                <button 
                    onClick={() => openEditor()}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-black text-xs font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-white/10 uppercase tracking-wide"
                >
                    <Plus size={16} /> 记一笔
                </button>
            </div>
        </div>

        {/* CONTENT SCROLLABLE */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
            
            {/* 1. Global Asset Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Card */}
                <div className="lg:col-span-2 apple-glass p-8 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-green/5 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-cyber-green font-mono text-xs mb-2 font-bold uppercase tracking-widest">
                                <ShieldCheck size={14} /> Global Net Worth
                            </div>
                            <div className="text-5xl font-black text-white mt-1 tracking-tight flex items-baseline gap-2 text-glow">
                                ${financials.totalAssetUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                                <span className="text-sm font-bold text-gray-500 bg-black/30 px-2 py-1 rounded">USD EST.</span>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="text-xs text-gray-400 font-mono">本月收入 (Income)</div>
                            <div className="text-xl font-bold text-white flex items-center justify-end gap-1">
                                <ArrowDownRight size={16} className="text-cyber-green" /> 
                                ${financials.incomeUSD.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-2">本月支出 (Expense)</div>
                            <div className="text-xl font-bold text-white flex items-center justify-end gap-1">
                                <ArrowUpRight size={16} className="text-red-500" /> 
                                ${financials.expenseUSD.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    
                    {/* Currency Strip */}
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {CURRENCIES.map(c => (
                            <CurrencyCard key={c} curr={c} balance={financials.balanceMap[c] || 0} rate={rates[c] || 1} />
                        ))}
                    </div>
                </div>

                {/* Quick Charts */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Cost Structure Mini */}
                    <div className="bg-black/40 border border-white/10 rounded-3xl p-5 flex-1 flex flex-col relative overflow-hidden">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <PieIcon size={14} className="text-cyber-purple"/> 成本分布
                        </h3>
                        <div className="flex-1 relative min-h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData.costPie} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                                        {chartData.costPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(val: number) => `$${val.toFixed(0)}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-xl font-black text-white tracking-tighter">Cost</span>
                            </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1">
                            {chartData.costPie.slice(0,4).map(c => (
                                <div key={c.name} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{background:c.color}}></div>
                                    <span className="truncate">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Transaction Ledger */}
            <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-white/10 bg-white/5 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} className="text-cyber-blue"/> 交易明细 (Ledger)
                        </h3>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="搜索订单号 / 描述..." 
                                className="pl-9 pr-4 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white focus:border-cyber-blue outline-none transition-all w-64"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {['in', 'out', 'all'].map(t => (
                            <button key={t} className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[10px] font-bold uppercase text-gray-400 transition-all">
                                {t === 'in' ? '收入' : t === 'out' ? '支出' : '全部'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/40 text-gray-500 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 pl-6">交易时间</th>
                                <th className="p-4">描述 / 订单号</th>
                                <th className="p-4">分类 & 平台</th>
                                <th className="p-4 text-right">金额</th>
                                <th className="p-4 text-center">状态</th>
                                <th className="p-4 pr-6 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs font-mono">
                            {transactions
                                .filter(t => t.desc.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((tx) => (
                                <tr key={tx.id} onClick={() => openEditor(tx)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="p-4 pl-6 text-gray-400">
                                        <div className="text-white">{tx.date.split('T')[0]}</div>
                                        <div className="text-[10px] opacity-60">{tx.date.split('T')[1]}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white text-sm mb-0.5">{tx.desc}</div>
                                        <div className="text-gray-500 text-[10px]">{tx.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2 h-2 rounded-full" style={{background: CATEGORY_COLORS[tx.category] || '#888'}}></span>
                                            <span className="text-gray-300">{tx.category}</span>
                                        </div>
                                        <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-500">{tx.platform}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className={`text-sm font-black ${tx.type === 'in' ? 'text-cyber-green' : 'text-white'}`}>
                                            {tx.type === 'in' ? '+' : '-'} {tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </div>
                                        <div className="text-gray-500 font-bold">{tx.currency}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                            tx.status === 'Cleared' ? 'bg-green-900/20 text-green-400 border-green-900/50' :
                                            tx.status === 'Processing' ? 'bg-blue-900/20 text-blue-400 border-blue-900/50' :
                                            'bg-yellow-900/20 text-yellow-400 border-yellow-900/50'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="p-4 pr-6 text-center">
                                        <button className="p-1.5 text-gray-500 hover:text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                            <Edit3 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* --- DRAWER: RATE EDITOR --- */}
        {isRateEditorOpen && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
                <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-6 w-96 shadow-2xl relative">
                    <button onClick={() => setIsRateEditorOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Settings size={18} className="text-cyber-blue"/> 汇率配置 (Base: USD)
                    </h3>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {CURRENCIES.filter(c => c !== 'USD').map(curr => (
                            <div key={curr} className="flex items-center gap-3">
                                <div className="w-12 text-sm font-bold text-gray-400 font-mono">{curr}</div>
                                <input 
                                    type="number"
                                    value={tempRates[curr]}
                                    onChange={e => setTempRates({...tempRates, [curr]: parseFloat(e.target.value)})}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white text-right font-mono focus:border-cyber-blue outline-none"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button onClick={() => setTempRates(initialRates)} className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-white">重置</button>
                        <button onClick={saveRates} className="flex-[2] py-2 bg-cyber-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-lg">
                            保存配置
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- DRAWER: TRANSACTION EDITOR --- */}
        {isEditorOpen && (
            <>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsEditorOpen(false)}></div>
                <div className="absolute inset-y-0 right-0 w-full md:w-[480px] bg-[#121212] border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#18181a]">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            {editingTx ? '编辑交易' : '新建交易'}
                            <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">{editingTx?.id || 'NEW'}</span>
                        </h2>
                        <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Type Switcher */}
                        <div className="flex p-1 bg-black rounded-xl border border-white/10">
                            <button 
                                onClick={() => setTempTx({...tempTx, type: 'in'})}
                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${tempTx.type === 'in' ? 'bg-cyber-green text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                <ArrowDownRight size={16}/> 收入 (Income)
                            </button>
                            <button 
                                onClick={() => setTempTx({...tempTx, type: 'out'})}
                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${tempTx.type === 'out' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                <ArrowUpRight size={16}/> 支出 (Expense)
                            </button>
                        </div>

                        {/* Amount & Currency */}
                        <div className="grid grid-cols-5 gap-4">
                            <div className="col-span-3">
                                <label className="lbl">金额 (Amount)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={tempTx.amount || ''}
                                        onChange={e => setTempTx({...tempTx, amount: parseFloat(e.target.value)})}
                                        className={`input-holo w-full pl-4 pr-4 py-3 text-2xl font-black font-mono focus:ring-2 ${tempTx.type === 'in' ? 'text-cyber-green focus:ring-cyber-green/50' : 'text-white focus:ring-red-500/50'}`} 
                                        placeholder="0.00" 
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="lbl">币种 (Currency)</label>
                                <select 
                                    value={tempTx.currency} 
                                    onChange={e => setTempTx({...tempTx, currency: e.target.value})}
                                    className="input-holo w-full py-3 px-3 text-sm font-bold appearance-none"
                                >
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="lbl">摘要 / 订单号 (Description)</label>
                            <input 
                                value={tempTx.desc || ''} 
                                onChange={e => setTempTx({...tempTx, desc: e.target.value})}
                                className="input-holo w-full p-3 text-sm text-white" 
                                placeholder="例如: 1月采购款..."
                            />
                        </div>

                        {/* Category & Platform */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="lbl">财务分类 (Category)</label>
                                <select 
                                    value={tempTx.category} 
                                    onChange={e => setTempTx({...tempTx, category: e.target.value})}
                                    className="input-holo w-full p-3 text-sm"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="lbl">关联平台 (Platform)</label>
                                <select 
                                    value={tempTx.platform} 
                                    onChange={e => setTempTx({...tempTx, platform: e.target.value})}
                                    className="input-holo w-full p-3 text-sm"
                                >
                                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Date & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="lbl">日期 (Date)</label>
                                <input 
                                    type="datetime-local"
                                    value={tempTx.date}
                                    onChange={e => setTempTx({...tempTx, date: e.target.value})}
                                    className="input-holo w-full p-3 text-sm font-mono text-gray-300"
                                />
                            </div>
                            <div>
                                <label className="lbl">状态 (Status)</label>
                                <select 
                                    value={tempTx.status} 
                                    onChange={e => setTempTx({...tempTx, status: e.target.value as any})}
                                    className="input-holo w-full p-3 text-sm"
                                >
                                    <option value="Cleared">已入账 (Cleared)</option>
                                    <option value="Processing">处理中 (Processing)</option>
                                    <option value="Pending">待定 (Pending)</option>
                                </select>
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="lbl">备注 (Note)</label>
                            <textarea 
                                value={tempTx.note || ''}
                                onChange={e => setTempTx({...tempTx, note: e.target.value})}
                                className="input-holo w-full p-3 text-sm h-24 resize-none"
                                placeholder="选填备注信息..."
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/10 bg-[#18181a] flex gap-4">
                        {editingTx && (
                            <button 
                                onClick={deleteTransaction}
                                className="px-4 py-3 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button 
                            onClick={saveTransaction}
                            className="flex-1 py-3 bg-white text-black font-black uppercase tracking-wide rounded-xl hover:bg-cyber-cyan transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Save Transaction
                        </button>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};