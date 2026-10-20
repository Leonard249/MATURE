export interface TransactionBase {
  id?: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  transaction_type: string;
}

export interface ExtractionPayload {
  transactions: TransactionBase[];
}

export interface DashboardAnalytics {
  yearly_total: number;
  yearly_donut: { name: string; value: number; color: string }[];
  monthly_total: number;
  monthly_comparison: { category: string; selected: number; avg: number }[];
  yearly_trend: { month: string; cash_in: number; cash_out: number }[];
  savings_rate: number;
}

const BASE_URL = 'http://127.0.0.1:8000/api';

export const api = {
  extractTransactions: async (text: string): Promise<ExtractionPayload> => {
    const res = await fetch(`${BASE_URL}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to extract transactions');
    }
    return res.json();
  },

  saveTransactions: async (transactions: TransactionBase[]): Promise<{ status: string }> => {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactions),
    });
    if (!res.ok) throw new Error('Failed to save transactions');
    return res.json();
  },

  getTransactions: async (): Promise<TransactionBase[]> => {
    const res = await fetch(`${BASE_URL}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  getDashboardAnalytics: async (year: number, month: string): Promise<DashboardAnalytics> => {
    const res = await fetch(`${BASE_URL}/analytics/dashboard?year=${year}&month=${month}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
    return res.json();
  },

  getAvailableYears: async (): Promise<number[]> => {
    const res = await fetch(`${BASE_URL}/analytics/available-years`);
    if (!res.ok) throw new Error('Failed to fetch available years');
    return res.json();
  }
};