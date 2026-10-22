import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { DashboardAnalytics } from '../lib/api';
import { Loader2 } from 'lucide-react';

import DashboardControls from '../components/DashboardControls';
import KpiCard from '../components/KpiCard';
import YearlyDonutChart from '../components/YearlyDonutChart';
import CategoryComparisonBarChart from '../components/CategoryComparisonBarChart';
import MonthlyDonutChart from '../components/MonthlyDonutChart';
import PacingLineChart from '../components/PacingLineChart';
import TopTransactions from '../components/TopTransactions';
import CashFlowAreaChart from '../components/CashFlowAreaChart';

export default function Dashboard() {
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('October');
  
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAvailableYears()
      .then(years => {
        if (years.length > 0) {
          setAvailableYears(years);
          if (!years.includes(selectedYear)) setSelectedYear(years[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    api.getDashboardAnalytics(selectedYear, selectedMonth)
      .then(result => { if (isSubscribed) setData(result); })
      .catch(console.error)
      .finally(() => { if (isSubscribed) setLoading(false); });
    return () => { isSubscribed = false; };
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (year: number) => { setLoading(true); setSelectedYear(year); };
  const handleMonthChange = (month: string) => { setLoading(true); setSelectedMonth(month); };

  if (!data && loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Loading Analytics...
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-rose-500">Failed to load data from backend.</div>;

  const yearlyPieData = data.yearly_donut?.map(item => ({ ...item, fill: item.color })) || [];
  const monthlyPieData = data.monthly_donut?.map(item => ({ ...item, fill: item.color })) || [];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 pb-10">
      
      {/* Controls bar -> might add something else */}
      <DashboardControls 
        availableYears={availableYears}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
      />

      {/* TOP ROW: ORIGINAL CONTAINER PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Yearly panel */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
            Yearly Overview ({selectedYear})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1">
              <KpiCard 
                title={`${selectedYear} Total Spending`} 
                amount={data.yearly_total} 
              />
            </div>
            <div className="md:col-span-2">
              <YearlyDonutChart data={yearlyPieData} />
            </div>
          </div>
        </div>

        {/* Monthly panel */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
            Selected Month Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1">
              <KpiCard 
                title={`${selectedMonth} ${selectedYear} Summary`} 
                amount={data.monthly_total} 
                subtitle={
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Savings Rate: <span className="font-bold text-slate-800 dark:text-slate-100">{data.savings_rate}%</span>
                  </p>
                }
              />
            </div>
            <div className="md:col-span-2">
              <CategoryComparisonBarChart data={data.monthly_comparison || []} />
            </div>
          </div>
        </div>

      </div>

      {/* Middle row: monthly donut, pacing and top 5 transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <MonthlyDonutChart data={monthlyPieData} />
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <PacingLineChart data={data.pacing_data || []} />
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <TopTransactions data={data.top_transactions || []} />
        </div>
      </div>

      {/* Bottom row: Financial Overview*/}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 rounded-2xl backdrop-blur-sm">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        )}
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Financial Overview</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Month-over-Month Cash Flow & Trend</p>
        <CashFlowAreaChart data={data.yearly_trend || []} />
      </div>

    </div>
  );
}