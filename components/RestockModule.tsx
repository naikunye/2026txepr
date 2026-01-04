import React, { useState } from 'react';
import { Search, Plus, Package, Edit2, AlertTriangle, Check, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  pack: string;
  stock: number;
  target: number;
  cost: number;
  sale: number;
  imageColor: string; 
}

const initialProducts: Product[] = [
  { id: 'DSZ-01', name: '战术登山杖 Pro', sku: 'OUTDOOR-001', pack: '20 pcs', stock: 60, target: 120, cost: 47.0, sale: 11.12, imageColor: 'border-cyber-pink text-cyber-pink' },
  { id: 'K7500', name: '赛博机械键盘 K7', sku: 'TECH-KEY-09', pack: '24 pcs', stock: 990, target: 990, cost: 44.0, sale: 5.60, imageColor: 'border-cyber-cyan text-cyber-cyan' },
  { id: 'MDQ-MINI', name: '光子灭蚊灯 Mini', sku: 'HOME-SUM-22', pack: '24 pcs', stock: 200, target: 500, cost: 6.0, sale: 0.26, imageColor: 'border-cyber-green text-cyber-green' },
  { id: 'YOGA-MAT', name: '纳米瑜伽垫', sku: 'FIT-MAT-02', pack: '10 pcs', stock: 15, target: 200, cost: 12.0, sale: 28.50, imageColor: 'border-cyber-yellow text-cyber-yellow' },
  { id: 'USB-C-HUB', name: '7合1 扩展坞', sku: 'TECH-ACC-55', pack: '50 pcs', stock: 320, target: 400, cost: 18.0, sale: 45.00, imageColor: 'border-cyber-purple text-cyber-purple' },
];

export const RestockModule: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', stock: 0, target: 100 });

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Visual Components
  const StockBar = ({ current, max }: { current: number, max: number }) => {
    const percent = Math.min((current / max) * 100, 100);
    const isLow = percent < 30;
    const colorClass = isLow ? 'bg-cyber-pink shadow-neon-pink' : (percent >= 100 ? 'bg-cyber-green shadow-neon-green' : 'bg-cyber-cyan shadow-neon-cyan');
    
    return (
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-mono mb-1">
          <span className={isLow ? 'text-cyber-pink' : 'text-gray-400'}>{current} UNIT</span>
          <span className="text-gray-600">MAX: {max}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${colorClass}`} 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  const handleAddSubmit = () => {
    if(!newProduct.name) return;
    setProducts([{ 
      id: `SKU-${Date.now()}`, 
      name: newProduct.name!, 
      sku: 'NEW-SKU', 
      pack: '1 pcs', 
      stock: Number(newProduct.stock)||0, 
      target: Number(newProduct.target)||100, 
      cost: 0, sale: 0, 
      imageColor: 'border-gray-500 text-gray-500' 
    } as Product, ...products]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* iOS Modal for Add */}
      {isAdding && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
            <div className="bg-cyber-panel w-full max-w-lg border border-cyber-cyan p-8 shadow-neon-cyan relative z-10">
               <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                  <h3 className="text-xl font-bold text-white tracking-widest">新增 SKU</h3>
                  <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
               </div>
               <div className="space-y-4 font-mono text-sm">
                  <input className="w-full p-4 bg-black border border-gray-700 text-white outline-none focus:border-cyber-cyan" placeholder="产品名称" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <div className="flex gap-4">
                     <input type="number" className="w-1/2 p-4 bg-black border border-gray-700 text-white outline-none focus:border-cyber-cyan" placeholder="当前库存" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                     <input type="number" className="w-1/2 p-4 bg-black border border-gray-700 text-white outline-none focus:border-cyber-cyan" placeholder="目标库存" value={newProduct.target} onChange={e => setNewProduct({...newProduct, target: Number(e.target.value)})} />
                  </div>
                  <button onClick={handleAddSubmit} className="w-full py-4 mt-4 bg-cyber-cyan text-black font-bold hover:bg-white hover:shadow-neon-cyan transition-all uppercase tracking-wider">
                     确认入库
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Header with Title and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
         <div>
            <h1 className="text-4xl font-black text-white tracking-wider text-glow">智能补货</h1>
            <p className="text-gray-400 text-xs mt-1 font-mono">INVENTORY MANAGEMENT SYSTEM</p>
         </div>
         <div className="flex items-center gap-4">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-cyan" size={18} />
               <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="搜索 SKU / 产品 ID..." 
                  className="pl-12 pr-4 py-3 bg-black border border-white/20 text-white outline-none focus:border-cyber-cyan w-64 transition-all font-mono text-sm"
               />
            </div>
            <button 
               onClick={() => setIsAdding(true)}
               className="bg-cyber-cyan text-black px-6 py-3 font-bold shadow-neon-cyan hover:bg-white transition-all active:scale-95 flex items-center gap-2 clip-path-polygon"
            >
               <Plus size={18} /> 新增 SKU
            </button>
         </div>
      </div>

      {/* Suggestion Banner */}
      <div className="w-full bg-gradient-to-r from-cyber-purple/20 to-cyber-cyan/10 border border-cyber-purple/50 p-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-purple/20 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         <div className="relative z-10 flex items-start justify-between">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-cyber-purple/20 border border-cyber-purple text-[10px] text-cyber-purple font-mono font-bold animate-pulse">AI 预测</span>
               </div>
               <h2 className="text-xl font-bold text-white mb-1">补货建议</h2>
               <p className="text-gray-400 text-sm max-w-xl">
                  基于 Q1 销售速率分析，<span className="text-white font-bold">战术登山杖 Pro</span> 将在 4 天内耗尽库存。 
                  建议立即补货: <span className="text-cyber-green font-bold">200 件</span> (供应商 A)。
               </p>
            </div>
            <button className="bg-transparent border border-cyber-purple text-cyber-purple px-6 py-2 font-bold hover:bg-cyber-purple hover:text-black transition-colors">
               一键执行
            </button>
         </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
         {filtered.map(product => (
            <div key={product.id} className="bg-black/40 border border-white/10 p-6 hover:border-cyber-cyan hover:shadow-neon-cyan hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative">
               
               <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 border ${product.imageColor} flex items-center justify-center bg-black/50`}>
                     <Package size={24} />
                  </div>
                  <button className="text-gray-600 hover:text-white transition-colors">
                     <Edit2 size={16} />
                  </button>
               </div>

               <div className="mb-4">
                  <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate group-hover:text-cyber-cyan transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                     <span className="border border-gray-700 px-1">{product.sku}</span>
                     <span>•</span>
                     <span>{product.pack}</span>
                  </div>
               </div>

               <StockBar current={product.stock} max={product.target} />

               <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-4">
                  <div>
                     <div className="text-[10px] text-gray-500 uppercase font-mono">预计成本</div>
                     <div className="text-sm font-bold text-white font-mono">¥{(product.cost * (product.target - product.stock)).toLocaleString()}</div>
                  </div>
                  {(product.stock / product.target) < 0.3 ? (
                     <button className="bg-cyber-pink/20 border border-cyber-pink text-cyber-pink px-3 py-1.5 text-xs font-bold hover:bg-cyber-pink hover:text-black transition-colors flex items-center gap-1">
                        <AlertTriangle size={12} /> 补货
                     </button>
                  ) : (
                     <div className="flex items-center gap-1 text-cyber-green text-xs font-bold font-mono">
                        <Check size={12} /> 状态良好
                     </div>
                  )}
               </div>

            </div>
         ))}
      </div>

    </div>
  );
};