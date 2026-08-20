"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PipelineData {
  name: string;
  value: number;
  color: string;
}

export default function PipelineChart({ data }: { data: PipelineData[] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs font-medium py-8">
        <p className="font-bold text-slate-600 mb-1">No pipeline data yet</p>
        <p>Leads will appear here as they progress through stages.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="h-44 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: 'none', 
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{total}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        {data.map((item, idx) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100/80">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-slate-700 truncate">{item.name}</span>
              </div>
              <div className="text-right shrink-0 pl-1">
                <span className="text-xs font-extrabold text-slate-900">{item.value}</span>
                <span className="text-[10px] text-slate-400 font-medium ml-1">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
