import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div className="flex min-h-screen bg-aero-bg text-aero-text overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto h-screen relative">
        <div className="max-w-[1920px] mx-auto">
          <Dashboard />
        </div>
        
        {/* Floating AI Button (Bottom Right) */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:scale-110 transition-transform duration-200 group">
             <Sparkles className="text-white w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
}