import React, { useState, useEffect } from 'react';
import { 
  Truck, Ship, Plane, Search, Plus, MapPin, Calendar, ArrowRight, 
  Box, ExternalLink, Anchor, Clock, AlertTriangle, CheckCircle2, 
  TrendingUp, BarChart3, Globe, Filter, MoreHorizontal, PackageOpen,
  Navigation, Zap, Activity, X, Save, Trash2, Edit3, Sliders,
  Factory, DollarSign, Copy, Layers, Scale
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip as RechartsTooltip, BarChart, Bar, Cell } from 'recharts';

// --- Types & Mock Data ---

interface Milestone {
  label: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
}

interface Shipment {
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

const initialShipments: Shipment[] = [
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

// Mock Chart Data
const volumeData = [
  { name: '周一', air: 400, sea: 2400 },
  { name: '周二', air: 300, sea: 1398 },
  { name: '周三', air: 200, sea: 9800 },
  { name: '周四', air: 278, sea: 3908 },
  { name: '周五', air: 189, sea: 4800 },
  { name: '周六', air: 239, sea: 3800 },
  { name: '周日', air: 349, sea: 4300 },
];

export const LogisticsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'analytics'>('map');
  const [filterMode, setFilterMode] = useState('all');
  
  // Initialize from LocalStorage or Fallback to Default
  const [shipments, setShipments] = useState<Shipment[]>(() => {
      try {
          const storedData = localStorage.getItem('AERO_LOGISTICS_DATA');
          return storedData ? JSON.parse(storedData) : initialShipments;
      } catch (e) {
          console.error("Failed to load shipments", e);
          return initialShipments;
      }
  });

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Persistence Effect: Save whenever 'shipments' changes
  useEffect(() => {
      localStorage.setItem('AERO_LOGISTICS_DATA', JSON.stringify(shipments));
  }, [shipments]);

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

  // --- DUPLICATE FUNCTIONALITY ---
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
                    
                    {/* LEFT COLUMN: Main Logistics & Timeline */}
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                        
                        {/* Status & Route */}
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
                                        className="input-cyber"
                                    >
                                        <option value="pending">待处理 (Pending)</option>
                                        <option value="transport">运输中 (In Transit)</option>
                                        <option value="customs">清关中 (Customs)</option>
                                        <option value="exception">异常/滞留 (Exception)</option>
                                        <option value="delivered">已送达 (Delivered)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="lbl">进度 ({selectedShipment.progress}%)</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="range" 
                                            min="0" max="100" 
                                            value={selectedShipment.progress}
                                            onChange={(e) => handleUpdate('progress', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
                                        />
                                        <span className="font-mono text-cyber-cyan font-bold w-12 text-right">{selectedShipment.progress}%</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Route Inputs */}
                            <div className="flex items-center gap-4 bg-black p-4 border border-white/10 rounded relative">
                                <div className="flex-1">
                                    <label className="text-[10px] text-gray-500 font-mono mb-1 block">起运地 (代码)</label>
                                    <input 
                                        value={selectedShipment.originCode} 
                                        onChange={(e) => handleUpdate('originCode', e.target.value)}
                                        className="bg-transparent text-xl font-bold text-white outline-none w-full uppercase"
                                        placeholder="SZX"
                                    />
                                    <input 
                                        value={selectedShipment.originCity} 
                                        onChange={(e) => handleUpdate('originCity', e.target.value)}
                                        className="bg-transparent text-xs text-gray-500 outline-none w-full"
                                        placeholder="城市名称"
                                    />
                                </div>
                                <ArrowRight className="text-gray-600" />
                                <div className="flex-1 text-right">
                                    <label className="text-[10px] text-gray-500 font-mono mb-1 block">目的地 (代码)</label>
                                    <input 
                                        value={selectedShipment.destCode} 
                                        onChange={(e) => handleUpdate('destCode', e.target.value)}
                                        className="bg-transparent text-xl font-bold text-white outline-none w-full text-right uppercase"
                                        placeholder="LAX"
                                    />
                                    <input 
                                        value={selectedShipment.destCity} 
                                        onChange={(e) => handleUpdate('destCity', e.target.value)}
                                        className="bg-transparent text-xs text-gray-500 outline-none w-full text-right"
                                        placeholder="城市名称"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <label className="lbl">内部编号 (LX Ref)</label>
                                    <input value={selectedShipment.internalRef} onChange={(e) => handleUpdate('internalRef', e.target.value)} className="input-cyber" />
                                </div>
                                <div>
                                    <label className="lbl">承运商</label>
                                    <input value={selectedShipment.carrier} onChange={(e) => handleUpdate('carrier', e.target.value)} className="input-cyber" />
                                </div>
                            </div>
                        </div>

                        {/* Milestones Editor */}
                        <div className="tech-border p-6 bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                                <MapPin size={16} className="text-cyber-purple" /> 物流节点里程碑
                            </h3>
                            <div className="space-y-3">
                                {selectedShipment.milestones.map((m, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 bg-black/40 border border-white/5 hover:border-white/20 transition-colors">
                                        <div className="flex flex-col items-center gap-1">
                                           <div className={`w-3 h-3 rounded-full ${m.status === 'completed' ? 'bg-cyber-cyan' : m.status === 'current' ? 'bg-cyber-purple animate-pulse' : 'bg-gray-700'}`}></div>
                                           {idx < selectedShipment.milestones.length - 1 && <div className="w-[1px] h-6 bg-gray-800"></div>}
                                        </div>
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                            <input 
                                                value={m.label}
                                                onChange={(e) => handleMilestoneUpdate(idx, 'label', e.target.value)}
                                                className="bg-transparent border-b border-transparent focus:border-gray-500 text-sm text-white font-bold outline-none"
                                            />
                                            <input 
                                                value={m.date}
                                                onChange={(e) => handleMilestoneUpdate(idx, 'date', e.target.value)}
                                                className="bg-transparent border-b border-transparent focus:border-gray-500 text-xs text-gray-400 font-mono outline-none"
                                            />
                                            <select 
                                                value={m.status}
                                                onChange={(e) => handleMilestoneUpdate(idx, 'status', e.target.value as any)}
                                                className="bg-black text-xs text-gray-300 border border-gray-700 outline-none p-1 rounded"
                                            >
                                                <option value="pending">待处理</option>
                                                <option value="current">进行中</option>
                                                <option value="completed">已完成</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Detailed Specs (Supplier, Packing, Costs) */}
                    <div className="col-span-12 lg:col-span-5 space-y-6">
                        
                        {/* 1. Supplier Info */}
                        <div className="tech-border p-6 bg-white/5">
                            <h3 className="text-sm font-bold text-cyber-yellow uppercase mb-4 flex items-center gap-2">
                                <Factory size={16} /> 供应商信息
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="lbl">供应商名称 (Factory Name)</label>
                                    <input value={selectedShipment.supplier?.name} onChange={(e) => handleUpdate('supplier.name', e.target.value)} className="input-cyber" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="lbl">联系人 (Contact)</label>
                                        <input value={selectedShipment.supplier?.contact} onChange={(e) => handleUpdate('supplier.contact', e.target.value)} className="input-cyber" />
                                    </div>
                                    <div>
                                        <label className="lbl">电话 (Phone)</label>
                                        <input value={selectedShipment.supplier?.phone} onChange={(e) => handleUpdate('supplier.phone', e.target.value)} className="input-cyber" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Packing Specs */}
                        <div className="tech-border p-6 bg-white/5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                                <Box size={16} /> 货物装箱规格
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="lbl">总箱数 (Cartons)</label>
                                    <input type="number" value={selectedShipment.packing?.totalCartons} onChange={(e) => handleUpdate('packing.totalCartons', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                                <div>
                                    <label className="lbl">每箱数量 (Pcs/Ctn)</label>
                                    <input type="number" value={selectedShipment.packing?.pcsPerCarton} onChange={(e) => handleUpdate('packing.pcsPerCarton', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                                <div>
                                    <label className="lbl">总重量 (KG)</label>
                                    <input type="number" value={selectedShipment.packing?.totalWeightKg} onChange={(e) => handleUpdate('packing.totalWeightKg', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                                <div>
                                    <label className="lbl">总体积 (CBM)</label>
                                    <input type="number" value={selectedShipment.packing?.totalVolumeCbm} onChange={(e) => handleUpdate('packing.totalVolumeCbm', parseFloat(e.target.value))} className="input-cyber" />
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-black border border-white/10 text-center">
                                <span className="text-gray-500 text-xs font-mono">总件数:</span>
                                <span className="text-xl font-bold text-white ml-2 block">{selectedShipment.packing?.totalCartons * selectedShipment.packing?.pcsPerCarton} Pcs</span>
                            </div>
                        </div>

                        {/* 3. Financial Breakdown */}
                        <div className="tech-border p-6 bg-white/5 border-cyber-green/30">
                            <h3 className="text-sm font-bold text-cyber-green uppercase mb-4 flex items-center gap-2">
                                <DollarSign size={16} /> 费用明细 (Cost Breakdown)
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-gray-400 font-mono w-24">头程运费</label>
                                    <input type="number" value={selectedShipment.fees?.freightCost} onChange={(e) => handleUpdate('fees.freightCost', parseFloat(e.target.value))} className="input-cyber text-right w-32" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-gray-400 font-mono w-24">关税 (Duty)</label>
                                    <input type="number" value={selectedShipment.fees?.customsDuty} onChange={(e) => handleUpdate('fees.customsDuty', parseFloat(e.target.value))} className="input-cyber text-right w-32" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-gray-400 font-mono w-24">保险 (Ins)</label>
                                    <input type="number" value={selectedShipment.fees?.insurance} onChange={(e) => handleUpdate('fees.insurance', parseFloat(e.target.value))} className="input-cyber text-right w-32" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-gray-400 font-mono w-24">杂费 (Misc)</label>
                                    <input type="number" value={selectedShipment.fees?.misc} onChange={(e) => handleUpdate('fees.misc', parseFloat(e.target.value))} className="input-cyber text-right w-32" />
                                </div>
                                
                                <div className="border-t border-white/10 pt-3 flex justify-between items-center mt-2">
                                    <span className="text-sm font-bold text-white">总费用 (Total)</span>
                                    <span className="text-xl font-black text-cyber-green text-glow">${totalCost.toLocaleString()}</span>
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
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      <style>{`
        .lbl {
          font-size: 0.7rem;
          color: #9CA3AF;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 0.35rem;
          display: block;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.05em;
        }
        .input-cyber {
          width: 100%;
          background-color: #000;
          border: 1px solid #333;
          padding: 0.5rem;
          color: white;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-cyber:focus {
          border-color: #00F0FF;
        }
      `}</style>
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-2 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex justify-between items-end flex-shrink-0">
          <div>
             <h1 className="text-3xl font-black text-white tracking-wider">物流追踪</h1>
             <p className="text-gray-400 font-mono text-xs mt-1">实时全链路物流监控</p>
          </div>
          <div className="flex gap-2">
             <span className="px-3 py-1 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono bg-cyber-cyan/5 rounded">
                LIVE 实时连接
             </span>
          </div>
      </div>

      {/* 1. Command Dashboard Header (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
         <div className="bg-cyber-panel border border-white/10 p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Globe size={64} className="text-cyber-cyan" />
            </div>
            <div className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2">活跃运单</div>
            <div className="text-3xl font-black text-white text-glow">{shipments.length}</div>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-cyber-cyan">
               <Activity size={12} className="animate-pulse" /> {shipments.filter(s => s.status === 'delivered').length} 单今日抵达
            </div>
         </div>

         <div className="bg-cyber-panel border border-white/10 p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <AlertTriangle size={64} className="text-cyber-pink" />
            </div>
            <div className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2">异常件</div>
            <div className="text-3xl font-black text-white text-glow text-cyber-pink">
                {shipments.filter(s => s.status === 'exception').length}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-cyber-pink/80">
               <div className="w-1.5 h-1.5 bg-cyber-pink rounded-full animate-ping"></div> 海关扣留 (US)
            </div>
         </div>

         <div className="bg-cyber-panel border border-white/10 p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Clock size={64} className="text-cyber-yellow" />
            </div>
            <div className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2">平均时效</div>
            <div className="text-3xl font-black text-white">14.2 <span className="text-sm font-medium text-gray-500">天</span></div>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-cyber-yellow">
               <TrendingUp size={12} /> 较上月 -1.2 天
            </div>
         </div>

         <div className="bg-cyber-panel border border-white/10 p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Box size={64} className="text-cyber-green" />
            </div>
            <div className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2">总货量</div>
            <div className="text-3xl font-black text-white">
                {shipments.reduce((sum, s) => sum + (s.packing?.totalVolumeCbm || 0), 0).toFixed(1)} <span className="text-sm font-medium text-gray-500">CBM</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-gray-400">
               预估运费: <span className="text-white">${shipments.reduce((sum, s) => sum + (s.fees?.freightCost || 0), 0).toLocaleString()}</span>
            </div>
         </div>
      </div>

      {/* 2. Main Content Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 relative">
         
         {/* Edit Modal (Rendered here to be on top) */}
         {renderEditModal()}

         {/* Left Panel: Advanced List (Scrollable) */}
         <div className="lg:col-span-5 flex flex-col bg-[#080808] border border-white/10 rounded-lg overflow-hidden h-full">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0c0c0c]">
               <div className="flex gap-2">
                  <button onClick={() => setFilterMode('all')} className={`px-3 py-1 text-[10px] font-bold uppercase border transition-all ${filterMode === 'all' ? 'bg-white text-black border-white' : 'border-white/20 text-gray-500 hover:border-white hover:text-white'}`}>全部</button>
                  <button onClick={() => setFilterMode('air')} className={`px-3 py-1 text-[10px] font-bold uppercase border transition-all ${filterMode === 'air' ? 'bg-white text-black border-white' : 'border-white/20 text-gray-500 hover:border-white hover:text-white'}`}>空运</button>
                  <button onClick={() => setFilterMode('sea')} className={`px-3 py-1 text-[10px] font-bold uppercase border transition-all ${filterMode === 'sea' ? 'bg-white text-black border-white' : 'border-white/20 text-gray-500 hover:border-white hover:text-white'}`}>海运</button>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={handleCreateNew} className="p-2 bg-cyber-cyan text-black rounded hover:bg-white transition-colors" title="Create New Shipment">
                      <Plus size={14} strokeWidth={3} />
                  </button>
                  <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                  <button className="p-2 hover:bg-white/10 rounded text-gray-400"><Search size={14} /></button>
                  <button className="p-2 hover:bg-white/10 rounded text-gray-400"><Filter size={14} /></button>
               </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
               {shipments.filter(s => filterMode === 'all' || s.mode === filterMode).map((ship) => (
                  <div 
                    key={ship.id} 
                    onClick={() => setSelectedShipment(ship)}
                    className="bg-[#0F1218] border border-white/10 hover:border-cyber-cyan/50 hover:bg-white/5 transition-all group relative overflow-hidden rounded-md cursor-pointer"
                  >
                     
                     {/* Status Strip */}
                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(ship.status).split(' ')[0].replace('text-', 'bg-')}`}></div>

                     {/* Header */}
                     <div className="p-4 border-b border-white/5 flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-black border border-white/10 flex items-center justify-center rounded">
                              <ModeIcon mode={ship.mode} className={ship.mode === 'air' ? 'text-blue-400' : 'text-blue-600'} />
                           </div>
                           <div>
                              <div className="text-sm font-bold text-white font-mono group-hover:text-cyber-cyan flex items-center gap-2 transition-colors">
                                 {ship.id} 
                                 <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono mt-0.5">{ship.carrier} • {ship.internalRef}</div>
                           </div>
                        </div>
                        <div className={`px-2 py-1 text-[10px] font-bold uppercase border rounded ${getStatusColor(ship.status)} bg-black/50`}>
                           {getStatusLabel(ship.status)}
                        </div>
                     </div>

                     {/* Route & Progress */}
                     <div className="p-4">
                        <div className="flex justify-between items-center mb-6">
                           <div className="text-center">
                              <div className="text-2xl font-black text-white font-mono">{ship.originCode}</div>
                              <div className="text-[10px] text-gray-500 uppercase">{ship.originCity}</div>
                           </div>
                           <div className="flex-1 px-6 flex flex-col items-center">
                              <div className="w-full h-[1px] bg-gray-700 relative mb-1">
                                 <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full"></div>
                                 <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full"></div>
                                 {/* Moving Plane/Ship */}
                                 <div 
                                    className="absolute top-1/2 -translate-y-1/2 p-1 bg-[#0F1218] border border-cyber-cyan text-cyber-cyan rounded-full z-10 shadow-[0_0_10px_#00F0FF]"
                                    style={{ left: `${ship.progress}%` }}
                                 >
                                    <ModeIcon mode={ship.mode} className="w-3 h-3" />
                                 </div>
                              </div>
                              <div className="text-[10px] text-cyber-cyan font-mono">
                                 {ship.progress}% 完成度
                              </div>
                           </div>
                           <div className="text-center">
                              <div className="text-2xl font-black text-white font-mono">{ship.destCode}</div>
                              <div className="text-[10px] text-gray-500 uppercase">{ship.destCity}</div>
                           </div>
                        </div>

                        {/* Milestones Stepper */}
                        <div className="flex justify-between items-start relative">
                           {/* Line behind */}
                           <div className="absolute top-[5px] left-0 right-0 h-[2px] bg-white/5 z-0"></div>
                           
                           {ship.milestones.map((m, idx) => (
                              <div key={idx} className="relative z-10 flex flex-col items-center">
                                 <div className={`w-3 h-3 rounded-full border-2 mb-2 ${
                                    m.status === 'completed' ? 'bg-cyber-cyan border-cyber-cyan shadow-[0_0_5px_#00F0FF]' : 
                                    m.status === 'current' ? 'bg-black border-cyber-yellow animate-pulse' : 'bg-[#0F1218] border-gray-700'
                                 }`}></div>
                                 <div className={`text-[9px] font-bold uppercase ${m.status === 'current' ? 'text-white' : 'text-gray-600'}`}>{m.label}</div>
                                 <div className="text-[9px] text-gray-600 font-mono mt-0.5">{m.date}</div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Footer Meta */}
                     <div className="bg-black/30 border-t border-white/5 p-3 grid grid-cols-3 gap-2 text-[10px] font-mono text-gray-500">
                        <div className="flex items-center gap-1.5">
                           <PackageOpen size={12} className="text-gray-400" />
                           <span>{ship.packing?.totalWeightKg || 0}kg</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <Box size={12} className="text-gray-400" />
                           <span>{ship.packing?.totalVolumeCbm || 0}cbm</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-right justify-end">
                           <Clock size={12} className="text-gray-400" />
                           <span className="text-white">ETA: {ship.eta}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Right Panel: Visualization & Analytics */}
         <div className="lg:col-span-7 flex flex-col gap-6 h-full min-h-0">
            
            {/* Tab Switcher */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-1">
               <button 
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'map' ? 'border-cyber-cyan text-cyber-cyan' : 'border-transparent text-gray-500 hover:text-white'}`}
               >
                  <Navigation size={14} /> 实时监控
               </button>
               <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'analytics' ? 'border-cyber-purple text-cyber-purple' : 'border-transparent text-gray-500 hover:text-white'}`}
               >
                  <BarChart3 size={14} /> 效能分析
               </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 bg-[#080808] border border-white/10 rounded-lg relative overflow-hidden group">
               
               {activeTab === 'map' ? (
                  <>
                     {/* --- MAP VISUALIZATION --- */}
                     {/* Background Grid */}
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                     
                     {/* Map Image */}
                     <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center opacity-10 invert mix-blend-screen"></div>
                     
                     {/* Simulated SVG Routes overlay */}
                     <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                           <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(0,240,255,0)" />
                              <stop offset="50%" stopColor="rgba(0,240,255,0.8)" />
                              <stop offset="100%" stopColor="rgba(0,240,255,0)" />
                           </linearGradient>
                           <filter id="glow">
                              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                              <feMerge>
                                 <feMergeNode in="coloredBlur"/>
                                 <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                           </filter>
                        </defs>

                        {/* Route 1: CN -> US */}
                        <path 
                           d="M 680 200 Q 500 100, 200 180" 
                           stroke="url(#lineGradient)" 
                           strokeWidth="2" 
                           fill="none" 
                           className="animate-[dash_3s_linear_infinite]" 
                           filter="url(#glow)"
                        />
                        {/* Route 2: CN -> EU */}
                        <path 
                           d="M 680 200 Q 600 100, 450 140" 
                           stroke="rgba(188, 19, 254, 0.5)" 
                           strokeWidth="1" 
                           fill="none" 
                           strokeDasharray="4 4"
                        />
                     </svg>

                     {/* Interactive Nodes (Absolute Positioning based on approx map) */}
                     {/* Shenzhen */}
                     <div className="absolute top-[38%] left-[78%] group/node cursor-pointer">
                        <div className="w-3 h-3 bg-cyber-cyan rounded-full animate-ping absolute opacity-50"></div>
                        <div className="w-3 h-3 bg-cyber-cyan rounded-full border-2 border-black relative z-10"></div>
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 border border-cyber-cyan px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity z-20 pointer-events-none">
                           <div className="text-[10px] font-bold text-cyber-cyan">SZX 深圳中心</div>
                           <div className="text-[9px] text-gray-400">8 票出库</div>
                        </div>
                     </div>

                     {/* LA */}
                     <div className="absolute top-[35%] left-[18%] group/node cursor-pointer">
                        <div className="w-4 h-4 border-2 border-cyber-green rounded-full animate-pulse absolute"></div>
                        <div className="w-2 h-2 bg-cyber-green rounded-full relative z-10 m-1"></div>
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 border border-cyber-green px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity z-20 pointer-events-none">
                           <div className="text-[10px] font-bold text-cyber-green">LAX 洛杉矶关口</div>
                           <div className="text-[9px] text-gray-400">清关处理中</div>
                        </div>
                     </div>

                     {/* Radar Scan Effect */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none opacity-20 border-t-cyber-cyan border-r-transparent border-b-transparent border-l-transparent"></div>
                     
                     {/* Map UI Overlay */}
                     <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur border border-white/10 p-4 rounded-lg max-w-xs">
                        <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Zap size={12} className="text-cyber-yellow" /> 系统警报</h4>
                        <div className="space-y-2">
                           <div className="flex items-start gap-2 text-[10px] text-gray-400">
                              <AlertTriangle size={10} className="text-cyber-pink mt-0.5 shrink-0" />
                              <span>MSCU998... (海运) 长滩港拥堵，预计延误 2 天。</span>
                           </div>
                        </div>
                     </div>
                  </>
               ) : (
                  <div className="p-6 h-full flex flex-col">
                     {/* --- ANALYTICS VIEW --- */}
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold text-lg">运输量与成本趋势</h3>
                        <div className="flex gap-2">
                           <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-blue-500"></div> 空运</span>
                           <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-cyan-500"></div> 海运</span>
                        </div>
                     </div>
                     <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={volumeData}>
                              <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                              <RechartsTooltip 
                                 contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }}
                                 cursor={{fill: 'rgba(255,255,255,0.05)'}}
                              />
                              <Bar dataKey="sea" stackId="a" fill="#00F0FF" />
                              <Bar dataKey="air" stackId="a" fill="#3b82f6" />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               )}

            </div>
         </div>
      </div>
    </div>
  );
};