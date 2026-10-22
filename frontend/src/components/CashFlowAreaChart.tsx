import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface TrendData { month: string; cash_in: number; cash_out: number; }

export default function CashFlowAreaChart({ data }: { data: TrendData[] }) {
  return (
    <div className="flex flex-col relative w-full h-80">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Month-over-Month Cash Flow</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCashIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCashOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{fontSize: 12, fill: '#64748b'}} stroke="#334155" />
          <YAxis tickFormatter={(val) => `$${val}`} tick={{fontSize: 12, fill: '#64748b'}} stroke="#334155" />
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} 
          />
          <Legend verticalAlign="top" align="right" iconType="rect" wrapperStyle={{ fontSize: '12px', top: -15 }} />
          <Area type="monotone" dataKey="cash_in" name="Cash In" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCashIn)" />
          <Area type="monotone" dataKey="cash_out" name="Cash Out" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCashOut)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}