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
  Hexagon,
  Cpu
} from 'lucide-react';
import { NavItem } from '../types';

interface SidebarProps {
  activeTab: string;
  onNavigate: (id: string) => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '全域概览', icon: LayoutGrid },
  { id: 'data', label: '数据智脑', icon: BarChart3 },
  // Market module removed
  { id: 'influencers', label: '达人矩阵', icon: Users },
  { id: 'finance', label: '资金账户', icon: CreditCard },
  { id: 'logistics', label: '物流追踪', icon: PackageSearch },
  { id: 'replenish', label: '智能备货', icon: Layers },
  { id: 'tasks', label: '任务看板', icon: ListTodo },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-cyber-panel/90 backdrop-blur-xl border-r border-cyber-border flex flex-col z-50">
      {/* Brand Header */}
      <div className="p-8 pb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-cyan/10 blur-3xl"></div>
        <div className="flex items-center gap-3 mb-1">
           <div className="w-10 h-10 border border-cyber-cyan bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan shadow-neon-cyan relative">
             <div className="absolute inset-0 bg-cyber-cyan opacity-20 animate-pulse"></div>
             <Hexagon size={24} />
           </div>
           <div>
             <h1 className="font-black text-xl tracking-wider text-white italic">AERO<span className="text-cyber-cyan">.OS</span></h1>
             <span className="text-[10px] font-mono text-cyber-cyan tracking-widest opacity-80">SYSTEM_ONLINE</span>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar mt-4">
        <div className="text-[10px] font-mono text-gray-500 px-4 py-2 uppercase tracking-widest border-b border-gray-800 mb-2">
          // Modules
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 border-l-2 transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan shadow-[inset_10px_0_20px_-10px_rgba(0,240,255,0.3)]' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon 
                size={18} 
                className={`transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]' : ''}`}
              />
              <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              
              {/* Active glow decoration */}
              {isActive && <div className="absolute right-2 w-1.5 h-1.5 bg-cyber-cyan shadow-neon-cyan rounded-full animate-pulse"></div>}
            </button>
          );
        })}
      </nav>

      {/* User Profile / Footer */}
      <div className="p-4 border-t border-cyber-border bg-black/40">
        <div className="bg-cyber-panel border border-cyber-border p-3 flex items-center gap-3 relative hover:border-cyber-cyan/50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-gray-800 flex items-center justify-center border border-gray-600 group-hover:border-cyber-cyan overflow-hidden relative">
             <Cpu className="text-gray-400 group-hover:text-cyber-cyan z-10" size={20} />
             <div className="absolute inset-0 bg-cyber-cyan/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </div>
          <div className="flex-1 text-left">
             <div className="text-sm font-bold text-white tracking-wide">管理员</div>
             <div className="text-[10px] text-cyber-cyan font-mono">LEVEL_99_ACCESS</div>
          </div>
          <Settings size={16} className="text-gray-500 group-hover:text-cyber-cyan group-hover:rotate-90 transition-all duration-500" />
        </div>
      </div>
    </aside>
  );
};