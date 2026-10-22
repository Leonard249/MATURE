import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData { name: string; value: number; fill: string; }

export default function MonthlyDonutChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-slate-500 text-sm">No data available</div>;

  return (
    <div className="flex flex-col w-full h-full min-h-[320px]">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Monthly Spending by Category</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="45%" 
              innerRadius={65} 
              outerRadius={85} 
              stroke="none"
            />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend layout="horizontal" position="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}