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
    if (data.trend === 'up') return 'text-green-500';
    if (data.trend === 'down') return 'text-tiktok-red';
    return 'text-gray-500';
  };

  const TrendIcon = () => {
    if (data.trend === 'up') return <ArrowUpRight size={16} className="mr-1" />;
    if (data.trend === 'down') return <ArrowDownRight size={16} className="mr-1" />;
    return <Minus size={16} className="mr-1" />;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-tiktok hover:shadow-tiktok-hover transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl bg-gray-50 text-tiktok-dark">
          <data.icon size={20} strokeWidth={1.5} />
        </div>
        <div className={`flex items-center text-sm font-bold ${getTrendColor()} bg-gray-50 px-2 py-1 rounded-full`}>
            <TrendIcon />
            {data.trendValue}
        </div>
      </div>

      <div className="text-xs font-medium text-tiktok-gray uppercase tracking-wide mb-1">
        {data.title}
      </div>

      <div className="flex items-end justify-between">
        <div>
           <div className="text-3xl font-extrabold text-tiktok-dark tracking-tight leading-none mb-1">
             {data.value}
           </div>
           <div className="text-xs text-gray-400">
             {data.subValue}
           </div>
        </div>

        <div className="w-24 h-10 opacity-50">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
               <Line 
                 type="monotone" 
                 dataKey="val" 
                 stroke={data.chartColor} 
                 strokeWidth={3} 
                 dot={false}
                 isAnimationActive={true} 
               />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};