import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, MessageCircle, Globe, Instagram, Youtube, 
  LayoutGrid, Kanban, Filter, ArrowUpRight, 
  DollarSign, BarChart3, X, Zap, 
  MapPin, Trophy, MousePointer2, Sparkles, MoreHorizontal, Layers, Trash2
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, LineChart, Line, Tooltip 
} from 'recharts';
import { usePersistence } from '../hooks/usePersistence';

// --- Types ---

type PipelineStatus = 'scouted' | 'contacted' | 'sample_sent' | 'content_live' | 'paid';

interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube';
  avatar: string; 
  followers: string;
  followersNum: number;
  engagementRate: number;
  avgViews: string;
  roi: number; 
  cpa: number; 
  status: PipelineStatus;
  stats: {
    engagement: number;
    quality: number;
    relevance: number;
    conversion: number;
    loyalty: number;
  };
  sampleTracking?: string;
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
    tags: ['Fashion', 'Macro'],
    sampleTracking: ''
  },
  { 
    id: '2', name: 'Tech Marco', handle: '@marcot', platform: 'YouTube', 
    avatar: 'M', followers: '1.2M', followersNum: 1200000,
    engagementRate: 8.5, avgViews: '450K', roi: 6.5, cpa: 8.2,
    status: 'content_live',
    stats: { engagement: 95, quality: 98, relevance: 90, conversion: 92, loyalty: 70 },
    tags: ['Tech', 'DE'],
    sampleTracking: '1Z999...'
  },
  { 
    id: '3', name: 'Sarah Styles', handle: '@sstyle', platform: 'TikTok', 
    avatar: 'S', followers: '890K', followersNum: 890000,
    engagementRate: 12.1, avgViews: '1.2M', roi: 2.1, cpa: 4.5,
    status: 'scouted',
    stats: { engagement: 98, quality: 60, relevance: 80, conversion: 50, loyalty: 40 },
    tags: ['Lifestyle', 'Viral'],
    sampleTracking: ''
  },
  { 
    id: '4', name: 'Gamer X', handle: '@gamerx_official', platform: 'YouTube', 
    avatar: 'G', followers: '2.5M', followersNum: 2500000,
    engagementRate: 6.2, avgViews: '800K', roi: 4.1, cpa: 9.0,
    status: 'sample_sent',
    stats: { engagement: 70, quality: 85, relevance: 95, conversion: 75, loyalty: 90 },
    tags: ['Gaming', 'US'],
    sampleTracking: 'LX-SHIP-002'
  },
  { 
    id: '5', name: 'Yoga with Jen', handle: '@jen.yoga', platform: 'Instagram', 
    avatar: 'J', followers: '120K', followersNum: 120000,
    engagementRate: 15.4, avgViews: '30K', roi: 6.8, cpa: 5.5,
    status: 'paid',
    stats: { engagement: 95, quality: 88, relevance: 99, conversion: 85, loyalty: 98 },
    tags: ['Health', 'AU'],
    sampleTracking: 'DELIVERED'
  }
];

// --- Configs ---

const statusConfig: Record<PipelineStatus, { label: string, color: string, border: string, bg: string, glow: string }> = {
  'scouted': { label: 'Scouted', color: 'text-gray-400', border: 'border-gray-600', bg: 'bg-gray-500/10', glow: 'shadow-gray-500/20' },
  'contacted': { label: 'Contacted', color: 'text-cyber-cyan', border: 'border-cyber-cyan', bg: 'bg-cyber-cyan/10', glow: 'shadow-cyber-cyan/20' },
  'sample_sent': { label: 'Sampled', color: 'text-cyber-purple', border: 'border-cyber-purple', bg: 'bg-cyber-purple/10', glow: 'shadow-cyber-purple/20' },
  'content_live': { label: 'Content Live', color: 'text-cyber-yellow', border: 'border-cyber-yellow', bg: 'bg-cyber-yellow/10', glow: 'shadow-cyber-yellow/20' },
  'paid': { label: 'Paid', color: 'text-cyber-green', border: 'border-cyber-green', bg: 'bg-cyber-green/10', glow: 'shadow-cyber-green/20' },
};

const PlatformIcon = ({ p, className }: { p: string, className?: string }) => {
  if (p === 'Instagram') return <div className={`bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-md p-0.5 ${className}`}><Instagram size={12} className="text-white" /></div>;
  if (p === 'TikTok') return <div className={`text-black bg-cyan-400 rounded-md p-0.5 relative overflow-hidden ${className}`}><span className="font-black text-[10px] relative z-10">TK</span><div className="absolute inset-0 bg-red-500 mix-blend-multiply translate-x-[1px]"></div></div>;
  return <div className={`bg-red-600 rounded-md p-0.5 ${className}`}><Youtube size={12} className="text-white" /></div>;
};

// --- Sub Components ---

interface HolographicCardProps {
  inf: Influencer;
  onClick: () => void;
}

const HolographicCard: React.FC<HolographicCardProps> = ({ inf, onClick }) => {
    // Calculate "Tier" based on ROI
    let tier = 'B';
    let tierColor = 'text-gray-500 border-gray-500';
    if (inf.roi >= 5) { tier = 'S'; tierColor = 'text-cyber-yellow border-cyber-yellow'; }
    else if (inf.roi >= 3) { tier = 'A'; tierColor = 'text-cyber-purple border-cyber-purple'; }

    return (
        <div 
            onClick={onClick}
            className="group relative h-[380px] w-full bg-[#0c0c0c] rounded-[2rem] border border-white/10 overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Top Status Bar */}
            <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start z-20">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${statusConfig[inf.status].border} ${statusConfig[inf.status].color} ${statusConfig[inf.status].bg}`}>
                    {statusConfig[inf.status].label}
                </div>
                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-black text-lg bg-black/50 backdrop-blur-md shadow-lg ${tierColor}`}>
                    {tier}
                </div>
            </div>

            {/* Avatar Section (Large) */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
                <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border border-white/20 animate-[spin_10s_linear_infinite] opacity-30 group-hover:opacity-100 group-hover:border-cyber-cyan transition-all"></div>
                    <div className="absolute inset-2 rounded-full border border-white/10 animate-[spin_15s_linear_infinite_reverse] opacity-20 group-hover:opacity-100 group-hover:border-cyber-purple transition-all"></div>
                    <div className="absolute inset-4 bg-[#151515] rounded-full flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                        <span className="text-4xl font-black text-white/20 group-hover:text-white transition-colors">{inf.avatar}</span>
                    </div>
                    {/* Platform Badge */}
                    <div className="absolute bottom-2 right-2 shadow-lg scale-110">
                        <PlatformIcon p={inf.platform} />
                    </div>
                </div>
            </div>

            {/* Content Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-[#0a0a0a] to-transparent p-6 flex flex-col justify-end z-10">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyber-cyan transition-colors">{inf.name}</h3>
                    <div className="text-xs text-gray-500 font-mono mt-1 tracking-wide opacity-60 group-hover:opacity-100">{inf.handle}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                    <div className="text-center">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Fans</div>
                        <div className="text-sm font-bold text-white font-mono">{inf.followers}</div>
                    </div>
                    <div className="text-center border-x border-white/10">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">ROI</div>
                        <div className={`text-sm font-bold font-mono ${inf.roi >= 4 ? 'text-cyber-green' : 'text-white'}`}>{inf.roi}x</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Eng.</div>
                        <div className="text-sm font-bold text-cyber-yellow font-mono">{inf.engagementRate}%</div>
                    </div>
                </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 border-2 border-white/0 group-hover:border-cyber-cyan/30 rounded-[2rem] transition-colors pointer-events-none"></div>
        </div>
    );
};

const KanbanColumn = ({ status, influencers, onSelect, onDelete }: any) => {
    const config = statusConfig[status as PipelineStatus];
    const items = influencers.filter((i: Influencer) => i.status === status);

    return (
        <div className="min-w-[320px] flex flex-col h-full rounded-2xl bg-white/5 border border-white/5 overflow-hidden backdrop-blur-sm relative group">
            {/* Column Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`}></div>
                    <span className="font-bold text-xs uppercase tracking-widest text-gray-300">{config.label}</span>
                </div>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-white">{items.length}</span>
            </div>

            {/* Background Noise */}
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>

            {/* List */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar relative z-0">
                {items.map((inf: Influencer) => (
                    <div 
                        key={inf.id} 
                        onClick={() => onSelect(inf)}
                        className="p-4 bg-black/60 border border-white/10 rounded-xl hover:border-cyber-cyan/50 transition-all cursor-pointer group/card relative overflow-hidden shadow-lg"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                    {inf.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white leading-none">{inf.name}</div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-1">{inf.handle}</div>
                                </div>
                            </div>
                            <PlatformIcon p={inf.platform} />
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-gray-400">
                             <div className="flex items-center gap-1">
                                <span className={inf.roi > 3 ? "text-cyber-green" : "text-gray-300"}>ROI: {inf.roi}</span>
                             </div>
                             <div>Fans: {inf.followers}</div>
                        </div>

                         <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(inf.id); }}
                            className="absolute bottom-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Module ---

export const InfluencerModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'pipeline'>('pipeline');
  const [influencers, setInfluencers] = usePersistence<Influencer[]>('AERO_INFLUENCER_DATA', initialInfluencers);
  const [selectedInf, setSelectedInf] = useState<Influencer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInfluencers = useMemo(() => {
     return influencers.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        i.handle.toLowerCase().includes(searchTerm.toLowerCase())
     );
  }, [influencers, searchTerm]);

  // --- Handlers ---
  const handleAdd = () => {
      const newInf: Influencer = {
          id: Date.now().toString(),
          name: 'New Creator',
          handle: '@handle',
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

  const handleUpdate = (field: string, value: any) => {
      if(!selectedInf) return;
      const updated = { ...selectedInf, [field]: value };
      setSelectedInf(updated);
      setInfluencers(influencers.map(i => i.id === updated.id ? updated : i));
  };

  const handleDelete = (id: string) => {
      if(confirm("确定要移除该达人吗？")) setInfluencers(influencers.filter(i => i.id !== id));
  };

  // --- Statistics ---
  const stats = useMemo(() => {
      const total = influencers.length;
      const roiAvg = total > 0 ? (influencers.reduce((a, b) => a + b.roi, 0) / total).toFixed(1) : '0.0';
      const live = influencers.filter(i => i.status === 'content_live').length;
      const potential = influencers.filter(i => i.status === 'scouted').length;
      return { total, roiAvg, live, potential };
  }, [influencers]);

  return (
    <div className="h-full flex flex-col px-6 pb-6 animate-in fade-in duration-700">
      
      {/* 1. Futuristic Header - Unified Glass (Transparent + Blur) */}
      <div className="sticky top-0 z-40 bg-transparent backdrop-blur-2xl border-b border-white/10 pb-6 pt-6 -mx-6 px-6 shadow-sm mb-6 transition-all">
         <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
               <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 text-glow">
                  达人矩阵 <span className="text-cyber-purple text-xs px-2 py-0.5 border border-cyber-purple/50 rounded align-top mt-1 font-mono tracking-widest bg-cyber-purple/10">AGENCY_OS</span>
               </h1>
               <div className="flex items-center gap-6 mt-2">
                   <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                      <Globe size={12} className="text-cyber-cyan"/>
                      <span>Global Relations</span>
                   </div>
                   <div className="w-[1px] h-3 bg-white/10"></div>
                   <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                      <Sparkles size={12} className="text-cyber-yellow"/>
                      <span>AI Scouting Active</span>
                   </div>
               </div>
            </div>

            {/* HUD Stats */}
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
                {[
                    { label: 'TOTAL TALENT', val: stats.total, icon: Layers, color: 'text-white' },
                    { label: 'AVG ROI', val: `${stats.roiAvg}x`, icon: Trophy, color: 'text-cyber-yellow' },
                    { label: 'CONTENT LIVE', val: stats.live, icon: Zap, color: 'text-cyber-green' },
                    { label: 'SCOUTING', val: stats.potential, icon: Search, color: 'text-cyber-purple' },
                ].map((s, i) => (
                    <div key={i} className="px-6 border-r border-white/10 last:border-0 flex flex-col items-center min-w-[100px]">
                        <div className="text-[9px] text-gray-500 font-bold tracking-widest mb-1 flex items-center gap-1.5">
                            <s.icon size={10} /> {s.label}
                        </div>
                        <div className={`text-xl font-black ${s.color} font-mono`}>{s.val}</div>
                    </div>
                ))}
            </div>
            
            <div className="flex gap-3">
               <button 
                 onClick={handleAdd}
                 className="h-12 px-6 bg-white text-black font-black text-sm hover:bg-cyber-cyan transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(64,200,224,0.6)] rounded-xl flex items-center gap-2 group uppercase tracking-wide"
               >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform"/>
                  New Talent
               </button>
            </div>
         </div>

         {/* Toolbar */}
         <div className="mt-8 flex gap-4">
            <div className="relative flex-1 max-w-lg group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="text-gray-500 group-focus-within:text-cyber-cyan transition-colors" size={16} />
               </div>
               <input 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none transition-all font-mono backdrop-blur-sm"
                 placeholder="SEARCH DATABASE..."
               />
               <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <kbd className="inline-flex items-center border border-gray-700 rounded px-2 text-[10px] font-sans font-medium text-gray-500">⌘K</kbd>
               </div>
            </div>
            
            <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 backdrop-blur-sm">
                <button 
                   onClick={() => setViewMode('pipeline')}
                   className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'pipeline' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-white'}`}
                >
                   <Kanban size={14} /> PIPELINE
                </button>
                <div className="w-[1px] bg-white/10 my-1 mx-1"></div>
                <button 
                   onClick={() => setViewMode('grid')}
                   className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-white'}`}
                >
                   <LayoutGrid size={14} /> GRID
                </button>
            </div>
         </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 min-h-0 pt-4">
         {viewMode === 'pipeline' ? (
            <div className="flex gap-6 overflow-x-auto pb-6 h-full custom-scrollbar px-2">
               {Object.keys(statusConfig).map(status => (
                  <KanbanColumn 
                    key={status} 
                    status={status} 
                    influencers={filteredInfluencers}
                    onSelect={setSelectedInf}
                    onDelete={handleDelete}
                  />
               ))}
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
               {filteredInfluencers.map(inf => (
                   <HolographicCard key={inf.id} inf={inf} onClick={() => setSelectedInf(inf)} />
               ))}
               
               {/* Add New Placeholder Card */}
               <div 
                 onClick={handleAdd}
                 className="h-[380px] rounded-[2rem] border-2 border-dashed border-white/10 hover:border-cyber-cyan/50 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group"
               >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyber-cyan group-hover:text-black transition-colors">
                     <Plus size={32} />
                  </div>
                  <span className="font-bold text-gray-500 group-hover:text-white text-sm tracking-widest uppercase">Add Creator</span>
               </div>
            </div>
         )}
      </div>

      {/* 3. Detail Slide-Over Panel (Premium Glass) */}
      {selectedInf && (
         <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedInf(null)}></div>
            <div className="fixed inset-y-0 right-0 w-full md:w-[550px] bg-[#0c0c0c]/95 border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
               
               {/* Cover Image */}
               <div className="h-64 relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/20 via-transparent to-black"></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  
                  <button onClick={() => setSelectedInf(null)} className="absolute top-6 right-6 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-all z-20">
                     <X size={20} />
                  </button>

                  <div className="absolute bottom-6 left-8 flex items-end gap-6 z-10">
                     <div className="w-28 h-28 rounded-full border-4 border-black bg-[#151515] flex items-center justify-center text-5xl font-black text-white relative shadow-2xl overflow-hidden group">
                        {selectedInf.avatar}
                        <input 
                           className="absolute inset-0 opacity-0 cursor-pointer"
                           onChange={(e) => handleUpdate('avatar', e.target.value.substring(0,2).toUpperCase())}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold uppercase">Edit</div>
                     </div>
                     <div className="mb-2">
                        <input 
                           value={selectedInf.name}
                           onChange={e => handleUpdate('name', e.target.value)}
                           className="bg-transparent text-3xl font-black text-white outline-none w-full placeholder-gray-600 focus:placeholder-transparent"
                        />
                        <div className="flex items-center gap-2 mt-1">
                           <PlatformIcon p={selectedInf.platform} />
                           <input 
                              value={selectedInf.handle}
                              onChange={e => handleUpdate('handle', e.target.value)}
                              className="bg-transparent text-gray-400 font-mono text-sm outline-none focus:text-white"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Scrollable Body */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                   
                   {/* Pipeline Stage Selector */}
                   <div className="space-y-3">
                       <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <MapPin size={12} /> Pipeline Stage
                       </label>
                       <div className="grid grid-cols-5 gap-1 bg-white/5 p-1 rounded-xl">
                          {Object.keys(statusConfig).map(s => (
                              <button
                                 key={s}
                                 onClick={() => handleUpdate('status', s)}
                                 className={`h-10 rounded-lg flex items-center justify-center transition-all ${selectedInf.status === s ? `${statusConfig[s as PipelineStatus].bg} ${statusConfig[s as PipelineStatus].color} shadow-lg ring-1 ring-inset ring-white/10` : 'text-gray-600 hover:bg-white/5'}`}
                                 title={statusConfig[s as PipelineStatus].label}
                              >
                                 <div className={`w-2 h-2 rounded-full ${statusConfig[s as PipelineStatus].color.replace('text-', 'bg-')}`}></div>
                              </button>
                          ))}
                       </div>
                       <div className="text-center text-xs font-bold text-gray-400 tracking-wider uppercase">
                          {statusConfig[selectedInf.status].label}
                       </div>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 gap-4">
                       {[
                         { l: 'Followers', f: 'followers', t: 'text' },
                         { l: 'Avg. Views', f: 'avgViews', t: 'text' },
                         { l: 'Engagement %', f: 'engagementRate', t: 'number', c: 'text-cyber-yellow' },
                         { l: 'ROI (x)', f: 'roi', t: 'number', c: 'text-cyber-green' }
                       ].map((item, i) => (
                           <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-white/20 transition-colors">
                               <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">{item.l}</div>
                               <input 
                                  type={item.t}
                                  value={(selectedInf as any)[item.f]}
                                  onChange={e => handleUpdate(item.f, item.t === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                  className={`bg-transparent w-full text-2xl font-black outline-none font-mono ${item.c || 'text-white'}`}
                               />
                           </div>
                       ))}
                   </div>

                   {/* AI Radar */}
                   <div className="bg-black/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                       <div className="flex justify-between items-center mb-4">
                           <h3 className="text-sm font-bold text-white flex items-center gap-2">
                               <Zap size={16} className="text-cyber-purple"/> AI Talent Score
                           </h3>
                           <div className="px-2 py-1 bg-cyber-purple/10 text-cyber-purple text-[10px] font-bold rounded border border-cyber-purple/20">BETA</div>
                       </div>
                       <div className="h-[220px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                   { s: 'Engagement', A: selectedInf.stats.engagement, full: 100 },
                                   { s: 'Quality', A: selectedInf.stats.quality, full: 100 },
                                   { s: 'Relevance', A: selectedInf.stats.relevance, full: 100 },
                                   { s: 'Conversion', A: selectedInf.stats.conversion, full: 100 },
                                   { s: 'Loyalty', A: selectedInf.stats.loyalty, full: 100 },
                               ]}>
                                  <PolarGrid stroke="#333" strokeDasharray="3 3"/>
                                  <PolarAngleAxis dataKey="s" tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                  <Radar name="Talent" dataKey="A" stroke="#c026d3" strokeWidth={3} fill="#c026d3" fillOpacity={0.2} />
                                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff', fontSize: '12px' }}/>
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                   </div>
                   
                   {/* Logistics */}
                   <div className="border-t border-white/10 pt-6">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Logistics</h3>
                      <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                          <div className="p-3 bg-black rounded-lg text-cyber-cyan"><MapPin size={20} /></div>
                          <div className="flex-1">
                             <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tracking Number</div>
                             <input 
                               value={selectedInf.sampleTracking || ''}
                               onChange={e => handleUpdate('sampleTracking', e.target.value)}
                               placeholder="ENTER TRACKING ID..."
                               className="bg-transparent text-white font-mono w-full outline-none placeholder-gray-700"
                             />
                          </div>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="grid grid-cols-2 gap-4 pt-4">
                       <button className="py-4 rounded-xl bg-white text-black font-black uppercase tracking-wide hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                          <MessageCircle size={18} /> Contact
                       </button>
                       <button className="py-4 rounded-xl border border-white/20 text-white font-black uppercase tracking-wide hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                          <DollarSign size={18} /> Payout
                       </button>
                   </div>
               </div>
            </div>
         </>
      )}
    </div>
  );
};