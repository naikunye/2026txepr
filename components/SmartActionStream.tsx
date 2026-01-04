import React from 'react';
import { AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { PendingAction } from '../types';

export const SmartActionStream: React.FC = () => {
  const actions: PendingAction[] = [
    {
      id: '1',
      type: 'finance',
      title: 'Month-End Settlement',
      subtitle: '3 days until close period',
      urgent: true
    },
    {
      id: '2',
      type: 'inventory',
      title: 'Influencer Samples Dispatch',
      subtitle: '0 Influencers pending',
      urgent: false
    }
  ];

  return (
    <div className="mt-6 rounded-2xl overflow-hidden border border-aero-border bg-aero-panel relative group">
      {/* Top Gradient Border Line */}
      <div className="h-1 w-full bg-gradient-to-r from-aero-purple to-pink-600 shadow-[0_0_15px_rgba(189,0,255,0.5)]"></div>
      
      {/* Header */}
      <div className="px-6 py-3 border-b border-aero-border flex items-center justify-between bg-aero-panel">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-500/10">
            <AlertCircle size={16} className="text-aero-purple" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            Smart Action Stream
          </h3>
        </div>
        <div className="px-2 py-0.5 rounded border border-gray-700 bg-gray-900 text-[10px] text-gray-400 font-mono">
          0 Pending Actions
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-aero-border h-48">
        
        {/* Inventory Warnings (Empty State) */}
        <div className="p-6 flex flex-col items-center justify-center text-center">
           <div className="text-xs font-semibold text-gray-500 mb-4 w-full text-left">Inventory Alerts</div>
           <div className="flex-1 flex items-center justify-center">
             <span className="text-sm text-gray-600 italic">All SKU stock levels optimal</span>
           </div>
        </div>

        {/* Logistics Anomalies (Empty State) */}
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <div className="text-xs font-semibold text-gray-500 mb-4 w-full text-left">Logistics Anomalies</div>
          <div className="flex-1 flex items-center justify-center">
             <span className="text-sm text-gray-600 italic">Global shipping lanes operating normally</span>
           </div>
        </div>

        {/* Finance & Tasks (List) */}
        <div className="p-0 bg-aero-bg/30">
          <div className="p-3 border-b border-aero-border">
             <div className="text-xs font-semibold text-gray-500">Finance & Tasks</div>
          </div>
          <div className="overflow-y-auto h-36">
            {actions.map(action => (
              <div key={action.id} className="p-3 hover:bg-white/5 border-b border-aero-border/50 flex items-center justify-between transition-colors cursor-pointer group/item">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.type === 'finance' ? 'bg-purple-600' : 'bg-gray-600'}`}>
                     {/* Placeholder block as per screenshot */}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-200 group-hover/item:text-white transition-colors">{action.title}</div>
                    <div className="text-[10px] text-gray-500">{action.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 text-[10px] gap-1 group-hover/item:text-aero-cyan">
                   {action.urgent ? 'Process' : 'View'}
                   <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 1688 AI Floater Mockup (Bottom Right of section) */}
      <div className="absolute bottom-4 right-4 z-10 hidden md:block">
         {/* Could be a floating action button context */}
      </div>
    </div>
  );
};