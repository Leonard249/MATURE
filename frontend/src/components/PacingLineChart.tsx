import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface PacingData { day: number; current_month: number; average_month: number; }

export default function PacingLineChart({ data }: { data: PacingData[] }) {
  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-slate-500 text-sm">No pacing data</div>;

  return (
    <div className="flex flex-col w-full h-full min-h-[320px]">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Cumulative Pacing</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{fontSize: 11, fill: '#64748b'}} stroke="none" tickMargin={10} />
            <YAxis tick={false} stroke="none" />
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
            />
            <Legend position="bottom" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
            <Line type="monotone" dataKey="current_month" name="This Month" stroke="#10b981" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="average_month" name="Monthly Avg" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}