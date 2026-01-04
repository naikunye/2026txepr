import React, { useState } from 'react';
import { Truck, Ship, Plane, Search, Plus, MapPin, Calendar, ArrowRight, Box } from 'lucide-react';

interface Shipment {
  id: string;
  origin: string;
  dest: string;
  status: '待处理' | '运输中' | '清关中' | '已送达';
  carrier: string;
  mode: 'air' | 'sea' | 'truck';
  eta: string;
  progress: number;
}

const initialShipments: Shipment[] = [
  { id: 'TRK-9901', origin: '深圳 Shenzhen', dest: '洛杉矶 LA', status: '运输中', carrier: 'DHL Air', mode: 'air', eta: '1月12日', progress: 65 },
  { id: 'TRK-9902', origin: '宁波 Ningbo', dest: '汉堡 Hamburg', status: '清关中', carrier: 'Maersk', mode: 'sea', eta: '1月28日', progress: 85 },
  { id: 'TRK-9903', origin: '义乌 YiWu', dest: '迪拜 Dubai', status: '待处理', carrier: 'FedEx', mode: 'air', eta: '待定', progress: 10 },
];

export const LogisticsModule: React.FC = () => {
  const [shipments] = useState<Shipment[]>(initialShipments);

  const ModeIcon = ({ mode }: { mode: string }) => {
    if(mode === 'air') return <Plane size={16} />;
    if(mode === 'sea') return <Ship size={16} />;
    return <Truck size={16} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-2 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-black text-white tracking-wider">物流追踪</h1>
           <p className="text-gray-400 font-mono text-xs mt-1">GLOBAL LOGISTICS TRACKING</p>
        </div>
        <button className="bg-black border border-cyber-cyan text-cyber-cyan px-5 py-2 text-sm font-bold shadow-neon-cyan hover:bg-cyber-cyan hover:text-black transition-all flex items-center gap-2">
           <Plus size={16} /> 新建运单
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Left Col: Shipment Cards */}
         <div className="space-y-4">
            {shipments.map((ship) => (
               <div key={ship.id} className="bg-black/40 border border-white/10 p-6 hover:border-cyber-cyan transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-800 group-hover:bg-cyber-cyan transition-colors"></div>
                  
                  <div className="flex justify-between items-center mb-4 pl-2">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-gray-600 bg-black flex items-center justify-center text-gray-400 group-hover:text-cyber-cyan group-hover:border-cyber-cyan transition-colors">
                           <ModeIcon mode={ship.mode} />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-white font-mono tracking-wider">{ship.id}</div>
                           <div className="text-xs text-gray-500">{ship.carrier}</div>
                        </div>
                     </div>
                     <span className={`px-2 py-1 text-[10px] font-mono border ${
                        ship.status === '运输中' ? 'border-cyber-cyan text-cyber-cyan' :
                        ship.status === '清关中' ? 'border-cyber-yellow text-cyber-yellow' : 'border-gray-600 text-gray-500'
                     }`}>
                        {ship.status}
                     </span>
                  </div>

                  {/* Route Visual */}
                  <div className="flex items-center justify-between text-sm font-bold text-gray-300 mb-4 px-2 font-mono">
                     <span>{ship.origin}</span>
                     <div className="flex-1 mx-4 h-[1px] bg-gray-700 relative flex items-center justify-center">
                        <ArrowRight size={14} className="text-gray-500" />
                     </div>
                     <span>{ship.dest}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-gray-800 mb-4">
                     <div className="h-full bg-cyber-cyan shadow-[0_0_10px_#00F0FF]" style={{width: `${ship.progress}%`}}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 border-t border-white/5 pt-3 pl-2">
                     <div className="flex items-center gap-2 font-mono"><Calendar size={12} /> 预计: {ship.eta}</div>
                     <div className="flex items-center gap-2 group-hover:text-cyber-cyan transition-colors"><MapPin size={12} /> 实时定位</div>
                  </div>
               </div>
            ))}
         </div>

         {/* Right Col: Map Placeholder (Cyberpunk Map) */}
         <div className="hidden lg:block tech-border h-[600px] relative overflow-hidden">
             {/* Grid Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
             
             {/* Map Image (Inverted/Dark) */}
             <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-10 bg-center invert"></div>
             
             {/* Animated Markers */}
             <div className="absolute top-1/3 left-1/4 w-4 h-4 border-2 border-cyber-cyan rounded-full shadow-[0_0_10px_#00F0FF] animate-ping"></div>
             <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-cyber-cyan rounded-full"></div>
             
             <div className="absolute top-1/2 left-[15%] w-3 h-3 bg-cyber-pink rounded-full shadow-[0_0_10px_#FF003C]"></div>
             
             {/* Connecting Line (SVG) */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_5px_#00F0FF]">
                <path d="M 180 200 Q 250 150, 400 250" stroke="#00F0FF" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />
             </svg>

             <div className="absolute bottom-6 left-6 right-6 bg-black/80 border border-cyber-cyan/30 p-4 backdrop-blur-md">
                <h4 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
                   <Box size={14} className="text-cyber-cyan" /> 监控终端
                </h4>
                <p className="text-xs text-gray-400 font-mono">3 条活跃航线正在追踪中...</p>
             </div>
         </div>
      </div>
    </div>
  );
};