import React from 'react';
import { Construction, Bell, Lock } from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
       
       <div className="relative w-full max-w-2xl bg-black border border-white/10 p-12 text-center relative overflow-hidden">
          {/* Tech Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan"></div>

          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyber-cyan/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="w-24 h-24 border border-gray-700 bg-black flex items-center justify-center mx-auto mb-8 relative z-10 shadow-lg">
             <Lock size={48} className="text-cyber-cyan" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl font-black text-white mb-2 tracking-widest uppercase text-glow">
            {title} // 模块锁定
          </h2>
          
          <p className="text-gray-400 font-mono text-sm max-w-md mx-auto mb-8 leading-relaxed">
            SYSTEM_ERROR: ACCESS_DENIED.<br/>
            该模块正在进行神经元网络升级，请稍后访问。
          </p>

          <button className="px-8 py-3 bg-cyber-cyan text-black font-bold uppercase tracking-wider hover:bg-white hover:shadow-neon-cyan transition-all flex items-center gap-2 mx-auto">
             <Bell size={18} /> 订阅上线通知
          </button>
       </div>

    </div>
  );
};