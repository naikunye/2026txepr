import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell, PieChart, Pie, Sector
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, DollarSign, Wallet, 
  Globe, TrendingUp, Search, Calendar, Plus, Filter, 
  X, Check, Trash2, Settings, CreditCard, PieChart as PieIcon,
  Activity, Layers, ShoppingBag, Truck, Zap, AlertTriangle, 
  MoreHorizontal, FileText, ChevronRight, RefreshCw, Coins, Save, Package, TrendingDown
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
  platform: string;
  date: string;
  status: 'Cleared' | 'Processing' | 'Pending';
  note?: string;
}

// Simplified Interface for Restock Data Integration
interface ProductData {
  id: string;
  inventory: { current: number; incoming: number };
  supplier: { unitPriceRMB: number };
  financials: { sellingPriceUSD: number; miscCostUSD: number; fulfillmentFeeUSD: number; referralFeeRate: number };
}

interface ExchangeRate {
  [key: string]: number; // Base is USD
}

// --- Constants & Config ---
const CATEGORY_COLORS: Record<string, string> = {
    '销售收入': '#00F0FF', // Cyber Cyan
    '采购成本': '#FF003C', // Cyber Red
    '物流费用': '#007AFF', // Blue
    '平台佣金': '#FF9F0A', // Orange
    '市场营销': '#BF5AF2', // Purple
    '运营杂费': '#FFD60A', // Yellow
    '税费': '#AC8E68',     // Brown
    '薪资人力': '#32D74B', // Green
    '其他': '#8E8E93'      // Gray
};

const PLATFORM_ICONS: Record<string, any> = {
    'Amazon': ShoppingBag,
    'TikTok': Zap,
    'Shopify': Globe,
    'FedEx': Truck,
    'DHL': Truck,
    'Other': Layers
};

const CURRENCIES = ['USD', 'CNY', 'EUR', 'GBP', 'HKD', 'USDT'];

// --- Sub-Components ---

// 2. Transaction Ticket
const TransactionTicket: React.FC<{ tx: Transaction, onClick: () => void }> = ({ tx, onClick }) => {
    const isIncome = tx.type === 'in';
    const Icon = PLATFORM_ICONS[tx.platform] || Layers;
    const dateObj = new Date(tx.date);
    
    return (
        <div 
            onClick={onClick}
            className="group relative flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10 hover:shadow-lg transition-all cursor-pointer mb-3 overflow-hidden"
        >
            {/* Status Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                tx.status === 'Cleared' ? 'bg-green-500' : 
                tx.status === 'Processing' ? 'bg-blue-500' : 'bg-yellow-500'
            }`}></div>

            {/* Icon Box */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-[#151515] group-hover:scale-105 transition-transform ${isIncome ? 'text-cyber-green' : 'text-gray-400'}`}>
                <Icon size={20} strokeWidth={1.5} />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className="text-white font-bold text-sm truncate pr-4 group-hover:text-cyber-cyan transition-colors">
                        {tx.desc}
                    </h4>
                    <div className={`text-sm font-black font-mono tracking-tight whitespace-nowrap ${isIncome ? 'text-cyber-green text-glow-green' : 'text-white'}`}>
                        {isIncome ? '+' : '-'} {tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-[10px] text-gray-500 ml-0.5">{tx.currency}</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                        <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400 border border-white/5">{tx.category}</span>
                        <span>•</span>
                        <span>{dateObj.toLocaleDateString()}</span>
                        {tx.note && <span className="hidden sm:inline text-gray-600 truncate max-w-[150px]"> — {tx.note}</span>}
                    </div>
                    <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        tx.status === 'Cleared' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 
                        tx.status === 'Processing' ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' : 
                        'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                    }`}>
                        {tx.status}
                    </div>
                </div>
            </div>
            
            {/* Hover Action */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-[#1c1c1e] shadow-xl p-2 rounded-lg border border-white/10">
                <ChevronRight size={16} className="text-white" />
            </div>
        </div>
    );
};

// --- Main Component ---

export const FinanceModule: React.FC = () => {
  // Persistence
  const [transactions, setTransactions] = usePersistence<Transaction[]>('AERO_FINANCE_DATA', []);
  const [products] = usePersistence<ProductData[]>('AERO_RESTOCK_DATA', []); // Integrated Restock Data
  const [rates, setRates] = usePersistence<ExchangeRate>('AERO_EXCHANGE_RATES', { 'USD': 1, 'CNY': 7.25, 'EUR': 0.92, 'GBP': 0.79, 'HKD': 7.82, 'USDT': 1.00 });

  // UI State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [tempTx, setTempTx] = useState<Partial<Transaction>>({});
  const [isRateEditorOpen, setIsRateEditorOpen] = useState(false);
  const [tempRates, setTempRates] = useState<ExchangeRate>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

  // --- Calculations ---
  const financials = useMemo(() => {
      // 1. Cash Position (From Transactions)
      let totalCashUSD = 0;
      let realizedIncomeUSD = 0;
      let realizedExpenseUSD = 0;

      transactions.forEach(t => {
          const rate = rates[t.currency] || 1;
          const valUSD = t.currency === 'USD' ? t.amount : (t.amount / rate);
          
          // Logic: Summing up balances
          if (t.type === 'in') {
              totalCashUSD += valUSD;
              realizedIncomeUSD += valUSD;
          } else {
              totalCashUSD -= valUSD;
              realizedExpenseUSD += valUSD;
          }
      });

      // 2. Inventory Assets (From Smart Restock)
      let totalInventoryCostUSD = 0;
      let totalProjectedProfitUSD = 0;
      let totalSkus = products.length;

      products.forEach(p => {
          const totalStock = (p.inventory?.current || 0) + (p.inventory?.incoming || 0);
          if (totalStock <= 0) return;

          // Cost: Supplier Unit Price (RMB) -> USD
          const costRMB = p.supplier?.unitPriceRMB || 0;
          const costUSD = costRMB / (rates['CNY'] || 7.25); 
          const batchCost = totalStock * costUSD;
          totalInventoryCostUSD += batchCost;

          // Revenue: Selling Price (USD)
          const priceUSD = p.financials?.sellingPriceUSD || 0;
          const batchRevenue = totalStock * priceUSD;

          // Estimated Fees (Rough calc for dashboard view)
          // Referral + Fulfillment + Misc
          const referralFee = priceUSD * (p.financials?.referralFeeRate || 0.15);
          const feesPerUnit = referralFee + (p.financials?.fulfillmentFeeUSD || 0) + (p.financials?.miscCostUSD || 0);
          
          const batchProfit = batchRevenue - batchCost - (totalStock * feesPerUnit);
          totalProjectedProfitUSD += batchProfit;
      });

      // 3. Daily Trend Data (Last 14 days)
      const trendData = [];
      const today = new Date();
      for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          
          let dayIncome = 0;
          let dayExpense = 0;
          
          transactions.forEach(t => {
              if(t.date.startsWith(dateStr)) {
                  const val = t.currency === 'USD' ? t.amount : t.amount / (rates[t.currency] || 1);
                  if(t.type === 'in') dayIncome += val; else dayExpense += val;
              }
          });
          trendData.push({ date: dateStr.slice(5), income: dayIncome, expense: dayExpense });
      }

      // 4. Cost Distribution
      const costMap: Record<string, number> = {};
      transactions.filter(t => t.type === 'out').forEach(t => {
          const val = t.currency === 'USD' ? t.amount : t.amount / (rates[t.currency] || 1);
          costMap[t.category] = (costMap[t.category] || 0) + val;
      });
      const costPie = Object.keys(costMap).map(k => ({ name: k, value: costMap[k], color: CATEGORY_COLORS[k] || '#666' })).sort((a,b) => b.value - a.value);

      return { 
          totalCashUSD, 
          realizedIncomeUSD, 
          realizedExpenseUSD, 
          totalInventoryCostUSD, 
          totalProjectedProfitUSD,
          totalSkus,
          trendData, 
          costPie 
      };
  }, [transactions, products, rates]);

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
              date: new Date().toISOString().slice(0, 16),
              amount: 0,
              desc: ''
          });
      }
      setIsEditorOpen(true);
  };

  const saveTransaction = () => {
      if (!tempTx.desc || !tempTx.amount) {
          alert("请填写完整信息");
          return;
      }
      const payload = tempTx as Transaction;
      if (editingTx) setTransactions(prev => prev.map(t => t.id === editingTx.id ? payload : t));
      else setTransactions(prev => [payload, ...prev]);
      setIsEditorOpen(false);
  };

  const deleteTransaction = () => {
      if (!editingTx) return;
      if (confirm('确认删除此记录？')) {
          setTransactions(prev => prev.filter(t => t.id !== editingTx.id));
          setIsEditorOpen(false);
      }
  };

  return (
    <div className="h-full flex flex-col px-6 pb-6 animate-in fade-in duration-500 relative overflow-hidden">
        
        {/* TOP BAR - UPDATED: Transparent & Blur */}
        <div className="sticky top-0 z-30 bg-transparent backdrop-blur-2xl border-b border-white/10 pb-4 pt-6 -mx-6 px-6 shadow-sm mb-6 flex flex-col lg:flex-row justify-between lg:items-end gap-4 transition-all">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 text-glow">
                    财务驾驶舱 <span className="px-2 py-0.5 rounded border border-cyber-green text-[10px] text-cyber-green font-mono tracking-widest bg-cyber-green/10">FINANCE_OS</span>
                </h1>
                <p className="text-gray-500 font-medium text-xs mt-1 flex items-center gap-2">
                    <Activity size={12} className="text-cyber-blue animate-pulse"/> 
                    本位币: <span className="text-white font-bold">USD ($)</span> • 数据源: 财务账本 + 智能备货
                </p>
            </div>
            
            <div className="flex gap-3">
                <button 
                    onClick={() => { setTempRates({...rates}); setIsRateEditorOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl transition-all"
                >
                    <Settings size={14} /> 汇率配置
                </button>
                <button 
                    onClick={() => openEditor()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-xs font-black rounded-xl hover:bg-cyber-cyan hover:shadow-[0_0_20px_rgba(64,200,224,0.5)] transition-all shadow-lg uppercase tracking-wide group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform"/> 记一笔
                </button>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-6">
            
            {/* 1. HERO CARDS: CASH + INVENTORY ASSETS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CARD 1: REALIZED CASH (Green Theme) */}
                <div className="group relative overflow-hidden rounded-3xl bg-[#0F0F0F] border border-white/10 p-6 flex flex-col justify-between h-[220px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-green/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-cyber-green/20 text-cyber-green border border-cyber-green/30 shadow-[0_0_15px_rgba(48,209,88,0.2)]">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">资金池余额 (Cash)</div>
                                <div className="text-white font-mono text-xs opacity-60">Realized Balance</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-1 text-glow-green">
                            <span className="text-2xl text-cyber-green">$</span>
                            {financials.totalCashUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs font-mono">
                            <span className="flex items-center gap-1 text-gray-400">
                                <ArrowDownRight size={12} className="text-cyber-green"/> 
                                收 ${financials.realizedIncomeUSD.toLocaleString(undefined, {maximumFractionDigits:0})}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400">
                                <ArrowUpRight size={12} className="text-red-500"/> 
                                支 ${financials.realizedExpenseUSD.toLocaleString(undefined, {maximumFractionDigits:0})}
                            </span>
                        </div>
                    </div>
                </div>

                {/* CARD 2: INVENTORY ASSETS (Blue/Purple Theme - LINKED DATA) */}
                <div className="group relative overflow-hidden rounded-3xl bg-[#0F0F0F] border border-white/10 p-6 flex flex-col justify-between h-[220px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-cyber-purple/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 shadow-[0_0_15px_rgba(10,132,255,0.2)]">
                                <Package size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    库存货值 (Asset Value) 
                                    <span className="bg-cyber-blue/20 text-cyber-blue px-1.5 py-0.5 rounded text-[9px] border border-cyber-blue/30">已联网</span>
                                </div>
                                <div className="text-white font-mono text-xs opacity-60">Smart Restock Data</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-1 text-glow-blue">
                            <span className="text-2xl text-cyber-blue">$</span>
                            {financials.totalInventoryCostUSD.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs font-mono">
                            <span className="text-gray-400">
                                活跃 SKU: <span className="text-white font-bold">{financials.totalSkus}</span>
                            </span>
                            <span className="text-cyber-purple flex items-center gap-1 font-bold animate-pulse">
                                供应链资产
                            </span>
                        </div>
                    </div>
                </div>

                {/* CARD 3: PROJECTED PROFIT (Yellow/Gold Theme) */}
                <div className="group relative overflow-hidden rounded-3xl bg-[#0F0F0F] border border-white/10 p-6 flex flex-col justify-between h-[220px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-yellow/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/30 shadow-[0_0_15px_rgba(255,214,10,0.2)]">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">潜在利润 (Projected)</div>
                                <div className="text-white font-mono text-xs opacity-60">From Stock Sell-out</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-1 text-glow">
                            <span className="text-2xl text-cyber-yellow">$</span>
                            {financials.totalProjectedProfitUSD.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs font-mono">
                            <span className="text-gray-400">
                                预计回报率 (ROI)
                            </span>
                            <span className={`font-bold ${financials.totalInventoryCostUSD > 0 && (financials.totalProjectedProfitUSD / financials.totalInventoryCostUSD) > 2 ? 'text-cyber-green' : 'text-cyber-yellow'}`}>
                                {financials.totalInventoryCostUSD > 0 
                                    ? ((financials.totalProjectedProfitUSD / financials.totalInventoryCostUSD) * 100).toFixed(1) + '%' 
                                    : 'N/A'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. CHARTS AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cash Flow Trend */}
                <div className="lg:col-span-2 apple-glass p-6 h-[320px] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14}/> 现金流趋势 (Realized Cash Flow)
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] font-mono">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyber-green"></div> Income</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Expense</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={financials.trendData}>
                            <defs>
                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#30D158" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#30D158" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF453A" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#FF453A" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="income" stroke="#32D74B" strokeWidth={2} fill="url(#colorInc)" />
                            <Area type="monotone" dataKey="expense" stroke="#FF453A" strokeWidth={2} fill="url(#colorExp)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Cost Distribution */}
                <div className="lg:col-span-1 apple-glass p-6 flex flex-col relative overflow-hidden">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <PieIcon size={14}/> 支出结构 (Cost Structure)
                    </h3>
                    <div className="flex-1 relative min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={financials.costPie} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value" 
                                    stroke="none"
                                >
                                    {financials.costPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(val: number) => `$${val.toFixed(0)}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-white">${financials.realizedExpenseUSD.toLocaleString(undefined, { notation: "compact" })}</span>
                            <span className="text-[9px] text-gray-500 uppercase">Total Exp</span>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-2 max-h-[100px] overflow-y-auto custom-scrollbar pr-2">
                        {financials.costPie.map(c => (
                            <div key={c.name} className="flex items-center gap-2 text-[10px] text-gray-400">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{background:c.color}}></div>
                                <div className="truncate flex-1">{c.name}</div>
                                <div className="text-white font-mono">${c.value.toLocaleString(undefined, { notation: "compact" })}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. TRANSACTION LEDGER */}
            <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="p-5 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20 backdrop-blur-md">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} className="text-cyber-cyan"/> 交易账本 (Ledger)
                        </h3>
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors" size={14} />
                            <input 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="搜索订单号 / 描述 / 金额..." 
                                className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-cyber-cyan outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                        {['all', 'in', 'out'].map(t => (
                            <button 
                                key={t} 
                                onClick={() => setFilterType(t as any)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${filterType === t ? 'bg-white/20 text-white shadow-inner' : 'text-gray-500 hover:text-white'}`}
                            >
                                {t === 'all' ? '全部 (All)' : t === 'in' ? '收入 (In)' : '支出 (Out)'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 min-h-[400px]">
                    {transactions
                        .filter(t => 
                            (filterType === 'all' || t.type === filterType) &&
                            (t.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             t.amount.toString().includes(searchTerm) || 
                             t.category.includes(searchTerm))
                        )
                        .map((tx) => (
                            <TransactionTicket key={tx.id} tx={tx} onClick={() => openEditor(tx)} />
                    ))}
                    
                    {transactions.length === 0 && (
                        <div className="text-center py-20 text-gray-600 font-mono text-xs">
                            // NO DATA FOUND //
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- DRAWER: RATE EDITOR (Slide Over) --- */}
        {isRateEditorOpen && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
                <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl p-8 w-[400px] shadow-2xl relative">
                    <button onClick={() => setIsRateEditorOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"><X size={20}/></button>
                    
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                        <Settings size={22} className="text-cyber-blue"/> 
                        全球汇率配置
                    </h3>
                    <p className="text-xs text-gray-500 mb-6 font-mono bg-white/5 p-3 rounded-lg border border-white/5">
                        Base Currency: <strong className="text-white">USD ($)</strong><br/>
                        所有非美金资产（如智能备货中的 RMB 采购价）将根据此汇率折算为美金显示。
                    </p>

                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {CURRENCIES.filter(c => c !== 'USD').map(curr => (
                            <div key={curr} className="flex items-center gap-4 p-3 bg-black/40 rounded-xl border border-white/5">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-black text-gray-400 font-mono text-sm border border-white/5">
                                    {curr}
                                </div>
                                <div className="flex-1 text-right">
                                    <label className="text-[9px] text-gray-600 uppercase font-bold block mb-1">Rate to USD</label>
                                    <input 
                                        type="number"
                                        value={tempRates[curr]}
                                        onChange={e => setTempRates({...tempRates, [curr]: parseFloat(e.target.value)})}
                                        className="bg-transparent text-white font-mono font-bold text-lg w-full text-right outline-none focus:text-cyber-blue transition-colors"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => { setRates(tempRates); setIsRateEditorOpen(false); }} 
                        className="w-full mt-8 py-4 bg-cyber-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                    >
                        <RefreshCw size={16} /> Update Rates
                    </button>
                </div>
            </div>
        )}

        {/* --- DRAWER: TRANSACTION EDITOR (Slide Over) --- */}
        {isEditorOpen && (
            <>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsEditorOpen(false)}></div>
                <div className="absolute inset-y-0 right-0 w-full md:w-[500px] bg-[#121212] border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                    
                    {/* Header */}
                    <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#18181a]">
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                                {editingTx ? '编辑交易' : '新建交易'}
                            </h2>
                            <div className="text-xs font-mono text-gray-500 mt-1 flex items-center gap-2">
                                ID: <span className="text-white bg-white/10 px-1.5 rounded">{editingTx?.id || 'AUTO-GEN'}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><X size={24}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        
                        {/* 1. Main Amount Input */}
                        <div className="relative">
                            <div className="flex gap-2 mb-4 p-1 bg-black rounded-xl border border-white/10 w-fit">
                                <button 
                                    onClick={() => setTempTx({...tempTx, type: 'in'})}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${tempTx.type === 'in' ? 'bg-cyber-green text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <ArrowDownRight size={14}/> 收入
                                </button>
                                <button 
                                    onClick={() => setTempTx({...tempTx, type: 'out'})}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${tempTx.type === 'out' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <ArrowUpRight size={14}/> 支出
                                </button>
                            </div>
                            
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">交易金额 (Amount)</label>
                            <div className="flex items-end gap-4 border-b-2 border-white/10 pb-2 focus-within:border-white transition-colors">
                                <span className={`text-4xl font-light ${tempTx.type === 'in' ? 'text-cyber-green' : 'text-red-500'}`}>
                                    {tempTx.type === 'in' ? '+' : '-'}
                                </span>
                                <input 
                                    type="number" 
                                    value={tempTx.amount || ''}
                                    onChange={e => setTempTx({...tempTx, amount: parseFloat(e.target.value)})}
                                    className="bg-transparent text-5xl font-black text-white w-full outline-none font-mono placeholder-gray-800"
                                    placeholder="0.00"
                                    autoFocus
                                />
                                <select 
                                    value={tempTx.currency} 
                                    onChange={e => setTempTx({...tempTx, currency: e.target.value})}
                                    className="bg-black/40 text-white font-bold text-sm px-3 py-1.5 rounded-lg border border-white/20 outline-none mb-1.5"
                                >
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* 2. Details Form */}
                        <div className="space-y-5">
                            <div>
                                <label className="lbl">摘要 (Description)</label>
                                <input 
                                    value={tempTx.desc || ''} 
                                    onChange={e => setTempTx({...tempTx, desc: e.target.value})}
                                    className="input-holo w-full p-4 text-sm font-medium" 
                                    placeholder="例如: Amazon Q1 销售回款"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="lbl">分类 (Category)</label>
                                    <select 
                                        value={tempTx.category} 
                                        onChange={e => setTempTx({...tempTx, category: e.target.value})}
                                        className="input-holo w-full p-4 text-sm appearance-none"
                                    >
                                        {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="lbl">平台 (Platform)</label>
                                    <select 
                                        value={tempTx.platform} 
                                        onChange={e => setTempTx({...tempTx, platform: e.target.value})}
                                        className="input-holo w-full p-4 text-sm appearance-none"
                                    >
                                        {Object.keys(PLATFORM_ICONS).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="lbl">日期 (Date)</label>
                                    <input 
                                        type="datetime-local"
                                        value={tempTx.date}
                                        onChange={e => setTempTx({...tempTx, date: e.target.value})}
                                        className="input-holo w-full p-4 text-sm font-mono text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="lbl">状态 (Status)</label>
                                    <select 
                                        value={tempTx.status} 
                                        onChange={e => setTempTx({...tempTx, status: e.target.value as any})}
                                        className="input-holo w-full p-4 text-sm appearance-none"
                                    >
                                        <option value="Cleared">✅ 已入账 (Cleared)</option>
                                        <option value="Processing">⏳ 处理中 (Processing)</option>
                                        <option value="Pending">📝 待定 (Pending)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="lbl">备注 (Note)</label>
                                <textarea 
                                    value={tempTx.note || ''}
                                    onChange={e => setTempTx({...tempTx, note: e.target.value})}
                                    className="input-holo w-full p-4 text-sm h-24 resize-none"
                                    placeholder="添加额外的订单号或说明..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-white/10 bg-[#18181a] flex gap-4">
                        {editingTx && (
                            <button 
                                onClick={deleteTransaction}
                                className="px-5 py-4 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button 
                            onClick={saveTransaction}
                            className="flex-1 py-4 bg-white text-black font-black uppercase tracking-wide rounded-xl hover:bg-cyber-cyan transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 hover:scale-[1.02]"
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