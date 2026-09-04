import {
  DashboardData,
  Policy,
  ExpenseItem,
  PaymentItem,
  ReminderItem,
  DocumentItem,
  UserProfile,
} from '../types.ts';
import { memoryStore } from '../db/memoryStore.ts';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

function getUserIdFromTokenOrStorage(token?: string): string {
  if (token && token.startsWith('demo-token-')) {
    return token.replace('demo-token-', '');
  }
  if (token && token.startsWith('google-token-b64:')) {
    try {
      const b64 = token.replace('google-token-b64:', '');
      const json = decodeURIComponent(escape(atob(b64)));
      const parsed = JSON.parse(json);
      if (parsed.uid) return parsed.uid;
    } catch {}
  }
  if (token && token.startsWith('google-token-')) {
    return token.replace('google-token-', '');
  }
  if (typeof window !== 'undefined') {
    try {
      const saved =
        localStorage.getItem('lifetrack_auth_user') ||
        sessionStorage.getItem('lifetrack_auth_user') ||
        sessionStorage.getItem('lifetrack_demo_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.uid) return u.uid;
      }
    } catch {}
  }
  return 'kasthuri';
}

async function callApiOrFallback<T>(
  url: string,
  fetchOptions: RequestInit | undefined,
  token: string | undefined,
  fallbackFn: (userId: string) => Promise<T>
): Promise<T> {
  const userId = getUserIdFromTokenOrStorage(token);
  try {
    const res = await fetch(url, fetchOptions);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Network error or server not running (e.g. static hosting on Vercel)
  }

  // Seamless client-side persistent fallback
  await memoryStore.seedUserDataIfEmpty(userId);
  return await fallbackFn(userId);
}

export const api = {
  // Dashboard
  async getDashboard(token: string): Promise<DashboardData> {
    return callApiOrFallback(
      '/api/dashboard',
      { headers: authHeaders(token) },
      token,
      (uid) => memoryStore.getDashboardData(uid)
    );
  },

  // Policies
  async getPolicies(token: string): Promise<Policy[]> {
    return callApiOrFallback(
      '/api/policies',
      { headers: authHeaders(token) },
      token,
      (uid) => memoryStore.getPolicies(uid)
    );
  },

  async getPolicyById(token: string, id: number): Promise<Policy> {
    return callApiOrFallback(
      `/api/policies/${id}`,
      { headers: authHeaders(token) },
      token,
      async (uid) => {
        const p = await memoryStore.getPolicyById(uid, id);
        if (!p) throw new Error('Policy not found');
        return p;
      }
    );
  },

  async createPolicy(token: string, data: Partial<Policy>): Promise<Policy> {
    return callApiOrFallback(
      '/api/policies',
      {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
      token,
      (uid) => memoryStore.createPolicy(uid, data as any)
    );
  },

  async updatePolicy(token: string, id: number, data: Partial<Policy>): Promise<Policy> {
    return callApiOrFallback(
      `/api/policies/${id}`,
      {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
      token,
      async (uid) => {
        const p = await memoryStore.updatePolicy(uid, id, data);
        if (!p) throw new Error('Policy not found');
        return p;
      }
    );
  },

  async deletePolicy(token: string, id: number): Promise<void> {
    await callApiOrFallback(
      `/api/policies/${id}`,
      {
        method: 'DELETE',
        headers: authHeaders(token),
      },
      token,
      async (uid) => {
        await memoryStore.deletePolicy(uid, id);
        return null;
      }
    );
  },

  // Expenses
  async getExpenses(
    token: string,
    filters?: {
      policyId?: number;
      expenseType?: string;
      category?: string;
      paymentStatus?: string;
    }
  ): Promise<ExpenseItem[]> {
    const params = new URLSearchParams();
    if (filters?.policyId) params.append('policyId', filters.policyId.toString());
    if (filters?.expenseType && filters.expenseType !== 'All')
      params.append('expenseType', filters.expenseType);
    if (filters?.category && filters.category !== 'All')
      params.append('category', filters.category);
    if (filters?.paymentStatus && filters.paymentStatus !== 'All')
      params.append('paymentStatus', filters.paymentStatus);

    return callApiOrFallback(
      `/api/expenses?${params.toString()}`,
      { headers: authHeaders(token) },
      token,
      (uid) => memoryStore.getExpenses(uid, filters)
    );
  },

  async createExpense(token: string, data: Partial<ExpenseItem>): Promise<ExpenseItem> {
    return callApiOrFallback(
      '/api/expenses',
      {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
      token,
      (uid) => memoryStore.createExpense(uid, data as any)
    );
  },

  async updateExpense(token: string, id: number, data: Partial<ExpenseItem>): Promise<ExpenseItem> {
    return callApiOrFallback(
      `/api/expenses/${id}`,
      {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
      token,
      async (uid) => {
        const e = await memoryStore.updateExpense(uid, id, data);
        if (!e) throw new Error('Expense not found');
        return e;
      }
    );
  },

  async deleteExpense(token: string, id: number): Promise<void> {
    await callApiOrFallback(
      `/api/expenses/${id}`,
      {
        method: 'DELETE',
        headers: authHeaders(token),
      },
      token,
      async (uid) => {
        await memoryStore.deleteExpense(uid, id);
        return null;
      }
    );
  },

  // Payments
  async getPayments(token: string, policyId?: number): Promise<PaymentItem[]> {
    const url = policyId ? `/api/payments?policyId=${policyId}` : '/api/payments';
    return callApiOrFallback(
      url,
      { headers: authHeaders(token) },
      token,
      (uid) => memoryStore.getPayments(uid, policyId)
    );
  },

  async createPayment(token: string, data: Partial<PaymentItem>): Promise<PaymentItem> {
    return callApiOrFallback(
      '/api/payments',
      {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
      token,
      (uid) => memoryStore.createPayment(uid, data as any)
    );
  },

  async markPaymentComplete(
    token: string,
    id: number,
    data: {
      paymentDate: string;
      paymentMethod: string;
      transactionReference?: string;
      createExpenseRecord?: boolean;
      notes?: string;
    }
  ): Promise<any> {
    return callApiOrFallback(
      `/api/payments/${id}/pay`,
      {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
      token,
      (uid) => memoryStore.recordPaymentCompletion(uid, id, data)
    );
  },

  // Reminders
  async getReminders(token: string): Promise<ReminderItem[]> {
    return callApiOrFallback(
      '/api/reminders',
      { headers: authHeaders(token) },
      token,
      (uid) => memoryStore.getReminders(uid)
    );
  },

  async createReminder(token: string, data: Partial<ReminderItem>): Promise<ReminderItem> {
    return callApiOrFallback(
      '/api/reminders',
      {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
      token,
      (uid) => memoryStore.createReminder(uid, data as any)
    );
  },

  async markReminderRead(token: string, id: number): Promise<void> {
    await callApiOrFallback(
      `/api/reminders/${id}/read`,
      {
        method: 'PUT',
        headers: authHeaders(token),
      },
      token,
      async (uid) => {
        await memoryStore.markReminderRead(uid, id);
        return null;
      }
    );
  },

  async dismissReminder(token: string, id: number): Promise<void> {
    await callApiOrFallback(
      `/api/reminders/${id}/dismiss`,
      {
        method: 'PUT',
        headers: authHeaders(token),
      },
      token,
      async (uid) => {
        await memoryStore.dismissReminder(uid, id);
        return null;
      }
    );
  },

  async deleteReminder(token: string, id: number): Promise<void> {
    await callApiOrFallback(
      `/api/reminders/${id}`,
      {
        method: 'DELETE',
        headers: authHeaders(token),
      },
      token,
      async (uid) => {
        await memoryStore.deleteReminder(uid, id);
        return null;
      }
    );
  },

  // Documents
  async getDocuments(token: string, policyId?: number): Promise<DocumentItem[]> {
    const url = policyId ? `/api/documents?policyId=${policyId}` : '/api/documents';
    return callApiOrFallback(
      url,
      { headers: authHeaders(token) },
      token,
      (uid) => memoryStore.getDocuments(uid, policyId)
    );
  },

  async createDocument(token: string, data: Partial<DocumentItem>): Promise<DocumentItem> {
    return callApiOrFallback(
      '/api/documents',
      {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
      token,
      (uid) => memoryStore.createDocument(uid, data as any)
    );
  },

  async deleteDocument(token: string, id: number): Promise<void> {
    await callApiOrFallback(
      `/api/documents/${id}`,
      {
        method: 'DELETE',
        headers: authHeaders(token),
      },
      token,
      async (uid) => {
        await memoryStore.deleteDocument(uid, id);
        return null;
      }
    );
  },

  // Reports
  async getReports(token: string): Promise<any> {
    return callApiOrFallback(
      '/api/reports',
      { headers: authHeaders(token) },
      token,
      (uid) => memoryStore.getReportsData(uid)
    );
  },

  // Profile
  async updateProfile(token: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return callApiOrFallback(
      '/api/profile',
      {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
      token,
      (uid) => memoryStore.updateUserProfile(uid, data)
    );
  },
};
