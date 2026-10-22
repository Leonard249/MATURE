import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonData {
  category: string;
  selected: number;
  avg: number;
}

export default function CategoryComparisonBarChart({ data }: { data: ComparisonData[] }) {
  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-slate-500 text-sm">No comparison data</div>;

  return (
    <div className="flex flex-col relative w-full h-64">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 text-center">Current vs Median Spending</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="category" tick={{fontSize: 11, fill: '#64748b'}} stroke="none" />
            <YAxis tick={false} stroke="none" />
            <Tooltip 
              cursor={{fill: '#334155', opacity: 0.2}}
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
            />
            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="selected" name="This Month" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avg" name="Median/Avg" fill="#64748b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}