import React from 'react';
import { MetricCard } from './MetricCard';
import { SmartActionStream } from './SmartActionStream';
import { 
  Wallet, 
  Layers, 
  Activity, 
  Truck, 
  MoreHorizontal, 
  Map, 
  Box, 
  Anchor, 
  Plane,
  Zap 
} from 'lucide-react';
import { MetricData } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Mock Data
const metrics: MetricData[] = [
  {
    id: '1',
    title: 'Net Profit (USD)',
    value: '$0',
    subValue: '0.0% Margin',
    trend: 'up',
    trendValue: '15.4%',
    chartColor: '#00FFA3', // Green
    icon: Wallet,
    data: [10, 25, 20, 35, 30, 45, 40]
  },
  {
    id: '2',
    title: 'Total Assets (USD)',
    value: '$34.6k',
    subValue: '0 Active SKU',
    trend: 'up',
    trendValue: '2.1%',
    chartColor: '#00F0FF', // Cyan
    icon: Layers,
    data: [40, 42, 41, 44, 43, 45, 46]
  },
  {
    id: '3',
    title: 'ROI',
    value: '0.00x',
    subValue: '0 Active Campaigns',
    trend: 'down',
    trendValue: '0.5%',
    chartColor: '#BD00FF', // Purple
    icon: Activity,
    data: [50, 45, 48, 40, 42, 35, 38]
  },
  {
    id: '4',
    title: 'Logistics',
    value: '0',
    subValue: '0 Anomalies',
    trend: 'neutral',
    trendValue: 'Stable',
    chartColor: '#00F0FF',
    icon: Truck,
    data: [30, 30, 31, 30, 30, 30, 30]
  }
];

// Main Chart Data (Revenue vs Expense)
const financialData = [
  { name: 'D-0', revenue: 0, expense: 100 },
  { name: 'D-1', revenue: 0, expense: 120 },
  { name: 'D-2', revenue: 0, expense: 110 },
  { name: 'D-3', revenue: 0, expense: 130 },
  { name: 'D-4', revenue: 0, expense: 125 },
  { name: 'D-5', revenue: 0, expense: 140 },
  { name: 'D-6', revenue: 0, expense: 150 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="px-2 py-1 rounded bg-aero-green text-aero-bg text-[10px] font-bold uppercase tracking-wider">
             AERO Core Online
           </div>
           <div className="text-xs text-gray-500 font-mono">2026/1/4 UTC+8</div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded font-bold text-xs hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          <Zap size={14} className="fill-black" />
          GENERATE BRIEF
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-2">
          Command Center <span className="text-lg font-light text-gray-600 uppercase tracking-widest">/ Main</span>
        </h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(metric => (
          <MetricCard key={metric.id} data={metric} />
        ))}
      </div>

      {/* Middle Section: Chart + Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[500px]">
        
        {/* Left: Financial Ecosystem Overview (2/3 width) */}
        <div className="xl:col-span-2 bg-aero-panel border border-aero-border rounded-2xl p-6 flex flex-col relative">
           
           {/* Chart Header */}
           <div className="flex items-start justify-between mb-6">
             <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-200">
                  <Activity size={16} className="text-blue-400" />
                  Financial Ecosystem
                </h3>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                  Revenue vs Expense / Net Cashflow
                </div>
             </div>
             
             {/* Toggle Controls */}
             <div className="flex bg-black/40 p-1 rounded-lg border border-gray-800">
                <button className="px-3 py-1 rounded-md bg-aero-cyan/20 text-aero-cyan text-xs font-medium flex items-center gap-1 border border-aero-cyan/30">
                  <Wallet size={12} /> Finance
                </button>
                <button className="px-3 py-1 rounded-md text-gray-500 text-xs font-medium flex items-center gap-1 hover:text-gray-300">
                  <Map size={12} /> Map
                </button>
             </div>
           </div>

           {/* Chart Area */}
           <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2C3C" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748B" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#11121C', borderColor: '#2A2C3C', color: '#fff' }}
                    itemStyle={{ color: '#00F0FF' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#00F0FF" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  {/* Subtle green line for "Expense" baseline or projection */}
                   <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#00FFA3" 
                    strokeWidth={2}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Right: Stacked Widgets (1/3 width) */}
        <div className="flex flex-col gap-6">
          
          {/* Top Widget: Inventory Health */}
          <div className="flex-1 bg-aero-panel border border-aero-border rounded-2xl p-5 flex flex-col justify-between">
             <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-200">
                  <Box size={16} className="text-yellow-500" />
                  Inventory Health
                </h3>
                <Box size={32} className="text-gray-800" strokeWidth={1} />
             </div>

             <div className="space-y-6">
                <div>
                   <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-500">Low Stock SKU</span>
                      <span className="text-white">0 Items</span>
                   </div>
                   <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-0"></div>
                   </div>
                </div>

                <div>
                   <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-500">Turnover Rate</span>
                      <span className="text-aero-cyan font-bold">Healthy</span>
                   </div>
                   <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-aero-cyan w-[75%] shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Bottom Widget: Logistics Efficiency */}
          <div className="flex-1 bg-aero-panel border border-aero-border rounded-2xl p-5 flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-200">
                  <Plane size={16} className="text-blue-400" />
                  Logistics Efficiency
                </h3>
                <Anchor size={32} className="text-gray-800" strokeWidth={1} />
             </div>

             <div className="mb-4">
               <button className="text-[10px] px-2 py-1 border border-gray-600 rounded text-gray-400 hover:text-white transition-colors">
                 Switch to Map View
               </button>
             </div>

             <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                   <div className="text-[10px] text-gray-500 mb-1">Sea Freight</div>
                   <div className="text-xl font-bold text-white">0 <span className="text-[10px] font-normal text-gray-600">Orders</span></div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                   <div className="text-[10px] text-gray-500 mb-1">Air Freight</div>
                   <div className="text-xl font-bold text-white">0 <span className="text-[10px] font-normal text-gray-600">Orders</span></div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Bottom Full Width: Smart Action Stream */}
      <SmartActionStream />

    </div>
  );
};