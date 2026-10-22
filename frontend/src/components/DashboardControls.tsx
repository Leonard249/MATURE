import { Database, Cpu } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface DashboardControlsProps {
  availableYears: number[];
  selectedYear: number;
  selectedMonth: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: string) => void;
}

export default function DashboardControls({
  availableYears, selectedYear, selectedMonth, onYearChange, onMonthChange
}: DashboardControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors">
      
      {/* Left Side: Filters */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Select Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg pl-3 pr-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {availableYears.map(y => <option key={y} value={y} className="dark:bg-slate-900">{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Target Month:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg pl-3 pr-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {MONTHS.map(m => <option key={m} value={m} className="dark:bg-slate-900">{m}</option>)}
          </select>
        </div>
      </div>

      {/* Right Side: Telemetry & Status Indicators */}
      <div className="hidden md:flex items-center gap-3">
        
        {/* Local DB Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 cursor-default">
          <Database size={14} className="text-emerald-500" />
          SQLite Local
        </div>

        {/* Inference Engine Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 cursor-default">
          <Cpu size={14} className="text-blue-500" />
          mlx-lm Ready
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 cursor-default">
          <span className="relative flex h-2.5 w-2.5 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          System Active
        </div>

      </div>

    </div>
  );
}