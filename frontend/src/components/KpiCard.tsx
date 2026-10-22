// Reusable box for $ amounts/ savings rate
import React from 'react';

interface KpiCardProps {
  title: string;
  amount: number;
  subtitle?: React.ReactNode;
}

export default function KpiCard({ title, amount, subtitle }: KpiCardProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 px-6 py-5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center transition-colors shadow-inner w-full">
      <p className="text-xs lg:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 leading-tight">
        {title}
      </p>
      <p className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      {subtitle && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          {subtitle}
        </div>
      )}
    </div>
  );
}