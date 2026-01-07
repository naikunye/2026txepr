import React, { useState, useMemo } from 'react';
import { 
  Truck, Ship, Plane, Search, Plus, MapPin, Calendar, ExternalLink, 
  Box, Scale, Layers, DollarSign, Anchor, AlertTriangle, Map, 
  PieChart as PieIcon, Trash2, ArrowRight, MoreHorizontal, CheckCircle2,
  Clock, Activity, Container
} from 'lucide-react';
import { usePersistence } from '../hooks/usePersistence';

// --- Types ---
export interface Shipment {
  id: string;
  internalRef?: string;
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  status: 'pending' | 'transport' | 'customs' | 'exception' | 'delivered';
  carrier: string;
  mode: 'air' | 'sea' | 'rail';
  etd: string;
  eta: string;
  progress: number;
  skuCount?: number;
  supplier?: { name: string; contact?: string; phone?: string; };
  packing?: { totalCartons: number; pcsPerCarton?: number; totalWeightKg: number; totalVolumeCbm?: number; };
  fees?: { freightCost: number; customsDuty?: number; insurance?: number; misc?: number; };
  milestones: { label: string; date: string; status: 'completed' | 'current' | 'pending' }[];
}

// --- Mock Data ---
export const initialShipments: Shipment[] = [
  {
    id: 'TRK-98212102',
    originCode: 'SZX', originCity: '深圳', destCode: 'LAX', destCity: '洛杉矶',
    status: 'transport', carrier: 'DHL Aviation', mode: 'air',
    etd: '1月04日', eta: '1月08日', progress: 65,
    packing: { totalCartons: 45, totalWeightKg: 520, totalVolumeCbm: 1.2 },
    fees: { freightCost: 2400 },
    milestones: [
        { label: '已揽收 (Picked Up)', date: '1月04日 14:00', status: 'completed' },
        { label: '离开起运港 (Departed)', date: '1月05日 02:30', status: 'completed' },
        { label: '到达中转站 (Transit)', date: '1月06日 10:15', status: 'current' },
        { label: '清关 (Customs)', date: '1月07日', status: 'pending' },
        { label: '派送 (Delivery)', date: '1月08日', status: 'pending' }
    ]
  },
  {
    id: 'TRK-SEA-002',
    originCode: 'NGB', originCity: '宁波', destCode: 'LGB', destCity: '长滩',
    status: 'customs', carrier: 'Cosco Shipping', mode: 'sea',
    etd: '12月12日', eta: '1月15日', progress: 85,
    packing: { totalCartons: 1200, totalWeightKg: 15000, totalVolumeCbm: 28.5 },
    fees: { freightCost: 4500 },
    milestones: [
        { label: '装船 (Loaded)', date: '12月12日', status: 'completed' },
        { label: '离港 (Departed)', date: '12月13日', status: 'completed' },
        { label: '海上运输 (At Sea)', date: '12月14日 - 1月10日', status: 'completed' },
        { label: '到港 (Arrived)', date: '1月12日', status: 'completed' },
        { label: '海关查验 (Customs)', date: '1月13日', status: 'current' }
    ]
  },
  {
    id: 'TRK-EX-009',
    originCode: 'HKG', originCity: '香港', destCode: 'JFK', destCity: '纽约',
    status: 'exception', carrier: 'FedEx', mode: 'air',
    etd: '1月02日', eta: '1月05日', progress: 40,
    packing: { totalCartons: 10, totalWeightKg: 120, totalVolumeCbm: 0.5 },
    fees: { freightCost: 850 },
    milestones: [
        { label: '已揽收', date: '1月02日', status: 'completed' },
        { label: '航班延误', date: '1月03日', status: 'current' }
    ]
  }
];

// --- Helpers & Sub-components ---
const getModeColor = (mode: string) => {
  if (mode === 'air') return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', gradient: 'from-purple-600 to-pink-600' };
  if (mode === 'sea') return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', gradient: 'from-blue-600 to-cyan-500' };
  return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', gradient: 'from-yellow-500 to-orange-500' };
};

const ModeIcon = ({ mode, className }: { mode: string, className?: string }) => {
  if(mode === 'air') return <Plane className={className} />;
  if(mode === 'sea') return <Ship className={className} />;
  return <Truck className={className} />;
};

interface ShipmentCardProps {
  data: Shipment;
  isSelected: boolean;
  onSelect: (s: Shipment) => void;
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({ data, isSelected, onSelect }) => {
  const colors = getModeColor(data.mode);
  
  const statusLabels: Record<string, string> = {
      'pending': '待处理',
      'transport': '运输中',
      'customs': '清关中',
      'exception': '异常',
      'delivered': '已送达'
  };

  return (
      <div 
         onClick={() => onSelect(data)}
         className={`
            group relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden
            ${isSelected 
                ? `bg-white/10 border-white/20 shadow-2xl scale-[1.02]` 
                : `bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10`
            }
         `}
      >
          {/* Active Indicator Bar */}
          {isSelected && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colors.gradient}`}></div>}
          
          <div className="flex justify-between items-start mb-4 pl-2">
             <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors.bg} ${colors.text} border ${colors.border}`}>
                   <ModeIcon mode={data.mode} className="w-5 h-5" />
                </div>
                <div>
                   <div className="text-white font-bold text-sm tracking-tight">{data.id}</div>
                   <div className="text-xs text-gray-500 font-mono">{data.carrier}</div>
                </div>
             </div>
             <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                 data.status === 'exception' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                 data.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                 'bg-white/5 text-gray-300 border-white/10'
             }`}>
                 {statusLabels[data.status] || data.status}
             </div>
          </div>

          {/* Route Visual Mini */}
          <div className="flex items-center justify-between pl-2 mb-4">
             <div>
                <div className="text-xl font-black text-white">{data.originCode}</div>
                <div className="text-[10px] text-gray-500 uppercase">{data.originCity}</div>
             </div>
             <div className="flex-1 px-4 flex flex-col items-center">
                <div className="text-[9px] text-gray-500 mb-1">{data.progress}%</div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                   <div className={`h-full bg-gradient-to-r ${colors.gradient}`} style={{width: `${data.progress}%`}}></div>
                </div>
             </div>
             <div className="text-right">
                <div className="text-xl font-black text-white">{data.destCode}</div>
                <div className="text-[10px] text-gray-500 uppercase">{data.destCity}</div>
             </div>
          </div>
          
          <div className="flex justify-between items-center pl-2 pt-3 border-t border-white/5 text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1"><Calendar size={10}/> ETA: {data.eta}</span>
              <span className="flex items-center gap-1"><Scale size={10}/> {data.packing?.totalWeightKg}kg</span>
          </div>
      </div>
  );
};

const DetailView = ({ data }: { data: Shipment | null }) => {
  if(!data) return <div className="h-full flex items-center justify-center text-gray-500">请选择运单 (Select a shipment)</div>;
  const colors = getModeColor(data.mode);

  return (
      <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
          {/* Top Banner (Ticket Header) */}
          <div className={`relative p-8 rounded-t-3xl overflow-hidden border-b border-white/10`}>
             <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-10`}></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
             
             <div className="relative z-10 flex justify-between items-start">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors.border} ${colors.text} bg-black/20 uppercase`}>
                          国际{data.mode === 'air' ? '空运' : '海运'} (International {data.mode === 'air' ? 'Air' : 'Sea'})
                       </span>
                       {data.status === 'exception' && <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><AlertTriangle size={12}/> 延误通报 (DELAY)</span>}
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-1">{data.originCode} <span className="text-white/20 mx-2">→</span> {data.destCode}</h2>
                    <div className="text-sm text-gray-400 flex items-center gap-4">
                        <span>{data.originCity}</span>
                        <ArrowRight size={12}/>
                        <span>{data.destCity}</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-3xl font-bold text-white tabular-nums">{data.progress}%</div>
                    <div className="text-xs text-cyber-cyan font-mono">运输中 (IN TRANSIT)</div>
                 </div>
             </div>

             {/* Big Progress Visual */}
             <div className="mt-8 relative h-2 bg-white/10 rounded-full overflow-visible">
                 <div className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${colors.gradient} shadow-[0_0_15px_rgba(255,255,255,0.3)]`} style={{width: `${data.progress}%`}}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-xl transform translate-x-1/2">
                       <ModeIcon mode={data.mode} className="w-4 h-4 text-white" />
                    </div>
                 </div>
             </div>
             <div className="flex justify-between mt-4 text-xs font-mono font-bold text-gray-500">
                <span>出发: {data.etd}</span>
                <span className="text-white">预计到达: {data.eta}</span>
             </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0C0C0C]">
              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Timeline */}
                  <div>
                     <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
                        <Activity size={16} className="text-cyber-cyan"/> 物流追踪节点 (Tracking)
                     </h3>
                     <div className="space-y-0 relative border-l border-white/10 ml-3">
                        {data.milestones.map((m, i) => (
                           <div key={i} className="pl-8 pb-8 relative group">
                              <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                                  m.status === 'completed' ? 'bg-cyber-cyan border-cyber-cyan shadow-[0_0_8px_#00F0FF]' : 
                                  m.status === 'current' ? 'bg-black border-white animate-pulse' : 'bg-black border-gray-700'
                              }`}></div>
                              <div className="flex justify-between items-start">
                                  <div>
                                      <div className={`text-sm font-bold ${m.status === 'pending' ? 'text-gray-500' : 'text-white'}`}>{m.label}</div>
                                      <div className="text-xs text-gray-500 mt-0.5 font-mono">{m.date}</div>
                                  </div>
                                  {m.status === 'completed' && <CheckCircle2 size={14} className="text-cyber-green opacity-50"/>}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-6">
                     {/* Packing Info */}
                     <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><Box size={14}/> 货物规格 (Cargo Specs)</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-3 bg-black rounded-xl">
                              <div className="text-[10px] text-gray-500 uppercase">重量 (Weight)</div>
                              <div className="text-lg font-bold text-white">{data.packing?.totalWeightKg} <span className="text-xs text-gray-600">kg</span></div>
                           </div>
                           <div className="p-3 bg-black rounded-xl">
                              <div className="text-[10px] text-gray-500 uppercase">体积 (Volume)</div>
                              <div className="text-lg font-bold text-white">{data.packing?.totalVolumeCbm} <span className="text-xs text-gray-600">cbm</span></div>
                           </div>
                           <div className="p-3 bg-black rounded-xl">
                              <div className="text-[10px] text-gray-500 uppercase">箱数 (Cartons)</div>
                              <div className="text-lg font-bold text-white">{data.packing?.totalCartons} <span className="text-xs text-gray-600">boxes</span></div>
                           </div>
                           <div className="p-3 bg-black rounded-xl">
                              <div className="text-[10px] text-gray-500 uppercase">承运商 (Carrier)</div>
                              <div className="text-sm font-bold text-white truncate">{data.carrier}</div>
                           </div>
                        </div>
                     </div>

                     {/* Cost Info */}
                     <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-5"><DollarSign size={64}/></div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><DollarSign size={14}/> 物流成本 (Logistics Cost)</h4>
                        <div className="flex justify-between items-end mb-2">
                           <div className="text-sm text-gray-400">运费 (Freight)</div>
                           <div className="text-xl font-bold text-white font-mono">${data.fees?.freightCost}</div>
                        </div>
                        <div className="w-full bg-black h-1 rounded-full mb-2">
                           <div className="w-3/4 h-full bg-cyber-green rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                           <span>已付: 75%</span>
                           <span>待付: 25%</span>
                        </div>
                     </div>
                     
                     <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all">
                           下载发票
                        </button>
                        <button className="flex-1 py-3 bg-cyber-cyan/10 border border-cyber-cyan/50 hover:bg-cyber-cyan hover:text-black text-cyber-cyan font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                           承运商官网查询
                        </button>
                     </div>
                  </div>
              </div>
          </div>
      </div>
  );
};

export const LogisticsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'track' | 'analytics'>('track');
  const [filterMode, setFilterMode] = useState('all');
  const [shipments, setShipments] = usePersistence<Shipment[]>('AERO_LOGISTICS_DATA', initialShipments);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(shipments[0] || null);

  const filterLabels: Record<string, string> = {
      'all': '全部',
      'transport': '运输中',
      'customs': '清关中',
      'exception': '异常',
      'delivered': '已送达'
  };

  return (
    <div className="px-6 pb-6 h-screen flex flex-col animate-in fade-in duration-500 overflow-hidden">
      
      {/* 1. Header Area - Slim & Sticky */}
      <div className="flex-shrink-0 pt-6 pb-4">
          <div className="flex justify-between items-end mb-6">
             <div>
                <h1 className="text-3xl font-black text-white tracking-wider flex items-center gap-3">
                   <Map className="text-cyber-cyan" size={32} />
                   物流指挥中心
                </h1>
                <p className="text-gray-500 font-mono text-xs mt-1">全球物流追踪系统</p>
             </div>
             
             {/* Stats Pills */}
             <div className="hidden lg:flex gap-4">
                 {[
                     { label: '运输中', val: shipments.filter(s=>s.status==='transport').length, c: 'text-cyber-cyan' },
                     { label: '清关中', val: shipments.filter(s=>s.status==='customs').length, c: 'text-cyber-yellow' },
                     { label: '异常', val: shipments.filter(s=>s.status==='exception').length, c: 'text-red-500 animate-pulse' },
                 ].map((stat, i) => (
                     <div key={i} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-md">
                        <div className="text-[10px] text-gray-400 uppercase font-bold">{stat.label}</div>
                        <div className={`text-xl font-black ${stat.c}`}>{stat.val}</div>
                     </div>
                 ))}
                 <button 
                    onClick={() => {}} // Hook up create
                    className="bg-white text-black px-4 py-2 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                 >
                    <Plus size={18} /> 新建运单
                 </button>
             </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="relative flex-1 max-w-sm group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors" size={16} />
                  <input 
                    placeholder="搜索追踪号 / 起始地 / 目的地..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyber-cyan outline-none transition-all font-mono"
                  />
              </div>
              <div className="flex gap-2">
                 {Object.keys(filterLabels).map(f => (
                     <button 
                        key={f}
                        onClick={() => setFilterMode(f)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                            filterMode === f 
                            ? 'bg-white/10 border-white text-white shadow-lg' 
                            : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                     >
                        {filterLabels[f]}
                     </button>
                 ))}
              </div>
          </div>
      </div>

      {/* 2. Main Workspace (Split View) */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
          
          {/* List Column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0 bg-[#0A0A0A] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
             <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">运单列表 (Shipment List)</span>
                <span className="text-xs font-mono text-gray-600">{shipments.length} 条记录</span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                 {shipments
                    .filter(s => filterMode === 'all' || s.status === filterMode)
                    .map(s => (
                     <ShipmentCard 
                        key={s.id} 
                        data={s} 
                        isSelected={selectedShipment?.id === s.id} 
                        onSelect={setSelectedShipment}
                     />
                 ))}
             </div>
          </div>

          {/* Detail Column (The "Ticket" View) */}
          <div className="hidden lg:block col-span-8 bg-[#0F0F0F] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
              <DetailView data={selectedShipment} />
          </div>

      </div>
    </div>
  );
};