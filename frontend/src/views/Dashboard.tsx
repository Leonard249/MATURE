import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import type { DashboardData } from '../lib/api';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-500">Loading metrics...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Total Income</p>
          <p className="text-2xl font-bold text-emerald-600">${data.kpis.total_income.toFixed(2)}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Total Expenses</p>
          <p className="text-2xl font-bold text-rose-600">${data.kpis.total_expenses.toFixed(2)}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Net Cash Flow</p>
          <p className={`text-2xl font-bold ${data.kpis.net_cash_flow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ${data.kpis.net_cash_flow.toFixed(2)}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Savings Rate</p>
          <p className="text-2xl font-bold text-indigo-600">{data.kpis.savings_rate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 h-96 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.charts.category_donut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={110} label>
                {data.charts.category_donut.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 h-96 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Daily Spending Trend</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.charts.daily_trend}>
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}