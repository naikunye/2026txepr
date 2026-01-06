import React, { useState, useEffect } from 'react';
import { 
  Truck, Ship, Plane, Search, Plus, MapPin, Calendar, ArrowRight, 
  Box, ExternalLink, Anchor, Clock, AlertTriangle, CheckCircle2, 
  TrendingUp, BarChart3, Globe, Filter, MoreHorizontal, PackageOpen,
  Navigation, Zap, Activity, X, Save, Trash2, Edit3, Sliders,
  Factory, DollarSign, Copy, Layers, Scale
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip as RechartsTooltip, BarChart, Bar, Cell } from 'recharts';
import { usePersistence } from '../hooks/usePersistence';

// --- Types & Mock Data ---

export interface Milestone {
  label: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
}

export interface Shipment {
  id: string; // Tracking No
  internalRef: string; // LX Ref
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  status: 'pending' | 'transport' | 'customs' | 'delivered' | 'exception';
  carrier: string;
  mode: 'air' | 'sea' | 'rail';
  etd: string;
  eta: string;
  progress: number;
  
  // Extended Data for "Detail View"
  skuCount: number;
  supplier: {
    name: string;
    contact: string;
    phone: string;
  };
  packing: {
    totalCartons: number;
    pcsPerCarton: number;
    totalWeightKg: number;
    totalVolumeCbm: number;
  };
  fees: {
    freightCost: number;
    customsDuty: number;
    insurance: number;
    misc: number;
  };
  
  milestones: Milestone[];
}

export const initialShipments: Shipment[] = [
  { 
    id: '1ZHV2525041299', 
    internalRef: 'LX-240105-01',
    originCode: 'SZX', originCity: '深圳',
    destCode: 'ONT8', destCity: 'Moreno Valley',
    status: 'transport',
    carrier: 'Matson Express',
    mode: 'sea',
    etd: 'Jan 05', eta: 'Jan 22',
    progress: 65,
    skuCount: 1200,
    supplier: { name: 'YiWu BlackRock Outdoor', contact: 'Mr. Wang', phone: '+86 138-0000-0000' },
    packing: { totalCartons: 60, pcsPerCarton: 20, totalWeightKg: 1250, totalVolumeCbm: 4.5 },
    fees: { freightCost: 850, customsDuty: 120, insurance: 50, misc: 30 },
    milestones: [
        { label: '已订舱', date: '01/02', status: 'completed' },
        { label: '已离港', date: '01/05', status: 'completed' },
        { label: '运输中', date: 'Now', status: 'current' },
        { label: '清关中', date: '01/20', status: 'pending' },
        { label: '已送达', date: '01/22', status: 'pending' },
    ]
  },
  { 
    id: '7822991022', 
    internalRef: 'LX-240108-AIR',
    originCode: 'PVG', originCity: '上海',
    destCode: 'LHR', destCity: 'London',
    status: 'customs',
    carrier: 'DHL Aviation',
    mode: 'air',
    etd: 'Jan 08', eta: 'Jan 11',
    progress: 85,
    skuCount: 450,
    supplier: { name: 'Dongguan Tech Electronics', contact: 'Lisa Zhang', phone: '+86 139-1111-2222' },
    packing: { totalCartons: 15, pcsPerCarton: 30, totalWeightKg: 320, totalVolumeCbm: 0.8 },
    fees: { freightCost: 2100, customsDuty: 450, insurance: 80, misc: 20 },
    milestones: [
        { label: '已揽收', date: '01/08', status: 'completed' },
        { label: '已离港', date: '01/08', status: 'completed' },
        { label: '已抵达', date: '01/10', status: 'completed' },
        { label: '清关中', date: 'Now', status: 'current' },
        { label: '尾程派送', date: '01/11', status: 'pending' },
    ]
  },
  { 
    id: 'MSCU9988221', 
    internalRef: 'LX-240101-SEA',
    originCode: 'NGB', originCity: '宁波',
    destCode: 'LGB3', destCity: 'Long Beach',
    status: 'exception',
    carrier: 'MSC Line',
    mode: 'sea',
    etd: 'Jan 01', eta: 'Jan 28',
    progress: 40,
    skuCount: 5000,
    supplier: { name: 'Ningbo Home Goods Co.', contact: 'Manager Li', phone: '+86 137-3333-4444' },
    packing: { totalCartons: 200, pcsPerCarton: 25, totalWeightKg: 4500, totalVolumeCbm: 12 },
    fees: { freightCost: 1200, customsDuty: 300, insurance: 100, misc: 50 },
    milestones: [
        { label: '进闸', date: '12/30', status: 'completed' },
        { label: '装船', date: '01/01', status: 'completed' },
        { label: '海上运输', date: 'Now', status: 'current' },
        { label: '靠港', date: '01/25', status: 'pending' },
        { label: '已送达', date: '01/28', status: 'pending' },
    ]
  },
];

export const LogisticsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'analytics'>('map');
  const [filterMode, setFilterMode] = useState('all');
  
  // Real-time Persistence Hook (Replaces manual localStorage handling)
  const [shipments, setShipments] = usePersistence<Shipment[]>('AERO_LOGISTICS_DATA', initialShipments);

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const handleTrackClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    window.open(`https://www.ups.com/track?loc=zh_CN&tracknum=${id}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'transport': return 'text-cyber-cyan border-cyber-cyan';
      case 'customs': return 'text-cyber-yellow border-cyber-yellow';
      case 'exception': return 'text-cyber-pink border-cyber-pink';
      case 'delivered': return 'text-cyber-green border-cyber-green';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'transport': return '运输中';
      case 'customs': return '清关中';
      case 'exception': return '异常/滞留';
      case 'delivered': return '已送达';
      case 'pending': return '待处理';
      default: return status;
    }
  };

  const ModeIcon = ({ mode, className }: { mode: string, className?: string }) => {
    if(mode === 'air') return <Plane size={16} className={className} />;
    if(mode === 'sea') return <Ship size={16} className={className} />;
    return <Truck size={16} className={className} />;
  };

  // --- CRUD Handlers ---

  const handleCreateNew = () => {
    const newShipment: Shipment = {
        id: `TRK-${Date.now().toString().slice(-6)}`,
        internalRef: 'LX-NEW-DRAFT',
        originCode: 'SZX', originCity: '深圳',
        destCode: 'LAX', destCity: 'Los Angeles',
        status: 'pending',
        carrier: 'UPS',
        mode: 'air',
        etd: 'Pending', eta: 'Pending',
        progress: 0,
        skuCount: 0,
        supplier: { name: '', contact: '', phone: '' },
        packing: { totalCartons: 0, pcsPerCarton: 0, totalWeightKg: 0, totalVolumeCbm: 0 },
        fees: { freightCost: 0, customsDuty: 0, insurance: 0, misc: 0 },
        milestones: [
            { label: '已创建', date: 'Today', status: 'current' },
            { label: '已离港', date: '-', status: 'pending' },
            { label: '已送达', date: '-', status: 'pending' },
        ]
    };
    setShipments([newShipment, ...shipments]);
    setSelectedShipment(newShipment);
  };

  const handleDuplicate = () => {
    if(!selectedShipment) return;
    const copiedShipment: Shipment = {
        ...selectedShipment,
        id: `COPY-${Date.now().toString().slice(-4)}`,
        internalRef: `${selectedShipment.internalRef}-COPY`,
        status: 'pending',
        progress: 0,
        etd: 'Pending',
        eta: 'Pending',
        milestones: [
            { label: '已创建 (复制)', date: 'Today', status: 'current' },
            { label: '已离港', date: '-', status: 'pending' },
            { label: '已送达', date: '-', status: 'pending' },
        ]
    };
    setShipments([copiedShipment, ...shipments]);
    setSelectedShipment(copiedShipment);
    alert('SKU / 运单记录复制成功！');
  };

  const handleDelete = () => {
      if(!selectedShipment) return;
      if(confirm('确定要删除此运单记录吗？')) {
          setShipments(shipments.filter(s => s.id !== selectedShipment.id));
          setSelectedShipment(null);
      }
  };

  const handleUpdate = (field: string, value: any) => {
      if(!selectedShipment) return;
      const keys = field.split('.');
      if (keys.length === 2) {
          // Handle nested updates (e.g. supplier.name)
          setSelectedShipment({
              ...selectedShipment,
              [keys[0]]: {
                  // @ts-ignore
                  ...selectedShipment[keys[0]],
                  [keys[1]]: value
              }
          });
      } else {
          setSelectedShipment({ ...selectedShipment, [field]: value });
      }
  };

  const handleMilestoneUpdate = (idx: number, field: keyof Milestone, value: any) => {
      if(!selectedShipment) return;
      const newMilestones = [...selectedShipment.milestones];
      newMilestones[idx] = { ...newMilestones[idx], [field]: value };
      setSelectedShipment({ ...selectedShipment, milestones: newMilestones });
  };

  const handleSave = () => {
      if(!selectedShipment) return;
      setShipments(shipments.map(s => s.id === selectedShipment.id ? selectedShipment : s));
      setSelectedShipment(null); // Close modal
  };

  // --- Modal Renderer ---
  const renderEditModal = () => {
    if (!selectedShipment) return null;

    const totalCost = (selectedShipment.fees.freightCost + selectedShipment.fees.customsDuty + selectedShipment.fees.insurance + selectedShipment.fees.misc);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#080808] border border-white/10 w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col relative">
                {/* Modal Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-white/10 bg-[#0c0c0c] sticky top-0 z-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center rounded text-cyber-cyan shadow-neon-cyan">
                           <ModeIcon mode={selectedShipment.mode} className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">追踪单号 (Tracking No)</div>
                            <input 
                                value={selectedShipment.id}
                                onChange={(e) => handleUpdate('id', e.target.value)}
                                className="bg-transparent text-2xl font-black text-white outline-none border-b border-transparent focus:border-cyber-cyan transition-all w-64"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={handleDuplicate} 
                            className="px-4 py-2 bg-purple-900/30 border border-purple-500/50 text-purple-400 font-bold hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2 text-sm uppercase"
                            title="复制此运单记录"
                        >
                            <Copy size={16} /> 复制 SKU/运单
                        </button>
                        <div className="w-[1px] h-10 bg-white/10 mx-2 hidden md:block"></div>
                        <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/30 transition-all">
                            <Trash2 size={20} />
                        </button>
                        <button onClick={() => setSelectedShipment(null)} className="px-6 py-2 text-gray-400 hover:text-white font-bold">
                            取消
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 bg-cyber-cyan text-black font-bold hover:bg-white transition-all shadow-neon-cyan flex items-center gap-2">
                            <Save size={18} /> 保存更改
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 grid grid-cols-12 gap-8">
                    {/* ... (Modal content structure maintained) ... */}
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                        <div className="tech-border p-6 bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
                                <Activity size={16} className="text-cyber-cyan" /> 运输状态与进度
                            </h3>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="lbl">当前状态</label>
                                    <select 
                                        value={selectedShipment.status}
                                        onChange={(e) => handleUpdate('status', e.target.value)}
                                        className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-cyber-cyan"
                                    >
                                        <option value="pending">待处理</option>
                                        <option value="transport">运输中</option>
                                        <option value="customs">清关中</option>
                                        <option value="exception">异常</option>
                                        <option value="delivered">已送达</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="lbl">当前进度 (%)</label>
                                    <input 
                                        type="number"
                                        value={selectedShipment.progress}
                                        onChange={(e) => handleUpdate('progress', parseInt(e.target.value))}
                                        className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-cyber-cyan"
                                    />
                                </div>
                                <div>
                                    <label className="lbl">出发地 (Code)</label>
                                    <input 
                                        value={selectedShipment.originCode}
                                        onChange={(e) => handleUpdate('originCode', e.target.value)}
                                        className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-cyber-cyan"
                                    />
                                </div>
                                <div>
                                    <label className="lbl">目的地 (Code)</label>
                                    <input 
                                        value={selectedShipment.destCode}
                                        onChange={(e) => handleUpdate('destCode', e.target.value)}
                                        className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-cyber-cyan"
                                    />
                                </div>
                            </div>
                            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/10">
                                <div className="h-full bg-cyber-cyan shadow-neon-cyan transition-all duration-500" style={{width: `${selectedShipment.progress}%`}}></div>
                            </div>
                        </div>
                        
                        {/* ... Milestones ... */}
                        <div className="tech-border p-6 bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
                                <Navigation size={16} className="text-cyber-purple" /> 节点追踪
                            </h3>
                            <div className="space-y-4">
                                {selectedShipment.milestones.map((m, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${m.status === 'completed' ? 'bg-cyber-green' : m.status === 'current' ? 'bg-cyber-cyan animate-pulse' : 'bg-gray-600'}`}></div>
                                        <input 
                                            value={m.label}
                                            onChange={(e) => handleMilestoneUpdate(i, 'label', e.target.value)}
                                            className="bg-transparent border-b border-transparent focus:border-white/20 text-white text-sm outline-none w-32"
                                        />
                                        <input 
                                            value={m.date}
                                            onChange={(e) => handleMilestoneUpdate(i, 'date', e.target.value)}
                                            className="bg-transparent border-b border-transparent focus:border-white/20 text-gray-400 font-mono text-xs outline-none w-24"
                                        />
                                        <select
                                            value={m.status}
                                            onChange={(e) => handleMilestoneUpdate(i, 'status', e.target.value)}
                                            className="bg-black text-xs text-gray-400 border border-white/10 p-1"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="current">Current</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5 space-y-8">
                        {/* ... Right Column Details ... */}
                        <div className="tech-border p-6 bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
                                <Box size={16} className="text-cyber-yellow" /> 货物详情
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">总箱数</span>
                                    <input 
                                        type="number" 
                                        value={selectedShipment.packing.totalCartons} 
                                        onChange={(e) => handleUpdate('packing.totalCartons', parseInt(e.target.value))}
                                        className="bg-black border border-white/20 w-20 text-right p-1 text-white"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">总重量 (KG)</span>
                                    <input 
                                        type="number" 
                                        value={selectedShipment.packing.totalWeightKg} 
                                        onChange={(e) => handleUpdate('packing.totalWeightKg', parseFloat(e.target.value))}
                                        className="bg-black border border-white/20 w-20 text-right p-1 text-white"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">总体积 (CBM)</span>
                                    <input 
                                        type="number" 
                                        value={selectedShipment.packing.totalVolumeCbm} 
                                        onChange={(e) => handleUpdate('packing.totalVolumeCbm', parseFloat(e.target.value))}
                                        className="bg-black border border-white/20 w-20 text-right p-1 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="tech-border p-6 bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
                                <DollarSign size={16} className="text-cyber-green" /> 费用清单 (USD)
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">头程运费</span>
                                    <input 
                                        type="number" 
                                        value={selectedShipment.fees.freightCost} 
                                        onChange={(e) => handleUpdate('fees.freightCost', parseFloat(e.target.value))}
                                        className="bg-black border border-white/20 w-24 text-right p-1 text-white"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">关税</span>
                                    <input 
                                        type="number" 
                                        value={selectedShipment.fees.customsDuty} 
                                        onChange={(e) => handleUpdate('fees.customsDuty', parseFloat(e.target.value))}
                                        className="bg-black border border-white/20 w-24 text-right p-1 text-white"
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <span className="font-bold text-white">总费用</span>
                                    <span className="font-bold text-cyber-green text-lg">${totalCost.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="px-6 pb-6 space-y-6 animate-in fade-in duration-500">
      
      {renderEditModal()}

      {/* Header - Fixed to pt-6 pb-4 */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-6 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] mb-6 flex justify-between items-end">
         <div>
            <h1 className="text-3xl font-black text-white tracking-wider flex items-center gap-3">
                物流追踪 <span className="text-cyber-cyan text-sm px-2 py-0.5 border border-cyber-cyan rounded align-top mt-1 font-mono">TRACKING</span>
            </h1>
            <p className="text-gray-400 font-mono text-xs mt-1">跨境物流全链路监控</p>
         </div>
         <div className="flex gap-4">
             <div className="flex bg-black border border-white/20 p-1 rounded">
                 <button 
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 text-xs font-bold rounded ${filterMode === 'all' ? 'bg-white/20 text-white' : 'text-gray-500'}`}
                 >全部</button>
                 <button 
                    onClick={() => setFilterMode('transport')}
                    className={`px-3 py-1 text-xs font-bold rounded ${filterMode === 'transport' ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'text-gray-500'}`}
                 >运输中</button>
                 <button 
                    onClick={() => setFilterMode('exception')}
                    className={`px-3 py-1 text-xs font-bold rounded ${filterMode === 'exception' ? 'bg-red-500/20 text-red-500' : 'text-gray-500'}`}
                 >异常</button>
             </div>
             <button 
                onClick={handleCreateNew}
                className="bg-cyber-cyan text-black px-5 py-2 font-bold hover:bg-white transition-colors flex items-center gap-2 text-sm shadow-neon-cyan"
             >
                <Plus size={16} /> 创建运单
             </button>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { title: '在途运单', val: shipments.filter(s => s.status === 'transport').length, icon: Truck, color: 'text-cyber-cyan' },
           { title: '预计到港 (7天)', val: '12', icon: Anchor, color: 'text-cyber-purple' },
           { title: '异常/滞留', val: shipments.filter(s => s.status === 'exception').length, icon: AlertTriangle, color: 'text-cyber-pink' },
           { title: '本月物流费', val: '$12.4k', icon: DollarSign, color: 'text-cyber-green' },
         ].map((item, i) => (
             <div key={i} className="bg-cyber-panel border border-white/10 p-4 flex items-center justify-between group hover:border-white/30 transition-all">
                 <div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{item.title}</div>
                     <div className={`text-2xl font-black ${item.color}`}>{item.val}</div>
                 </div>
                 <div className={`p-3 bg-black border border-white/10 rounded-full ${item.color} group-hover:scale-110 transition-transform`}>
                     <item.icon size={20} />
                 </div>
             </div>
         ))}
      </div>

      {/* Main List */}
      <div className="grid gap-4">
          {shipments
            .filter(s => filterMode === 'all' || s.status === filterMode)
            .map((s) => (
              <div 
                key={s.id} 
                onClick={() => setSelectedShipment(s)}
                className="bg-cyber-panel border border-white/5 p-4 flex flex-col md:flex-row items-center gap-6 hover:border-cyber-cyan/50 transition-all cursor-pointer group relative overflow-hidden"
              >
                  {/* Left Status Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(s.status).split(' ')[0].replace('text-', 'bg-')}`}></div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center rounded-lg shrink-0">
                      <ModeIcon mode={s.mode} className="text-gray-400 group-hover:text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                      <div>
                          <div className="text-[10px] text-gray-500 uppercase font-mono">Tracking No.</div>
                          <div className="font-bold text-white text-sm font-mono flex items-center gap-2">
                              {s.id}
                              <ExternalLink size={12} className="text-gray-600 hover:text-cyber-cyan" onClick={(e) => handleTrackClick(e, s.id)} />
                          </div>
                      </div>
                      <div>
                          <div className="text-[10px] text-gray-500 uppercase font-mono">Route</div>
                          <div className="font-bold text-white text-sm">{s.originCode} <span className="text-gray-600">→</span> {s.destCode}</div>
                      </div>
                      <div>
                          <div className="text-[10px] text-gray-500 uppercase font-mono">Status</div>
                          <div className={`font-bold text-xs px-2 py-0.5 inline-block rounded border ${getStatusColor(s.status)}`}>
                              {getStatusLabel(s.status)}
                          </div>
                      </div>
                      <div>
                          <div className="text-[10px] text-gray-500 uppercase font-mono">ETA</div>
                          <div className="font-bold text-cyber-yellow text-sm">{s.eta}</div>
                      </div>
                  </div>

                  {/* Progress */}
                  <div className="w-full md:w-32 shrink-0">
                      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>进度</span>
                          <span>{s.progress}%</span>
                      </div>
                      <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-cyber-cyan" style={{width: `${s.progress}%`}}></div>
                      </div>
                  </div>

                  <div className="text-gray-500 group-hover:text-cyber-cyan transition-colors">
                      <Edit3 size={18} />
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};