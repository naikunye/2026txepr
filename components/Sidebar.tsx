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
    <aside className="fixed left-4 top-4 bottom-4 w-[260px] bg-cyber-panel backdrop-blur-3xl border border-white/10 flex flex-col z-50 rounded-3xl shadow-2xl overflow-hidden">
      {/* Brand Header */}
      <div className="p-8 pb-6 flex items-center gap-3">
         <div className="w-10 h-10 bg-gradient-to-br from-cyber-blue to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyber-blue/30">
           <Command size={20} />
         </div>
         <div>
           <h1 className="font-bold text-lg text-white tracking-tight leading-none">AERO<span className="opacity-50">.OS</span></h1>
           <span className="text-[10px] font-medium text-gray-400">Pro Max</span>
         </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        <div className="text-[10px] font-semibold text-gray-500 px-4 py-2 uppercase tracking-wide">
          功能模块
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-cyber-blue text-white shadow-lg shadow-cyber-blue/20 font-medium' 
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
              )}
              <item.icon 
                size={18} 
                className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} transition-colors relative z-10`}
              />
              <span className="text-sm relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile / Footer */}
      <div className="p-4 mt-auto">
        <button 
          onClick={() => onNavigate('settings')}
          className={`w-full bg-black/20 hover:bg-black/40 border border-white/5 p-3 rounded-2xl flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'ring-2 ring-cyber-blue' : ''}`}
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-full flex items-center justify-center text-white shadow-inner border border-white/10">
             <span className="text-xs font-bold">AD</span>
          </div>
          <div className="flex-1 text-left overflow-hidden">
             <div className="text-sm font-semibold text-white truncate">系统管理员</div>
             <div className="text-[10px] text-gray-400 truncate">System Config</div>
          </div>
          <Settings size={16} className="text-gray-500" />
        </button>
      </div>
    </aside>
  );
};
