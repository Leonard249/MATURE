import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { DashboardAnalytics } from '../lib/api';
import { Loader2 } from 'lucide-react';
import {
  PieChart, Pie, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Dashboard() {
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch available years on initial load
  useEffect(() => {
    api.getAvailableYears()
      .then(years => {
        if (years.length > 0) {
          setAvailableYears(years);
          if (!years.includes(selectedYear)) {
            setSelectedYear(years[0]);
          }
        }
      })
      .catch(console.error);
  }, []);

  // 2. Fetch dashboard analytics whenever Year or Month changes
  useEffect(() => {
    let isSubscribed = true;

    api.getDashboardAnalytics(selectedYear, selectedMonth)
      .then(result => {
        if (isSubscribed) {
          setData(result);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isSubscribed) {
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedYear, selectedMonth]);

  // Event handlers set loading directly upon user intent
  const handleYearChange = (year: number) => {
    setLoading(true);
    setSelectedYear(year);
  };

  const handleMonthChange = (month: string) => {
    setLoading(true);
    setSelectedMonth(month);
  };

  if (!data && loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Loading Analytics...
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-rose-500">Failed to load data from backend.</div>;

  const pieChartData = data.yearly_donut.map(item => ({
    ...item,
    fill: item.color 
  }));

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 pb-10">
      
      {/* control bar */}
      <div className="flex items-center gap-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Select Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
          >
            {availableYears.map(y => <option key={y} value={y} className="dark:bg-slate-900">{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Target Month:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => handleMonthChange(e.target.value)}
            className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
          >
            {MONTHS.map(m => <option key={m} value={m} className="dark:bg-slate-900">{m}</option>)}
          </select>
        </div>
      </div>

      {/* Top row: yr & mnth split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* left side: Yearly Overview */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors flex flex-col">
          <h2 className="text-xl font-bold mb-4">Yearly Overview ({selectedYear})</h2>
          
          <div className="flex gap-4 h-full items-center">
            {/* Yearly KPI */}
            <div className="w-1/3 bg-slate-50 dark:bg-slate-950 px-6 py-5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center transition-colors shadow-inner min-w-[170px]">
              <p className="text-xs lg:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 leading-tight">{selectedYear} Total Spending</p>
              <p className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${data.yearly_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            
            {/* Yearly Donut Chart */}
            <div className="w-2/3 h-64 flex flex-col relative">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 text-center">{selectedYear} Spending by Category</h3>
              <div className="flex-grow">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                      <Pie 
                        data={pieChartData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="45%" 
                        cy="50%" 
                        innerRadius={45} 
                        outerRadius={65} 
                        stroke="none"
                      />
                      <Tooltip 
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend position='right' wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500 text-sm">No data for {selectedYear}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* right side: Selected Month Analytics */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors flex flex-col">
          <h2 className="text-xl font-bold mb-4">Selected Month Analytics</h2>
          
          <div className="flex gap-4 h-full items-center">
            {/* Monthly KPI Summary */}
            <div className="w-1/3 bg-slate-50 dark:bg-slate-950 px-6 py-5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center transition-colors shadow-inner space-y-4 min-w-[170px]">
              <div>
                <p className="text-xs lg:text-sm font-semibold text-slate-500 dark:text-slate-400 leading-tight">{selectedMonth} {selectedYear}<br/>Summary</p>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 mb-1">{selectedMonth} Spending:</p>
                <p className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100">
                  ${data.monthly_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Savings Rate:</p>
                <p className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100">{data.savings_rate}%</p>
              </div>
            </div>

            {/* Monthly Comparison Bar Chart */}
            <div className="w-2/3 h-64 flex flex-col relative">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 text-center">Selected Month vs. Monthly Avg</h3>
              <div className="flex-grow">
                {data.monthly_comparison.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthly_comparison} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="category" tick={{fontSize: 11, fill: '#64748b'}} stroke="none" />
                      <YAxis tick={false} stroke="none" />
                      <Tooltip 
                        cursor={{fill: '#334155', opacity: 0.2}}
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        align="center" 
                        iconType="square" 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} 
                      />
                      <Bar dataKey="selected" name={`${selectedMonth.substring(0,3)} ${selectedYear}`} fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="avg" name="Monthly Average" fill="#475569" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500 text-sm">No data for {selectedMonth}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Financial Overview */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors flex flex-col h-80 relative">
        <h2 className="text-xl font-bold mb-2">Financial Overview</h2>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Month-over-Month Cash Flow & Trend</h3>
        
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 rounded-xl backdrop-blur-sm">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.yearly_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

    </div>
  );
}