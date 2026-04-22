'use client';

import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ComplianceSummaryProps {
  percentage: number;
  policyUpdates: number;
  complianceIssues: number;
}

export default function ComplianceSummary({ percentage, policyUpdates, complianceIssues }: ComplianceSummaryProps) {
  const data = [
    { name: 'Completed', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];
  const COLORS = ['#2563EB', '#F3F4F6'];

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#F3F4F6] shadow-card flex flex-col h-full">
      <h3 className="text-[11px] font-black text-[#1A2B48] uppercase tracking-widest mb-6">Tracking Overview</h3>
      
      <div className="flex items-center gap-8 mb-6">
        {/* Donut Chart */}
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={60}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black text-[#8A92A6] uppercase tracking-tighter">Logging Rate</span>
            <span className="text-xl font-black text-[#1A2B48]">{percentage}%</span>
          </div>
        </div>

        {/* Info List */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-[10px] font-black text-[#1A2B48] uppercase">Active Projects</p>
            <p className="text-lg font-black text-[#2563EB]">{policyUpdates}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-[#1A2B48] uppercase">Inactive employees today</p>
            <p className="text-lg font-black text-[#2563EB]">{complianceIssues}</p>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto space-y-2 border-t border-gray-50 pt-4">
        <Link href="/work-logs" className="w-full flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-[#8A92A6] group-hover:text-[#2563EB] transition-colors" />
            <span className="text-[11px] font-bold text-[#1A2B48] uppercase tracking-tight group-hover:text-[#2563EB] transition-colors">View Team Activity</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#8A92A6] group-hover:text-[#2563EB] transition-colors" />
        </Link>
        <Link href="/profile-requests" className="w-full flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-bold text-[#1A2B48] uppercase tracking-tight group-hover:text-amber-500 transition-colors">Pending Approvals</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#8A92A6] group-hover:text-amber-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
