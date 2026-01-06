import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FinanceModule } from './components/FinanceModule';
import { LogisticsModule } from './components/LogisticsModule';
import { DataIntelligenceModule } from './components/DataIntelligenceModule';
import { InfluencerModule } from './components/InfluencerModule';
import { RestockModule } from './components/RestockModule';
import { TaskModule } from './components/TaskModule';
import { SettingsModule } from './components/SettingsModule'; 
import { UniversalDataModule } from './components/UniversalDataModule'; // Import
import { ModulePlaceholder } from './components/ModulePlaceholder';
import { Sparkles, Command, Search, ArrowRight, CreditCard, Package, Users, Settings, HardDrive } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('cyber');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Load theme from localStorage on boot
  useEffect(() => {
    const savedTheme = localStorage.getItem('AERO_THEME');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to document body/root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('AERO_THEME', theme);
  }, [theme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsCommandOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'data': return <DataIntelligenceModule />;
      case 'influencers': return <InfluencerModule />;
      case 'logistics': return <LogisticsModule />;
      case 'replenish': return <RestockModule />;
      case 'tasks': return <TaskModule />;
      case 'finance': return <FinanceModule />;
      case 'files': return <UniversalDataModule />; // Added route
      case 'settings': return <SettingsModule currentTheme={theme} onThemeChange={setTheme} />;
      default: return <ModulePlaceholder title={activeTab} />;
    }
  };

  // --- Command Palette Component ---
  const CommandPalette = () => {
    if (!isCommandOpen) return null;
    const commands = [
      { id: 'nav-finance', label: '记一笔账 (Record Transaction)', icon: CreditCard, action: () => setActiveTab('finance') },
      { id: 'nav-logistics', label: '查询物流 (Track Shipment)', icon: Package, action: () => setActiveTab('logistics') },
      { id: 'nav-influencer', label: '添加达人 (Add Influencer)', icon: Users, action: () => setActiveTab('influencers') },
      { id: 'nav-files', label: '打开文档库 (Data Vault)', icon: HardDrive, action: () => setActiveTab('files') },
      { id: 'nav-settings', label: '系统设置 (Settings)', icon: Settings, action: () => setActiveTab('settings') },
    ];

    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsCommandOpen(false)}>
         <div 
           className="w-full max-w-xl bg-[#0c0c0c] border border-cyber-cyan/50 shadow-[0_0_50px_rgba(0,240,255,0.2)] rounded-lg overflow-hidden flex flex-col"
           onClick={e => e.stopPropagation()}
         >
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
               <Command size={20} className="text-cyber-cyan" />
               <input 
                 autoFocus
                 placeholder="输入指令或跳转..." 
                 className="flex-1 bg-transparent text-white outline-none font-mono text-lg placeholder:text-gray-600"
               />
               <span className="text-xs text-gray-500 border border-gray-700 px-2 py-1 rounded">ESC</span>
            </div>
            <div className="p-2">
               <div className="text-[10px] text-gray-500 font-mono uppercase px-3 py-2">Quick Actions</div>
               {commands.map((cmd, i) => (
                 <button 
                   key={cmd.id}
                   onClick={() => { cmd.action(); setIsCommandOpen(false); }}
                   className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded transition-colors text-left group"
                 >
                    <div className="text-gray-400 group-hover:text-cyber-cyan"><cmd.icon size={18} /></div>
                    <span className="flex-1 text-gray-300 group-hover:text-white font-mono text-sm">{cmd.label}</span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-cyber-cyan -translate-x-2 group-hover:translate-x-0 transition-all" />
                 </button>
               ))}
            </div>
            <div className="p-3 bg-black border-t border-white/10 text-center text-[10px] text-gray-600 font-mono">
               AERO.OS COMMAND LINE // v3.1.0
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-cyber-bg text-cyber-text font-sans transition-colors duration-500">
      <Sidebar activeTab={activeTab} onNavigate={setActiveTab} />
      
      {/* Command Palette Overlay */}
      <CommandPalette />

      {/* Main Content Area - REMOVED Global Padding (p-6 pr-8) to allow true sticky headers */}
      <main className="flex-1 ml-[260px] h-screen overflow-y-auto relative scroll-smooth">
        
        {/* Top Decorative Line */}
        <div className="fixed top-0 left-[260px] right-0 h-[1px] bg-gradient-to-r from-cyber-cyan via-cyber-purple to-transparent opacity-30 z-40 pointer-events-none"></div>

        <div className="w-full max-w-[1800px] mx-auto min-h-screen">
          {renderContent()}
        </div>
        
        {/* Floating Action Button (Triggers Command Palette) */}
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            onClick={() => setIsCommandOpen(true)}
            className="w-16 h-16 bg-black border border-cyber-cyan/50 text-cyber-cyan flex items-center justify-center shadow-neon-cyan hover:scale-110 hover:bg-cyber-cyan hover:text-black transition-all duration-300 group clip-path-hexagon relative"
            title="Open Command Palette (Cmd+K)"
          >
             <div className="absolute inset-0 bg-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <Sparkles className="w-7 h-7 z-10 animate-pulse" />
          </button>
        </div>
      </main>
    </div>
  );
}
