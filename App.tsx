import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FinanceModule } from './components/FinanceModule';
import { DataIntelligenceModule } from './components/DataIntelligenceModule';
import { InfluencerModule } from './components/InfluencerModule';
import { RestockModule } from './components/RestockModule';
import { TaskModule } from './components/TaskModule';
import { SettingsModule } from './components/SettingsModule'; 
import { ModulePlaceholder } from './components/ModulePlaceholder';
import { Sparkles, Command, CreditCard, Users } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('cyber');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('AERO_THEME');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('AERO_THEME', theme);
  }, [theme]);

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
      case 'replenish': return <RestockModule />;
      case 'tasks': return <TaskModule />;
      case 'finance': return <FinanceModule />;
      case 'settings': return <SettingsModule currentTheme={theme} onThemeChange={setTheme} />;
      default: return <ModulePlaceholder title={activeTab} />;
    }
  };

  const CommandPalette = () => {
    if (!isCommandOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsCommandOpen(false)}>
         <div 
           className="w-full max-w-xl bg-[#1c1c1e]/90 border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl transform transition-all"
           onClick={e => e.stopPropagation()}
         >
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
               <Command size={20} className="text-gray-400" />
               <input 
                 autoFocus
                 placeholder="输入指令或搜索..." 
                 className="flex-1 bg-transparent text-white outline-none text-lg placeholder:text-gray-500"
               />
               <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">ESC</span>
            </div>
            <div className="p-2">
               {[
                 { label: '记一笔账 (Record Transaction)', icon: CreditCard, action: () => setActiveTab('finance') },
                 { label: '录入达人 (Add Creator)', icon: Users, action: () => setActiveTab('influencers') },
               ].map((cmd, i) => (
                 <button 
                   key={i}
                   onClick={() => { cmd.action(); setIsCommandOpen(false); }}
                   className="w-full flex items-center gap-4 p-3 hover:bg-blue-600/20 hover:text-blue-400 rounded-xl transition-all text-left group"
                 >
                    <div className="text-gray-400 group-hover:text-blue-400"><cmd.icon size={18} /></div>
                    <span className="flex-1 text-gray-300 group-hover:text-white font-medium">{cmd.label}</span>
                 </button>
               ))}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen overflow-hidden text-cyber-text font-sans antialiased selection:bg-cyber-cyan/30">
      <Sidebar activeTab={activeTab} onNavigate={setActiveTab} />
      
      <CommandPalette />

      <main className="flex-1 ml-[260px] h-screen overflow-y-auto relative scroll-smooth px-4 pt-4">
        <div className="w-full max-w-[1800px] mx-auto h-full rounded-3xl bg-black/20 border border-white/5 backdrop-blur-xl shadow-2xl overflow-y-auto overflow-x-hidden custom-scrollbar relative">
           {renderContent()}
        </div>
        
        {/* Floating Action Button (Round) */}
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            onClick={() => setIsCommandOpen(true)}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 group"
          >
             <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform text-blue-600" />
          </button>
        </div>
      </main>
    </div>
  );
}