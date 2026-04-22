'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  label: string;
}

interface EngagementBarChartProps {
  title?: string;
  subtitle?: string;
  data?: ChartData[];
  averageLabel?: string;
  averageValue?: string | number;
}

const defaultData: ChartData[] = [
  { name: '0', value: 7.5, label: 'Mon' },
  { name: '1', value: 8.5, label: 'Tue' },
  { name: '2', value: 7.0, label: 'Wed' },
  { name: '3', value: 8.5, label: 'Thu' },
];

export default function EngagementBarChart({ 
  title = "Activity Dynamics", 
  subtitle,
  data = defaultData,
  averageLabel = "Average Score",
  averageValue = "85"
}: EngagementBarChartProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#F3F4F6] shadow-card flex flex-col h-full hover:shadow-premium transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-[11px] font-black text-[#1A2B48] uppercase tracking-widest">{title}</h3>
        {subtitle && <p className="text-[9px] font-bold text-[#8A92A6] uppercase mt-1 tracking-wider">{subtitle}</p>}
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#8A92A6' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#8A92A6' }} 
              />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 6, 6]} 
                barSize={24}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 1 ? '#2563EB' : '#4F46E5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Custom Labels */}
          <div className="flex justify-between mt-6 px-2">
            {data.map((item, idx) => (
              <span key={idx} className="text-[9px] font-black text-[#8A92A6] uppercase tracking-tight w-1/4 text-center">
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Highlight Detail */}
        <div className="w-32 text-center pb-4 md:pb-8 md:border-l border-gray-100 md:pl-8 shrink-0">
            <p className="text-sm font-black text-[#1A2B48] leading-tight mb-1">{averageLabel}</p>
            <p className="text-4xl font-black text-[#1A2B48]">{averageValue}</p>
            <p className="text-[9px] font-black text-[#2563EB] uppercase tracking-widest mt-4">Growth Trend</p>
        </div>
      </div>
    </div>
  );
}
