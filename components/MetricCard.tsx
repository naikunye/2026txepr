import React from 'react';
import { MetricData } from '../types';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  data: MetricData;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
  const chartData = data.data.map((val, i) => ({ i, val }));
  
  const getTrendColor = () => {
    if (data.trend === 'up') return 'text-aero-green';
    if (data.trend === 'down') return 'text-aero-red';
    return 'text-aero-cyan';
  };

  const TrendIcon = () => {
    if (data.trend === 'up') return <ArrowUpRight size={14} className="mr-1" />;
    if (data.trend === 'down') return <ArrowDownRight size={14} className="mr-1" />;
    return <Minus size={14} className="mr-1" />;
  };

  return (
    <div className="bg-aero-panel border border-aero-border rounded-2xl p-5 relative overflow-hidden hover:border-aero-border/80 transition-all duration-300 group">
      {/* Top Icon */}
      <div className="absolute top-5 right-5 p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 group-hover:border-gray-600 transition-colors">
        <data.icon size={16} className="text-gray-400" />
      </div>

      {/* Label */}
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {data.title}
      </div>

      {/* Value */}
      <div className="text-2xl font-bold text-white tracking-tight mb-4">
        {data.value}
      </div>

      {/* Bottom Area: Trend + Sparkline */}
      <div className="flex items-end justify-between h-10">
        <div className="mb-1">
          <div className={`flex items-center text-xs font-bold ${getTrendColor()} mb-0.5`}>
            <TrendIcon />
            {data.trendValue}
          </div>
          <div className="text-[10px] text-gray-600 font-medium">
            {data.subValue}
          </div>
        </div>

        {/* Mini Chart */}
        <div className="w-24 h-10">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
               <Line 
                 type="monotone" 
                 dataKey="val" 
                 stroke={data.chartColor} 
                 strokeWidth={2} 
                 dot={false}
                 isAnimationActive={false} 
               />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};