'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatKRW } from '@/lib/format';

const COLORS = ['#6366f1', '#10b981', '#ef4444', '#a855f7', '#f59e0b', '#64748b'];

interface PortfolioWidgetProps {
  data: { name: string; value: number }[];
}

export function PortfolioWidget({ data }: PortfolioWidgetProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <PieChartIcon className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700">시장별 비중</h3>
        </div>
        <p className="text-xs text-slate-400 text-center py-4">보유 종목이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <PieChartIcon className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-bold text-slate-700">시장별 비중</h3>
      </div>

      <div className="flex items-center gap-4">
        {/* Pie Chart */}
        <div className="w-28 h-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {data.map((d, idx) => {
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="text-slate-400">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
