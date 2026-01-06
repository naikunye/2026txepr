import React, { useState } from 'react';
import { 
  Search, Plus, MessageCircle, Send, Globe, Instagram, Youtube, 
  UserPlus, Star, LayoutGrid, Kanban, Filter, ArrowUpRight, 
  Package, DollarSign, BarChart3, ChevronRight, X, Heart, Target, Zap, 
  MapPin, Calendar, ExternalLink, Activity, Trash2
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, LineChart, Line, XAxis, Tooltip 
} from 'recharts';
import { usePersistence } from '../hooks/usePersistence';

// --- Types ---

type PipelineStatus = 'scouted' | 'contacted' | 'sample_sent' | 'content_live' | 'paid';

interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube';
  avatar: string; // URL or Initials
  followers: string;
  followersNum: number;
  
  // Performance
  engagementRate: number; // %
  avgViews: string;
  roi: number; // e.g. 3.2
  cpa: number; // Cost Per Acquisition
  
  // Pipeline
  status: PipelineStatus;
  
  // AI Analysis (0-100)
  stats: {
    engagement: number;
    quality: number;
    relevance: number;
    conversion: number;
    loyalty: number;
  };

  // Sample Info
  sampleTracking?: string;
  
  // Tags
  tags: string[];
}

// --- Mock Data ---

const initialInfluencers: Influencer[] = [
  { 
    id: '1', name: 'Natalie U.', handle: '@nat.daily', platform: 'Instagram', 
    avatar: 'N', followers: '450K', followersNum: 450000,
    engagementRate: 4.8, avgViews: '85K', roi: 3.2, cpa: 12.5,
    status: 'contacted',
    stats: { engagement: 80, quality: 90, relevance: 75, conversion: 60, loyalty: 85 },
    tags: ['Fashion', 'US', 'Macro'],
    sampleTracking: ''
  },
  { 
    id: '2', name: 'Tech Marco', handle: '@marcot', platform: 'YouTube', 
    avatar: 'M', followers: '1.2M', followersNum: 1200000,
    engagementRate: 8.5, avgViews: '450K', roi: 5.5, cpa: 8.2,
    status: 'content_live',
    stats: { engagement: 95, quality: 98, relevance: 90, conversion: 92, loyalty: 70 },
    tags: ['Tech', 'Reviewer', 'DE'],
    sampleTracking: '1Z999...'
  },
  { 
    id: '3', name: 'Sarah Styles', handle: '@sstyle', platform: 'TikTok', 
    avatar: 'S', followers: '890K', followersNum: 890000,
    engagementRate: 12.1, avgViews: '1.2M', roi: 2.1, cpa: 4.5,
    status: 'scouted',
    stats: { engagement: 98, quality: 60, relevance: 80, conversion: 50, loyalty: 40 },
    tags: ['Lifestyle', 'Viral', 'UK'],
    sampleTracking: ''
  },
  { 
    id: '4', name: 'Gamer X', handle: '@gamerx_official', platform: 'YouTube', 
    avatar: 'G', followers: '2.5M', followersNum: 2500000,
    engagementRate: 6.2, avgViews: '800K', roi: 4.1, cpa: 9.0,
    status: 'sample_sent',
    stats: { engagement: 70, quality: 85, relevance: 95, conversion: 75, loyalty: 90 },
    tags: ['Gaming', 'Hardware', 'US'],
    sampleTracking: 'LX-SHIP-002'
  },
  { 
    id: '5', name: 'Yoga with Jen', handle: '@jen.yoga', platform: 'Instagram', 
    avatar: 'J', followers: '120K', followersNum: 120000,
    engagementRate: 15.4, avgViews: '30K', roi: 6.8, cpa: 5.5,
    status: 'paid',
    stats: { engagement: 95, quality: 88, relevance: 99, conversion: 85, loyalty: 98 },
    tags: ['Health', 'Micro', 'AU'],
    sampleTracking: 'DELIVERED'
  }
];

// --- Helpers & Configs ---

const PlatformIcon = ({ p, className }: { p: string, className?: string }) => {
  if (p === 'Instagram') return <Instagram size={14} className={`text-cyber-pink ${className}`} />;
  if (p === 'TikTok') return <div className={`text-cyber-cyan font-black text-[10px] ${className}`}>TK</div>; // Lucide doesn't have TikTok
  return <Youtube size={14} className={`text-red-500 ${className}`} />;
};

const statusConfig: Record<PipelineStatus, { label: string, color: string, border: string }> = {
  'scouted': { label: '新发现 (Scouted)', color: 'text-gray-400', border: 'border-gray-600' },
  'contacted': { label: '已建联 (Contacted)', color: 'text-cyber-cyan', border: 'border-cyber-cyan' },
  'sample_sent': { label: '已寄样 (Sampled)', color: 'text-cyber-purple', border: 'border-cyber-purple' },
  'content_live': { label: '内容上线 (Live)', color: 'text-cyber-yellow', border: 'border-cyber-yellow' },
  'paid': { label: '已结算 (Paid)', color: 'text-cyber-green', border: 'border-cyber-green' },
};

// --- Kanban Column Component ---

interface KanbanColumnProps {
  status: PipelineStatus;
  influencers: Influencer[];
  onSelect: (inf: Influencer) => void;
  onDelete: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, influencers, onSelect, onDelete }) => {
  const config = statusConfig[status];
  const items = influencers.filter(i => i.status === status);

  return (
    <div className="min-w-[300px] w-[300px] flex flex-col h-full bg-white/5 border border-white/10 rounded-lg">
       {/* Header */}
       <div className={`p-3 border-b border-white/10 flex justify-between items-center ${config.color}`}>
          <span className="font-bold text-xs uppercase tracking-wider">{config.label}</span>
          <span className="bg-black/50 px-2 py-0.5 rounded text-[10px] font-mono">{items.length}</span>
       </div>
       
       {/* Items - Updated for internal scroll compatibility */}
       <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar h-full">
          {items.map(inf => (
             <div 
               key={inf.id} 
               onClick={() => onSelect(inf)}
               className="bg-black border border-white/10 p-4 hover:border-cyber-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all cursor-pointer group relative overflow-hidden"
             >
                <div className={`absolute top-0 left-0 w-1 h-full ${config.color.replace('text-', 'bg-')}`}></div>
                
                {/* Delete Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(inf.id); }}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <Trash2 size={14} />
                </button>

                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center rounded-full font-bold text-white border border-white/10">
                      {inf.avatar}
                   </div>
                   <div>
                      <div className="font-bold text-white text-sm group-hover:text-cyber-cyan transition-colors">{inf.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                         <PlatformIcon p={inf.platform} />
                         {inf.followers}
                      </div>
                   </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/10 pt-2">
                   <div className="flex justify-between">
                      <span className="text-gray-500">ROI</span>
                      <span className={inf.roi > 3 ? "text-cyber-green" : "text-white"}>{inf.roi}x</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-gray-500">Eng.</span>
                      <span className="text-white">{inf.engagementRate}%</span>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

// --- Main Module ---

export const InfluencerModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'pipeline'>('pipeline');
  
  // Use Persistence Hook
  const [influencers, setInfluencers] = usePersistence<Influencer[]>('AERO_INFLUENCER_DATA', initialInfluencers);
  
  const [selectedInf, setSelectedInf] = useState<Influencer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Handlers ---
  const handleAdd = () => {
      const newInf: Influencer = {
          id: Date.now().toString(),
          name: 'New Creator',
          handle: '@new.creator',
          platform: 'Instagram',
          avatar: '?',
          followers: '0',
          followersNum: 0,
          engagementRate: 0,
          avgViews: '0',
          roi: 0,
          cpa: 0,
          status: 'scouted',
          stats: { engagement: 50, quality: 50, relevance: 50, conversion: 50, loyalty: 50 },
          tags: [],
          sampleTracking: ''
      };
      setInfluencers([newInf, ...influencers]);
      setSelectedInf(newInf);
  };

  const handleDelete = (id: string) => {
      if(confirm("确定要移除该达人吗？")) {
          setInfluencers(influencers.filter(i => i.id !== id));
          if (selectedInf?.id === id) setSelectedInf(null);
      }
  };

  const handleUpdate = (field: string, value: any) => {
      if(!selectedInf) return;
      const updated = { ...selectedInf, [field]: value };
      setSelectedInf(updated);
      setInfluencers(influencers.map(i => i.id === updated.id ? updated : i));
  };

  // --- Renderers ---

  const renderDetailPanel = () => {
    if (!selectedInf) return null;
    
    // Mock History Data
    const historyData = [
      { month: 'Jan', sales: 4000 }, { month: 'Feb', sales: 3000 }, 
      { month: 'Mar', sales: 5000 }, { month: 'Apr', sales: 7800 }, 
      { month: 'May', sales: 6500 }
    ];

    // Radar Data
    const radarData = [
      { subject: '互动率', A: selectedInf.stats.engagement, fullMark: 100 },
      { subject: '内容质量', A: selectedInf.stats.quality, fullMark: 100 },
      { subject: '品牌契合', A: selectedInf.stats.relevance, fullMark: 100 },
      { subject: '转化力', A: selectedInf.stats.conversion, fullMark: 100 },
      { subject: '粉丝粘性', A: selectedInf.stats.loyalty, fullMark: 100 },
    ];

    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-[#080808] border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar">
        
        {/* Header Image / Cover */}
        <div className="h-48 bg-gradient-to-b from-cyber-purple/20 to-[#080808] relative p-6 flex flex-col justify-end">
           <button 
             onClick={() => setSelectedInf(null)} 
             className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
           >
             <X size={20} />
           </button>
           
           <div className="flex items-end gap-6">
              <div className="w-24 h-24 rounded-full border-2 border-cyber-cyan bg-black flex items-center justify-center text-4xl font-black text-white shadow-neon-cyan relative z-10 overflow-hidden">
                 {/* Quick Avatar Edit */}
                 <input 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleUpdate('name', prompt('Enter Initials:', selectedInf.avatar) || selectedInf.avatar)}
                 />
                 {selectedInf.avatar}
              </div>
              <div className="mb-2 flex-1">
                 <input 
                    value={selectedInf.name}
                    onChange={(e) => handleUpdate('name', e.target.value)}
                    className="text-2xl font-black text-white tracking-wide bg-transparent outline-none border-b border-transparent focus:border-cyber-cyan w-full"
                 />
                 <div className="flex items-center gap-2 mt-1">
                    <select 
                        value={selectedInf.platform}
                        onChange={(e) => handleUpdate('platform', e.target.value)}
                        className="bg-black text-xs border border-white/20 text-gray-400 rounded p-1 outline-none"
                    >
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="YouTube">YouTube</option>
                    </select>
                    <input 
                        value={selectedInf.handle}
                        onChange={(e) => handleUpdate('handle', e.target.value)}
                        className="text-cyber-cyan font-mono text-sm bg-transparent outline-none"
                    />
                 </div>
              </div>
           </div>
        </div>

        <div className="p-8 space-y-8">
           
           {/* Pipeline Status */}
           <div className="bg-white/5 p-4 border border-white/10 rounded">
                <label className="text-[10px] text-gray-500 uppercase font-mono mb-2 block">当前阶段 (Pipeline Stage)</label>
                <div className="flex gap-1">
                    {Object.keys(statusConfig).map((s) => (
                        <button
                            key={s}
                            onClick={() => handleUpdate('status', s)}
                            className={`flex-1 py-2 text-[10px] uppercase font-bold border ${selectedInf.status === s ? `bg-cyber-cyan text-black border-cyber-cyan` : `border-gray-700 text-gray-500 hover:border-gray-500`}`}
                        >
                            {statusConfig[s as PipelineStatus].label.split(' ')[0]}
                        </button>
                    ))}
                </div>
           </div>

           {/* 1. Quick Stats Inputs */}
           <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/5 p-3 border border-white/10 text-center">
                 <div className="text-[10px] text-gray-500 uppercase font-mono">粉丝数</div>
                 <input 
                    value={selectedInf.followers} 
                    onChange={e => handleUpdate('followers', e.target.value)}
                    className="text-lg font-bold text-white bg-transparent text-center w-full outline-none" 
                 />
              </div>
              <div className="bg-white/5 p-3 border border-white/10 text-center">
                 <div className="text-[10px] text-gray-500 uppercase font-mono">互动率 (%)</div>
                 <input 
                    type="number"
                    value={selectedInf.engagementRate} 
                    onChange={e => handleUpdate('engagementRate', parseFloat(e.target.value))}
                    className="text-lg font-bold text-cyber-green bg-transparent text-center w-full outline-none" 
                 />
              </div>
              <div className="bg-white/5 p-3 border border-white/10 text-center">
                 <div className="text-[10px] text-gray-500 uppercase font-mono">ROI 投产</div>
                 <input 
                    type="number"
                    value={selectedInf.roi} 
                    onChange={e => handleUpdate('roi', parseFloat(e.target.value))}
                    className="text-lg font-bold text-cyber-yellow bg-transparent text-center w-full outline-none" 
                 />
              </div>
              <div className="bg-white/5 p-3 border border-white/10 text-center">
                 <div className="text-[10px] text-gray-500 uppercase font-mono">CPA ($)</div>
                 <input 
                    type="number"
                    value={selectedInf.cpa} 
                    onChange={e => handleUpdate('cpa', parseFloat(e.target.value))}
                    className="text-lg font-bold text-cyber-pink bg-transparent text-center w-full outline-none" 
                 />
              </div>
           </div>

           {/* 2. AI Radar Analysis */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black border border-white/10 p-4 relative overflow-hidden group">
                 <h3 className="text-xs font-bold text-cyber-purple uppercase mb-4 flex items-center gap-2">
                    <Zap size={14} /> AI 多维能力模型
                 </h3>
                 <div className="h-[200px] w-full text-xs relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#333" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Influencer" dataKey="A" stroke="#BC13FE" fill="#BC13FE" fillOpacity={0.3} />
                          {/* Added Tooltip for value inspection */}
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#BC13FE' }}
                          />
                       </RadarChart>
                    </ResponsiveContainer>
                    
                    {/* Hover Hint Overlay */}
                    <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <div className="bg-black/90 border border-cyber-purple/30 text-cyber-purple px-2 py-1 rounded text-[9px] backdrop-blur-sm shadow-lg max-w-[90%] text-center border-t border-white/10">
                           数据来源：基于近30天互动数据、受众画像及内容转化率综合评估
                        </div>
                    </div>
                 </div>
              </div>

              {/* 3. Sample Tracking */}
              <div className="bg-black border border-white/10 p-4 flex flex-col">
                 <h3 className="text-xs font-bold text-cyber-cyan uppercase mb-4 flex items-center gap-2">
                    <Package size={14} /> 寄样物流状态
                 </h3>
                 <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Tracking #:</span>
                        <input 
                            value={selectedInf.sampleTracking || ''}
                            onChange={(e) => handleUpdate('sampleTracking', e.target.value)}
                            placeholder="输入单号..."
                            className="font-mono text-white bg-transparent outline-none border-b border-gray-700 focus:border-cyber-cyan text-right w-32"
                        />
                    </div>
                    {selectedInf.sampleTracking && (
                        <>
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="w-2/3 h-full bg-cyber-cyan animate-pulse"></div>
                            </div>
                            <div className="text-[10px] text-cyber-cyan font-mono text-right">IN TRANSIT (运输中)</div>
                        </>
                    )}
                 </div>
              </div>
           </div>

           {/* 4. Sales Trend */}
           <div className="bg-black border border-white/10 p-4">
              <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
                 <BarChart3 size={14} className="text-cyber-green" /> 带货销售趋势 (GMV)
              </h3>
              <div className="h-32 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }}
                          cursor={{stroke: 'rgba(255,255,255,0.1)'}}
                       />
                       <Line type="monotone" dataKey="sales" stroke="#39FF14" strokeWidth={2} dot={{r: 3, fill:'#000', stroke:'#39FF14'}} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* 5. Actions Footer */}
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => alert("Simulated: Email client opened.")}
                className="py-3 border border-white/20 hover:border-white hover:bg-white/5 text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                 <MessageCircle size={16} /> 发送消息
              </button>
              <button 
                onClick={() => alert("Simulated: Payout generated.")}
                className="py-3 bg-cyber-cyan text-black font-bold hover:bg-white transition-all flex items-center justify-center gap-2 shadow-neon-cyan"
              >
                 <DollarSign size={16} /> 发起结算
              </button>
           </div>

        </div>
      </div>
    );
  };

  return (
    <div className="px-6 pb-6 space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Detail Panel Overlay */}
      {selectedInf && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSelectedInf(null)}></div>}
      {renderDetailPanel()}

      {/* 1. Header & KPI Bar - NOW STICKY */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-cyber-border pb-6 pt-6 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
               <h1 className="text-3xl font-black text-white tracking-wider flex items-center gap-3">
                  达人矩阵 <span className="text-cyber-cyan text-sm px-2 py-0.5 border border-cyber-cyan rounded align-top mt-1">PRO</span>
               </h1>
               <p className="text-gray-400 font-mono mt-1 text-xs">全球创作者关系管理系统 (CRM)</p>
            </div>
            
            <div className="flex items-center gap-4">
               {/* View Toggles */}
               <div className="bg-black border border-white/20 p-1 flex rounded">
                  <button 
                    onClick={() => setViewMode('pipeline')}
                    className={`p-2 rounded transition-all ${viewMode === 'pipeline' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    title="看板视图 (Pipeline)"
                  >
                     <Kanban size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    title="网格视图 (Grid)"
                  >
                     <LayoutGrid size={16} />
                  </button>
               </div>

               <button 
                 onClick={handleAdd}
                 className="bg-cyber-cyan text-black px-5 py-2.5 font-bold hover:bg-white transition-colors flex items-center gap-2 clip-path-polygon shadow-neon-cyan text-sm"
               >
                  <Plus size={16} /> 录入新达人
               </button>
            </div>
         </div>
         
         {/* Filters moved into Sticky Header for better UX */}
         <div className="flex gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan" size={16} />
               <input 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 placeholder="搜索达人、标签、国家..." 
                 className="w-full pl-10 pr-4 py-2 bg-black border border-white/20 text-white outline-none focus:border-cyber-cyan transition-all font-mono text-sm"
               />
            </div>
            <button className="px-4 py-2 border border-white/20 text-gray-400 hover:text-white flex items-center gap-2 text-sm">
               <Filter size={14} /> 筛选
            </button>
         </div>
      </div>

      {/* KPI Cards - Scrollable Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-cyber-panel border border-white/10 p-4 relative overflow-hidden group">
               <div className="absolute right-0 top-0 p-3 opacity-10"><Globe size={48} /></div>
               <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-1">合作总数 (Total)</div>
               <div className="text-2xl font-black text-white">{influencers.length}</div>
               <div className="text-[10px] text-cyber-green mt-1 flex items-center gap-1"><ArrowUpRight size={10} /> +{influencers.filter(i=>i.status==='scouted').length} 新发现</div>
            </div>
            <div className="bg-cyber-panel border border-white/10 p-4 relative overflow-hidden group">
               <div className="absolute right-0 top-0 p-3 opacity-10"><DollarSign size={48} /></div>
               <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-1">平均 ROI</div>
               <div className="text-2xl font-black text-white">
                  {(influencers.reduce((acc, i) => acc + i.roi, 0) / Math.max(1, influencers.length)).toFixed(1)}x
               </div>
               <div className="text-[10px] text-gray-500 mt-1">目标: 3.5x</div>
            </div>
            <div className="bg-cyber-panel border border-white/10 p-4 relative overflow-hidden group">
               <div className="absolute right-0 top-0 p-3 opacity-10"><Package size={48} /></div>
               <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-1">寄样中</div>
               <div className="text-2xl font-black text-cyber-purple">{influencers.filter(i => i.status === 'sample_sent').length}</div>
               <div className="text-[10px] text-cyber-purple mt-1 animate-pulse">● 追踪中</div>
            </div>
            <div className="bg-cyber-panel border border-white/10 p-4 relative overflow-hidden group">
               <div className="absolute right-0 top-0 p-3 opacity-10"><Star size={48} /></div>
               <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-1">内容上线 (Live)</div>
               <div className="text-2xl font-black text-cyber-yellow">{influencers.filter(i => i.status === 'content_live').length}</div>
               <div className="text-[10px] text-gray-500 mt-1">活跃</div>
            </div>
      </div>

      {/* 2. Main Content Area */}
      <div>
         {viewMode === 'pipeline' ? (
            // PIPELINE VIEW - Fixed height container for internal scrolling needed
            <div className="flex gap-4 overflow-x-auto pb-4 px-1 h-[calc(100vh-320px)] custom-scrollbar">
               {Object.keys(statusConfig).map(status => (
                  <KanbanColumn 
                    key={status} 
                    status={status as PipelineStatus} 
                    influencers={influencers}
                    onSelect={setSelectedInf}
                    onDelete={handleDelete}
                  />
               ))}
            </div>
         ) : (
            // GRID VIEW
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-10">
               {influencers.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map((inf) => (
                  <div key={inf.id} onClick={() => setSelectedInf(inf)} className="bg-cyber-panel border border-white/10 p-6 hover:border-cyber-cyan transition-all duration-300 group cursor-pointer relative overflow-hidden h-[280px] flex flex-col justify-between">
                     <div className="absolute top-0 right-0 p-3">
                        <span className={`px-2 py-1 text-[9px] font-bold uppercase border ${statusConfig[inf.status].border} ${statusConfig[inf.status].color} bg-black`}>
                           {statusConfig[inf.status].label.split(' ')[0]}
                        </span>
                     </div>

                     <div className="text-center mt-4">
                        <div className="w-16 h-16 mx-auto bg-black border border-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
                           {inf.avatar}
                        </div>
                        <h3 className="text-lg font-bold text-white">{inf.name}</h3>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-mono mt-1">
                           <PlatformIcon p={inf.platform} /> {inf.handle}
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4 mt-2">
                        <div className="text-center">
                           <div className="text-[9px] text-gray-500 uppercase">Fans</div>
                           <div className="font-bold text-white">{inf.followers}</div>
                        </div>
                        <div className="text-center border-l border-white/10 border-r">
                           <div className="text-[9px] text-gray-500 uppercase">ROI</div>
                           <div className="font-bold text-cyber-green">{inf.roi}x</div>
                        </div>
                        <div className="text-center">
                           <div className="text-[9px] text-gray-500 uppercase">Eng.</div>
                           <div className="font-bold text-cyber-yellow">{inf.engagementRate}%</div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

    </div>
  );
};