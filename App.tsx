
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FinanceModule } from './components/FinanceModule';
import { DataIntelligenceModule } from './components/DataIntelligenceModule';
import { InfluencerModule } from './components/InfluencerModule';
import { RestockModule } from './components/RestockModule';
import { TaskModule } from './components/TaskModule';
import { SettingsModule } from './components/SettingsModule'; 
import { ToolsModule } from './components/ToolsModule';
import { ModulePlaceholder } from './components/ModulePlaceholder';
import { Sparkles, Command, CreditCard, Users, RefreshCw, CheckCircle2, CloudLightning } from 'lucide-react';
import { pb, SYNC_KEYS } from './lib/pb';
import { SYNC_START_EVENT, SYNC_SUCCESS_EVENT, SYNC_ERROR_EVENT } from './hooks/usePersistence';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('cyber');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  
  // Real-time Sync Status State
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const savedTheme = localStorage.getItem('AERO_THEME');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('AERO_THEME', theme);
  }, [theme]);

  // --- Real-Time Sync Listeners ---
  useEffect(() => {
    let successTimer: any;

    const handleSyncStart = () => {
        setSyncStatus('syncing');
        if (successTimer) clearTimeout(successTimer);
    };

    const handleSyncSuccess = () => {
        setSyncStatus('success');
        // Show success state for 2 seconds, then go back to idle
        successTimer = setTimeout(() => {
            setSyncStatus('idle');
        }, 2000);
    };

    const handleSyncError = () => {
        setSyncStatus('error');
        successTimer = setTimeout(() => {
            setSyncStatus('idle');
        }, 3000);
    };

    window.addEventListener(SYNC_START_EVENT, handleSyncStart);
    window.addEventListener(SYNC_SUCCESS_EVENT, handleSyncSuccess);
    window.addEventListener(SYNC_ERROR_EVENT, handleSyncError);

    return () => {
        window.removeEventListener(SYNC_START_EVENT, handleSyncStart);
        window.removeEventListener(SYNC_SUCCESS_EVENT, handleSyncSuccess);
        window.removeEventListener(SYNC_ERROR_EVENT, handleSyncError);
        if (successTimer) clearTimeout(successTimer);
    };
  }, []);

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
      case 'tools': return <ToolsModule />;
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
        
        {/* Real-Time Sync Indicator Toast */}
        {syncStatus !== 'idle' && (
            <div className={`fixed top-6 right-6 z-[60] backdrop-blur-xl border px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ${
                syncStatus === 'syncing' ? 'bg-black/80 border-cyber-blue/30 text-cyber-blue' :
                syncStatus === 'success' ? 'bg-green-900/80 border-green-500/30 text-green-400' :
                'bg-red-900/80 border-red-500/30 text-red-400'
            }`}>
                {syncStatus === 'syncing' && <RefreshCw size={12} className="animate-spin" />}
                {syncStatus === 'success' && <CheckCircle2 size={14} />}
                {syncStatus === 'error' && <CloudLightning size={14} />}
                
                {syncStatus === 'syncing' && "正在实时同步..."}
                {syncStatus === 'success' && "已同步到云端"}
                {syncStatus === 'error' && "同步失败 (离线)"}
            </div>
        )}

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
