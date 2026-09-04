import {
  DashboardData,
  Policy,
  ExpenseItem,
  PaymentItem,
  ReminderItem,
  DocumentItem,
  UserProfile,
} from '../types.ts';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const api = {
  // Dashboard
  async getDashboard(token: string): Promise<DashboardData> {
    const res = await fetch('/api/dashboard', { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  // Policies
  async getPolicies(token: string): Promise<Policy[]> {
    const res = await fetch('/api/policies', { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch policies');
    return res.json();
  },

  async getPolicyById(token: string, id: number): Promise<Policy> {
    const res = await fetch(`/api/policies/${id}`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch policy');
    return res.json();
  },

  async createPolicy(token: string, data: Partial<Policy>): Promise<Policy> {
    const res = await fetch('/api/policies', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create policy');
    return res.json();
  },

  async updatePolicy(token: string, id: number, data: Partial<Policy>): Promise<Policy> {
    const res = await fetch(`/api/policies/${id}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update policy');
    return res.json();
  },

  async deletePolicy(token: string, id: number): Promise<void> {
    const res = await fetch(`/api/policies/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete policy');
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

    const res = await fetch(`/api/expenses?${params.toString()}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  async createExpense(token: string, data: Partial<ExpenseItem>): Promise<ExpenseItem> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create expense');
    return res.json();
  },

  async updateExpense(token: string, id: number, data: Partial<ExpenseItem>): Promise<ExpenseItem> {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update expense');
    return res.json();
  },

  async deleteExpense(token: string, id: number): Promise<void> {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete expense');
  },

  // Payments
  async getPayments(token: string, policyId?: number): Promise<PaymentItem[]> {
    const url = policyId ? `/api/payments?policyId=${policyId}` : '/api/payments';
    const res = await fetch(url, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async createPayment(token: string, data: Partial<PaymentItem>): Promise<PaymentItem> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to schedule payment');
    return res.json();
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
    const res = await fetch(`/api/payments/${id}/pay`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to mark payment as paid');
    return res.json();
  },

  // Reminders
  async getReminders(token: string): Promise<ReminderItem[]> {
    const res = await fetch('/api/reminders', { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch reminders');
    return res.json();
  },

  async createReminder(token: string, data: Partial<ReminderItem>): Promise<ReminderItem> {
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create reminder');
    return res.json();
  },

  async markReminderRead(token: string, id: number): Promise<void> {
    await fetch(`/api/reminders/${id}/read`, {
      method: 'PUT',
      headers: authHeaders(token),
    });
  },

  async dismissReminder(token: string, id: number): Promise<void> {
    await fetch(`/api/reminders/${id}/dismiss`, {
      method: 'PUT',
      headers: authHeaders(token),
    });
  },

  async deleteReminder(token: string, id: number): Promise<void> {
    const res = await fetch(`/api/reminders/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete reminder');
  },

  // Documents
  async getDocuments(token: string, policyId?: number): Promise<DocumentItem[]> {
    const url = policyId ? `/api/documents?policyId=${policyId}` : '/api/documents';
    const res = await fetch(url, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async createDocument(token: string, data: Partial<DocumentItem>): Promise<DocumentItem> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add document');
    return res.json();
  },

  async deleteDocument(token: string, id: number): Promise<void> {
    await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
  },

  // Reports
  async getReports(token: string): Promise<any> {
    const res = await fetch('/api/reports', { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  // Profile
  async updateProfile(token: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },
};
