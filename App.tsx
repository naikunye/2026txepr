import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FinanceModule } from './components/FinanceModule';
import { LogisticsModule } from './components/LogisticsModule';
import { DataIntelligenceModule } from './components/DataIntelligenceModule';
import { InfluencerModule } from './components/InfluencerModule';
import { RestockModule } from './components/RestockModule';
import { TaskModule } from './components/TaskModule';
import { SettingsModule } from './components/SettingsModule'; // Import
import { ModulePlaceholder } from './components/ModulePlaceholder';
import { Sparkles, Command } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('cyber');

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

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'data':
        return <DataIntelligenceModule />;
      case 'influencers':
        return <InfluencerModule />;
      case 'logistics':
        return <LogisticsModule />;
      case 'replenish':
        return <RestockModule />;
      case 'tasks':
        return <TaskModule />;
      case 'finance':
        return <FinanceModule />;
      case 'settings':
        return <SettingsModule currentTheme={theme} onThemeChange={setTheme} />;
      default:
        return <ModulePlaceholder title={activeTab} />;
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-cyber-bg text-cyber-text font-sans transition-colors duration-500">
      <Sidebar activeTab={activeTab} onNavigate={setActiveTab} />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-[260px] h-screen overflow-y-auto relative scroll-smooth p-6 pr-8">
        
        {/* Top Decorative Line */}
        <div className="fixed top-0 left-[260px] right-0 h-[1px] bg-gradient-to-r from-cyber-cyan via-cyber-purple to-transparent opacity-30 z-40 pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto min-h-screen pb-20">
          {renderContent()}
        </div>
        
        {/* Floating AI Button (Cyberpunk Style) */}
        <div className="fixed bottom-8 right-8 z-50">
          <button className="w-16 h-16 bg-black border border-cyber-cyan/50 text-cyber-cyan flex items-center justify-center shadow-neon-cyan hover:scale-110 hover:bg-cyber-cyan hover:text-black transition-all duration-300 group clip-path-hexagon">
             <div className="absolute inset-0 bg-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <Sparkles className="w-7 h-7 z-10 animate-pulse" />
          </button>
        </div>
      </main>
    </div>
  );
}