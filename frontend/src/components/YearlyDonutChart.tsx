import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData { name: string; value: number; fill: string; }

export default function YearlyDonutChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-slate-500 text-sm">No data available</div>;

  return (
    <div className="flex flex-col relative w-full h-64">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 text-center">Yearly Spending by Category</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <Pie data={data} dataKey="value" nameKey="name" cx="45%" cy="50%" innerRadius={45} outerRadius={65} stroke="none" />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}