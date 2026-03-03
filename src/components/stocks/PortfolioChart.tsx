'use client';

import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatKRW, formatPercent } from '@/lib/format';
import type { AppMode } from '@/types';

const COLORS = ['#6366f1', '#10b981', '#ef4444', '#a855f7', '#f59e0b', '#64748b'];

interface PortfolioChartProps {
  data: { name: string; value: number }[];
  mode: AppMode;
}

export function PortfolioChart({ data, mode }: PortfolioChartProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-700">시장별 비중</h3>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
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
      <div className="space-y-2 mt-2">
        {data.map((d, idx) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-600">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{pct.toFixed(1)}%</span>
                <span className="text-slate-700 font-medium">{formatKRW(d.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
