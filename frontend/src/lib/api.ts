const API_BASE_URL = 'http://127.0.0.1:8000/api';

// TYPES
export interface TransactionBase {
  transaction_type: 'EXPENSE' | 'INCOME';
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface DashboardData {
  kpis: {
    total_income: number;
    total_expenses: number;
    net_cash_flow: number;
    savings_rate: number;
  };
  charts: {
    category_donut: { name: string; value: number }[];
    daily_trend: { date: string; amount: number }[];
  };
}

export const api = {
  extractTransactions: async (text: string): Promise<{ transactions: TransactionBase[] }> => {
    const res = await fetch(`${API_BASE_URL}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Extraction failed');
    return res.json();
  },
  
  saveTransactions: async (transactions: TransactionBase[]): Promise<{ status: string; inserted: number }> => {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactions)
    });
    if (!res.ok) throw new Error('Failed to save to database');
    return res.json();
  },
  
  getDashboard: async (): Promise<DashboardData> => {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  }
};