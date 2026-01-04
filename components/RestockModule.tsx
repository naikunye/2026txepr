import React, { useState } from 'react';
import { Search, Plus, Package, Edit2, Trash2, Copy, Plane, Ship, Box, ArrowRight } from 'lucide-react';

// Enhanced Data Structure matching the screenshot
interface Product {
  id: string;
  skuCode: string; // e.g., dsz-01-COPY
  inboundId: string; // e.g., IB112251229RS
  
  productName: string; // e.g., 登山杖
  supplier: string; // e.g., 1688 or 老罗
  packing: {
    pcsPerBox: number;
    boxCount: number;
  };

  logistics: {
    mode: 'air' | 'sea';
    trackingNo: string;
    weight: string;
    tag: string; // e.g., 材积
  };

  inventory: {
    current: number;
    planned: number;
  };

  costRMB: {
    purchase: number; // 采购
    logistics: number; // 头程
    total: number; // 硬成本
  };

  profitUSD: {
    unit: number;
    totalEst: number;
  };
}

const initialProducts: Product[] = [
  { 
    id: '1', 
    skuCode: 'dsz-01-COPY', 
    inboundId: 'IB112251229RS', 
    productName: '登山杖', 
    supplier: '1688', 
    packing: { pcsPerBox: 20, boxCount: 7 },
    logistics: { mode: 'air', trackingNo: '1ZHV25250412...', weight: '0.600kg', tag: '材积' },
    inventory: { current: 60, planned: 60 },
    costRMB: { purchase: 47.0, logistics: 36.0, total: 83.0 },
    profitUSD: { unit: 11.12, totalEst: 667 }
  },
  { 
    id: '2', 
    skuCode: 'k7500', 
    inboundId: 'IB112251228RS', 
    productName: 'K7500', 
    supplier: '老罗', 
    packing: { pcsPerBox: 24, boxCount: 5 },
    logistics: { mode: 'air', trackingNo: '1ZHV25250412...', weight: '0.500kg', tag: '材积' },
    inventory: { current: 990, planned: 990 },
    costRMB: { purchase: 44.0, logistics: 30.0, total: 74.0 },
    profitUSD: { unit: 5.60, totalEst: 5544 }
  },
  { 
    id: '3', 
    skuCode: 'k7500-COPY', 
    inboundId: 'IB112251226RT', 
    productName: 'K7500', 
    supplier: '老罗', 
    packing: { pcsPerBox: 24, boxCount: 3 },
    logistics: { mode: 'air', trackingNo: '1ZB87V900405...', weight: '0.667kg', tag: '材积' },
    inventory: { current: 528, planned: 528 },
    costRMB: { purchase: 44.0, logistics: 40.0, total: 84.0 },
    profitUSD: { unit: 4.21, totalEst: 2224 }
  },
  { 
    id: '4', 
    skuCode: 'MDQ', 
    inboundId: 'IB112251226RS', 
    productName: 'MDQ', 
    supplier: '1688', 
    packing: { pcsPerBox: 24, boxCount: 1 },
    logistics: { mode: 'air', trackingNo: '1ZB87V900405...', weight: '0.500kg', tag: '材积' },
    inventory: { current: 200, planned: 200 },
    costRMB: { purchase: 6.0, logistics: 30.0, total: 36.0 },
    profitUSD: { unit: 8.26, totalEst: 51 }
  },
  { 
    id: '5', 
    skuCode: 'k7500', 
    inboundId: 'IB112251225RS', 
    productName: 'K7500', 
    supplier: '老罗', 
    packing: { pcsPerBox: 24, boxCount: 4 },
    logistics: { mode: 'sea', trackingNo: '1ZB87V900415...', weight: '0.667kg', tag: '材积' },
    inventory: { current: 740, planned: 740 },
    costRMB: { purchase: 44.0, logistics: 40.0, total: 84.0 },
    profitUSD: { unit: 4.21, totalEst: 3117 }
  },
   { 
    id: '6', 
    skuCode: '15500-1', 
    inboundId: 'IB112251219RS', 
    productName: 'BM-15500133333', 
    supplier: '1688', 
    packing: { pcsPerBox: 24, boxCount: 2 },
    logistics: { mode: 'air', trackingNo: '887304370399', weight: '0.500kg', tag: '材积' },
    inventory: { current: 100, planned: 100 },
    costRMB: { purchase: 45.0, logistics: 6.0, total: 51.0 },
    profitUSD: { unit: 38.82, totalEst: 3082 }
  }
];

export const RestockModule: React.FC = () => {
  const [products] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = products.filter(p => 
    p.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper for progress bar color
  const getProgressColor = (current: number) => {
    // Just a visual approximation from screenshot
    return 'bg-cyber-cyan';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
         <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-white tracking-wider">智能备货清单</h1>
            <span className="px-2 py-1 text-[10px] font-bold border border-white/20 text-gray-300 rounded font-mono uppercase">Smart Restock</span>
         </div>
         
         <div className="flex gap-4">
            <div className="bg-[#111] border border-white/10 rounded-xl px-5 py-2 flex items-center gap-4">
               <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                  <Box size={16} />
               </div>
               <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono font-bold">SKU 总数</div>
                  <div className="text-xl font-black text-white leading-none">12</div>
               </div>
            </div>
            <div className="bg-[#111] border border-white/10 rounded-xl px-5 py-2 flex items-center gap-4">
               <div className="text-emerald-500 font-bold text-lg">$</div>
               <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono font-bold">库存存货总额 (RMB)</div>
                  <div className="text-xl font-black text-white leading-none flex items-baseline gap-1">
                     <span className="text-emerald-400">¥ 346,049</span>
                  </div>
               </div>
            </div>
            <button className="bg-cyber-cyan text-black px-6 py-2 rounded-lg font-bold hover:bg-white transition-colors flex items-center gap-2 shadow-neon-cyan h-[52px]">
               <Plus size={18} /> 新建 SKU
            </button>
         </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
         <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜索 SKU, 产品名称..." 
            className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white outline-none focus:border-cyber-cyan/50 focus:bg-black transition-all font-mono text-sm"
         />
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[40px_1.5fr_1.5fr_1.5fr_1.5fr_1.2fr_1.2fr_100px] gap-4 px-6 py-2 text-[10px] font-bold text-gray-500 uppercase font-mono tracking-wider border-b border-white/5">
         <div></div>
         <div>SKU / 入库信息</div>
         <div>产品详情 / 箱规</div>
         <div>物流状态</div>
         <div>库存 / 计划补货量</div>
         <div>硬成本 (RMB)</div>
         <div>利润分析 (USD)</div>
         <div className="text-right">操作</div>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-3">
         {filtered.map((product) => (
            <div key={product.id} className="group relative bg-[#0F1218]/80 border border-white/5 rounded-lg p-4 hover:border-cyber-cyan/30 transition-all duration-300">
               
               <div className="grid grid-cols-1 md:grid-cols-[40px_1.5fr_1.5fr_1.5fr_1.5fr_1.2fr_1.2fr_100px] gap-4 items-center">
                  
                  {/* Checkbox */}
                  <div className="flex justify-center">
                     <input type="checkbox" className="w-4 h-4 rounded bg-black border-gray-700 checked:bg-cyber-cyan" />
                  </div>

                  {/* SKU Info */}
                  <div>
                     <div className="font-black text-cyber-cyan text-sm mb-1">{product.skuCode}</div>
                     <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                        <Box size={10} /> {product.inboundId}
                     </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-gray-400" />
                     </div>
                     <div>
                        <div className="text-xs font-bold text-white mb-0.5">{product.productName}</div>
                        <div className="text-[10px] text-gray-500 font-mono flex gap-2">
                           <span>🏭 {product.supplier}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-1 bg-white/5 px-1.5 py-0.5 rounded inline-block">
                           装箱: {product.packing.pcsPerBox} pcs | 箱数: {product.packing.boxCount}
                        </div>
                     </div>
                  </div>

                  {/* Logistics */}
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        {product.logistics.mode === 'air' ? <Plane size={12} className="text-cyber-cyan" /> : <Ship size={12} className="text-blue-400" />}
                        <span className="text-[10px] font-mono text-gray-500 truncate max-w-[100px]">{product.logistics.trackingNo}</span>
                        <ArrowRight size={10} className="text-gray-600" />
                     </div>
                     <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                        <span>⚖️ {product.logistics.weight}</span>
                        <span className="bg-white/10 px-1 rounded text-gray-400">{product.logistics.tag}</span>
                     </div>
                  </div>

                  {/* Inventory */}
                  <div>
                     <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-gray-400">现货库存:</span>
                        <span className="text-sm font-bold text-white font-mono">{product.inventory.current}</span>
                     </div>
                     <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-1">
                        <div className={`h-full ${getProgressColor(product.inventory.current)} rounded-full`} style={{width: '60%'}}></div>
                     </div>
                     <div className="flex justify-between text-[10px]">
                        <span className="text-gray-600 font-mono">Inventory</span>
                        <span className="text-cyber-green font-mono">补货: {product.inventory.planned}</span>
                     </div>
                  </div>

                  {/* Costs (RMB) */}
                  <div className="font-mono">
                     <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                        <span>采购</span>
                        <span className="text-white">¥{product.costRMB.purchase.toFixed(1)}</span>
                     </div>
                     <div className="flex justify-between text-[10px] text-gray-500 mb-1 border-b border-white/5 pb-1">
                        <span>头程</span>
                        <span className="text-cyber-cyan">¥{product.costRMB.logistics.toFixed(1)}</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold">
                        <span className="text-yellow-500">硬成本</span>
                        <span className="text-yellow-400">¥{product.costRMB.total.toFixed(1)}</span>
                     </div>
                  </div>

                  {/* Profit (USD) */}
                  <div className="font-mono">
                     <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>单品</span>
                        <span className="text-emerald-400 font-bold">+${product.profitUSD.unit.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                        <span className="text-[10px] text-gray-400">总计 (EST)</span>
                        <span className="text-emerald-400 font-bold text-xs">${product.profitUSD.totalEst.toLocaleString()}</span>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1">
                     <button className="w-8 h-8 flex items-center justify-center rounded bg-black border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors">
                        <Edit2 size={14} />
                     </button>
                     <button className="w-8 h-8 flex items-center justify-center rounded bg-black border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors">
                        <Copy size={14} />
                     </button>
                     <button className="w-8 h-8 flex items-center justify-center rounded bg-black border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400/50 transition-colors">
                        <Trash2 size={14} />
                     </button>
                  </div>

               </div>
            </div>
         ))}
      </div>

    </div>
  );
};