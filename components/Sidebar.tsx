import React from 'react';
import { 
  LayoutGrid, 
  BarChart3, 
  Users, 
  CreditCard, 
  PackageSearch, 
  Layers, 
  ListTodo, 
  Settings, 
  Command,
  Cpu
} from 'lucide-react';
import { NavItem } from '../types';

interface SidebarProps {
  activeTab: string;
  onNavigate: (id: string) => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '指挥中心', icon: LayoutGrid },
  { id: 'data', label: '数据智脑', icon: BarChart3 },
  { id: 'influencers', label: '达人矩阵', icon: Users },
  { id: 'finance', label: '财务核算', icon: CreditCard },
  { id: 'logistics', label: '物流追踪', icon: PackageSearch },
  { id: 'replenish', label: '智能备货', icon: Layers },
  { id: 'tasks', label: '任务协同', icon: ListTodo },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  return (
    <aside className="fixed left-4 top-4 bottom-4 w-[260px] bg-cyber-panel/40 backdrop-blur-2xl border border-white/10 flex flex-col z-50 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:bg-cyber-panel/60">
      {/* Brand Header */}
      <div className="p-8 pb-6 flex items-center gap-4">
         <div className="relative group">
            <div className="absolute inset-0 bg-cyber-blue blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-gradient-to-b from-[#2c2c2e] to-[#1c1c1e] border border-white/10 rounded-xl flex items-center justify-center text-white shadow-xl">
               <Command size={18} />
            </div>
         </div>
         <div>
           <h1 className="font-bold text-lg text-white tracking-tight leading-none flex items-center gap-1">
             AERO<span className="opacity-40 text-sm">.OS</span>
           </h1>
           <span className="text-[9px] font-medium text-cyber-blue uppercase tracking-widest bg-cyber-blue/10 px-1.5 py-0.5 rounded border border-cyber-blue/20">Pro Max</span>
         </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar py-2">
        <div className="text-[10px] font-bold text-gray-500 px-4 py-2 uppercase tracking-widest opacity-70">
          Modules
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/10 text-white shadow-glass backdrop-blur-md border border-white/10' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyber-blue shadow-[0_0_10px_#0A84FF]"></div>
              )}
              <item.icon 
                size={18} 
                className={`${isActive ? 'text-cyber-blue drop-shadow-[0_0_5px_rgba(10,132,255,0.5)]' : 'text-gray-500 group-hover:text-white'} transition-all relative z-10`}
              />
              <span className={`text-sm relative z-10 font-medium ${isActive ? 'tracking-wide' : ''}`}>{item.label}</span>
              
              {isActive && (
                 <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyber-blue shadow-[0_0_5px_#0A84FF]"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile / Footer */}
      <div className="p-4 mt-auto">
        <button 
          onClick={() => onNavigate('settings')}
          className={`w-full bg-white/5 hover:bg-white/10 border border-white/5 p-3 rounded-2xl flex items-center gap-3 transition-all group backdrop-blur-md ${activeTab === 'settings' ? 'ring-1 ring-cyber-blue shadow-glow-blue' : ''}`}
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-full flex items-center justify-center text-white shadow-inner border border-white/10 group-hover:scale-105 transition-transform">
             <span className="text-xs font-bold font-mono">AD</span>
          </div>
          <div className="flex-1 text-left overflow-hidden">
             <div className="text-sm font-semibold text-white truncate">系统管理员</div>
             <div className="text-[10px] text-gray-400 truncate group-hover:text-cyber-blue transition-colors">配置中心</div>
          </div>
          <Settings size={16} className="text-gray-500 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </aside>
  );
};