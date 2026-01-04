import React from 'react';
import { AlertCircle, ChevronRight, CheckCircle2, Factory, Clock, ArrowRight } from 'lucide-react';
import { PendingAction } from '../types';

export const SmartActionStream: React.FC = () => {
  const actions: PendingAction[] = [
    {
      id: '1',
      type: 'finance',
      title: 'Monthly Financial Closing',
      subtitle: '3 Days Remaining',
      urgent: true
    },
    {
      id: '2',
      type: 'inventory',
      title: 'KOL Sample Request (24pcs)',
      subtitle: 'Marketing - Li Na',
      urgent: false
    },
    {
      id: '3',
      type: 'finance',
      title: 'Supplier Payment: Shenzhen Electronics',
      subtitle: '¥450,000',
      urgent: true
    }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-tiktok">
      <div className="flex items-center justify-between mb-6">
         <h3 className="font-bold text-tiktok-dark text-lg flex items-center gap-2">
           <span className="w-2 h-6 bg-tiktok-red rounded-full"></span>
           Smart Action Stream
         </h3>
         <button className="text-xs font-bold text-tiktok-red hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
           View All (3)
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Card 1: Alert */}
         <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm mb-3">
               <AlertCircle size={16} /> Supply Chain Alert
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-red-100">
                  <span className="text-xs font-semibold text-gray-800">Raw Material Shortage</span>
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Critical</span>
               </div>
               <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-red-100">
                  <span className="text-xs font-semibold text-gray-800">Yield Rate Drop</span>
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">Warning</span>
               </div>
            </div>
         </div>

         {/* Card 2: Logistics */}
         <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-3">
               <Clock size={16} /> Logistics Delay
            </div>
            <div className="flex-1 flex flex-col justify-center">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-gray-400 border border-blue-100">US</div>
                  <div className="flex-1">
                     <div className="text-sm font-bold text-gray-800">LA Port Congestion</div>
                     <div className="text-xs text-gray-500">Est. +4 Days</div>
                  </div>
               </div>
               <div className="w-full bg-white h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="w-2/3 h-full bg-blue-500 rounded-full"></div>
               </div>
               <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <CheckCircle2 size={12} /> Other routes normal
               </div>
            </div>
         </div>

         {/* Card 3: Tasks List */}
         <div className="border border-gray-100 rounded-2xl p-0 overflow-hidden">
            {actions.map((action, i) => (
               <div key={action.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${i !== actions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${action.type === 'finance' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                        {action.type === 'finance' ? '¥' : '📦'}
                     </div>
                     <div>
                        <div className="text-sm font-bold text-gray-900">{action.title}</div>
                        <div className="text-xs text-gray-500">{action.subtitle}</div>
                     </div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:border-tiktok-cyan hover:text-tiktok-cyan transition-colors">
                     <ArrowRight size={14} />
                  </button>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};