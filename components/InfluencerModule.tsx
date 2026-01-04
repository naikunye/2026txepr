import React, { useState } from 'react';
import { Search, Plus, MessageCircle, Send, Globe, Instagram, Youtube, UserPlus, Star } from 'lucide-react';

interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube';
  followers: string;
  roi: string;
  status: '新发现' | '已联系' | '合作中';
  color: string;
}

export const InfluencerModule: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([
     { id: '1', name: 'Natalie U.', handle: '@nat.daily', platform: 'Instagram', followers: '450K', roi: '3.2x', status: '已联系', color: 'text-cyber-pink border-cyber-pink' },
     { id: '2', name: 'Tech Marco', handle: '@marcot', platform: 'YouTube', followers: '1.2M', roi: '5.5x', status: '合作中', color: 'text-cyber-green border-cyber-green' },
     { id: '3', name: 'Sarah Styles', handle: '@sstyle', platform: 'TikTok', followers: '890K', roi: '2.1x', status: '新发现', color: 'text-cyber-cyan border-cyber-cyan' }
  ]);
  const [newInf, setNewInf] = useState({ name: '', handle: '', platform: 'Instagram' });

  const handleAdd = () => {
     if (!newInf.name) return;
     setInfluencers([...influencers, { 
        id: Date.now().toString(),
        name: newInf.name,
        handle: newInf.handle,
        platform: newInf.platform as any,
        followers: '0', 
        roi: '0.0x', 
        status: '新发现',
        color: 'text-cyber-cyan border-cyber-cyan'
     }]);
     setIsAdding(false);
     setNewInf({ name: '', handle: '', platform: 'Instagram' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Add Modal */}
      {isAdding && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
            <div className="bg-cyber-panel border border-cyber-cyan w-full max-w-sm p-6 shadow-neon-cyan relative z-10">
               <h3 className="text-xl font-bold text-white mb-6 font-mono border-b border-gray-800 pb-2">录入新达人</h3>
               <div className="space-y-4">
                  <input className="w-full p-3 bg-black border border-gray-700 text-white focus:border-cyber-cyan outline-none font-mono" placeholder="名称" value={newInf.name} onChange={e => setNewInf({...newInf, name: e.target.value})} />
                  <input className="w-full p-3 bg-black border border-gray-700 text-white focus:border-cyber-cyan outline-none font-mono" placeholder="@账号ID" value={newInf.handle} onChange={e => setNewInf({...newInf, handle: e.target.value})} />
                  <select className="w-full p-3 bg-black border border-gray-700 text-white focus:border-cyber-cyan outline-none font-mono" value={newInf.platform} onChange={e => setNewInf({...newInf, platform: e.target.value})}>
                     <option>Instagram</option>
                     <option>TikTok</option>
                     <option>YouTube</option>
                  </select>
                  <button onClick={handleAdd} className="w-full bg-cyber-cyan text-black font-bold py-3 hover:bg-white transition-colors uppercase tracking-wider">保存档案</button>
               </div>
            </div>
         </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-2 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-white tracking-wider">达人矩阵</h1>
            <p className="text-gray-400 font-mono mt-1 text-xs">GLOBAL INFLUENCER NETWORK</p>
         </div>
         <div className="flex gap-4">
             <div className="bg-black border border-cyber-green/50 px-4 py-2 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                <div className="text-[10px] text-cyber-green font-mono uppercase">总触达人数</div>
                <div className="text-lg font-bold text-white">2.5M+</div>
             </div>
             <button onClick={() => setIsAdding(true)} className="bg-cyber-cyan text-black px-5 py-2 font-bold hover:bg-white transition-colors flex items-center gap-2 clip-path-polygon">
               <Plus size={18} /> 新增
             </button>
         </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-cyan" size={18} />
         <input 
           placeholder="搜索达人数据库..." 
           className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/20 text-white outline-none focus:border-cyber-cyan focus:shadow-neon-cyan transition-all font-mono text-sm"
         />
      </div>

      {/* Grid of Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {influencers.map((inf) => (
            <div key={inf.id} className="bg-cyber-panel/50 border border-white/10 p-6 hover:border-cyber-cyan transition-all duration-300 group cursor-pointer relative overflow-hidden">
               
               {/* Holographic BG */}
               <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyber-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

               {/* Status Badge */}
               <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-[10px] font-bold font-mono uppercase border ${
                     inf.status === '合作中' ? 'border-cyber-green text-cyber-green bg-cyber-green/10' : 
                     inf.status === '已联系' ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10' : 'border-gray-500 text-gray-500'
                  }`}>
                     {inf.status}
                  </span>
               </div>

               <div className="flex items-center gap-5 mb-6 relative z-10">
                  <div className={`w-16 h-16 border-2 ${inf.color} flex items-center justify-center bg-black text-2xl font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                     {inf.name.charAt(0)}
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-cyber-cyan transition-colors">{inf.name}</h3>
                     <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-1">
                        <Globe size={12} /> {inf.platform}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                  <div className="bg-black/40 p-2 text-center border border-white/5">
                     <div className="text-[10px] text-gray-500 font-mono uppercase">粉丝数</div>
                     <div className="text-sm font-bold text-white">{inf.followers}</div>
                  </div>
                  <div className="bg-black/40 p-2 text-center border border-white/5">
                     <div className="text-[10px] text-gray-500 font-mono uppercase">ROI 投产</div>
                     <div className="text-sm font-bold text-cyber-green">{inf.roi}</div>
                  </div>
               </div>

               <div className="flex gap-2 relative z-10">
                  <button className="flex-1 py-2 bg-white/5 border border-white/20 text-white text-xs font-bold hover:bg-cyber-cyan hover:text-black hover:border-cyber-cyan transition-colors flex items-center justify-center gap-2">
                     <MessageCircle size={14} /> 沟通
                  </button>
                  <button className="flex-1 py-2 bg-white/5 border border-white/20 text-white text-xs font-bold hover:bg-cyber-pink hover:text-black hover:border-cyber-pink transition-colors flex items-center justify-center gap-2">
                     <Send size={14} /> 寄样
                  </button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};