import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Wrench, 
  MessageSquare, 
  CheckSquare, 
  Globe2, 
  RefreshCcw, 
  Package, 
  Users, 
  Wallet, 
  Settings, 
  Cpu, 
  ShieldCheck,
  Hexagon
} from 'lucide-react';
import { NavItem } from '../types';

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, active: true },
  { id: 'data', label: 'Data Deck', icon: Database },
  { id: 'workshop', label: 'Workshop', icon: Wrench },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'market', label: 'Market Radar', icon: Globe2 },
  { id: 'replenish', label: 'Smart Replenish', icon: RefreshCcw },
  { id: 'logistics', label: 'Logistics', icon: Package },
  { id: 'influencers', label: 'Influencers', icon: Users },
  { id: 'finance', label: 'Finance Hub', icon: Wallet },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-aero-bg border-r border-aero-border flex flex-col z-50">
      {/* Header / Logo */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Hexagon className="w-5 h-5 text-white fill-white/20" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-white">AERO<span className="text-aero-cyan">.OS</span></h1>
            <div className="flex items-center gap-2">
               <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[9px] text-gray-400 border border-gray-700">V.5.8 ULTIMATE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              item.active 
                ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-aero-cyan text-white' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-aero-panelHover'
            }`}
          >
            <item.icon 
              size={18} 
              className={item.active ? 'text-aero-cyan' : 'text-gray-500 group-hover:text-gray-300'} 
            />
            <span className={`text-sm font-medium ${item.active ? 'text-white' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-aero-border space-y-3 bg-aero-bg">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-white transition-colors">
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </button>

        {/* Gemini Core Status */}
        <div className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30">
          <div className="flex items-center gap-3">
             <div className="p-1.5 rounded-lg bg-purple-500/20">
                <Cpu size={16} className="text-purple-400" />
             </div>
             <div>
               <div className="text-xs font-bold text-purple-100">Gemini Core</div>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-[10px] text-purple-300">Neural Link Active</span>
               </div>
             </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-8 h-8 rounded-full bg-red-900/50 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">
            AD
          </div>
          <div className="flex-1">
             <div className="text-xs font-bold text-white">Super Admin</div>
             <div className="text-[10px] text-gray-500">L9 Access</div>
          </div>
        </div>
      </div>
    </aside>
  );
};