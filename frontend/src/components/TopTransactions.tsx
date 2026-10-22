interface Transaction {
  date: string;
  category: string;
  description: string;
  amount: number;
}

export default function TopTransactions({ data }: { data: Transaction[] }) {
  return (
    <div className="flex flex-col w-full h-full min-h-[320px]">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">Top 5 Transactions This Month</h3>
      <div className="flex-grow overflow-x-auto">
        <table className="w-full text-sm text-left h-full">
          <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {data.length > 0 ? (
              data.map((txn, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{txn.date}</td>
                  <td className="px-4 py-4 text-emerald-600 dark:text-emerald-500 whitespace-nowrap">{txn.category}</td>
                  <td className="px-4 py-4 text-slate-900 dark:text-slate-100 line-clamp-2">{txn.description}</td>
                  <td className="px-4 py-4 text-slate-900 dark:text-slate-100 font-bold text-right whitespace-nowrap">${txn.amount.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No transactions this month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}