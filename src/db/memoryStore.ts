// In-memory fallback database for AI Studio environment when PostgreSQL / Cloud SQL is not connected
import {
  UserProfile,
  Policy,
  ExpenseItem,
  PaymentItem,
  ReminderItem,
  DocumentItem,
  BeneficiaryItem,
} from '../types.ts';

interface StoreState {
  users: Map<string, UserProfile>;
  policies: Map<number, Policy>;
  expenses: Map<number, ExpenseItem>;
  payments: Map<number, PaymentItem>;
  reminders: Map<number, ReminderItem>;
  documents: Map<number, DocumentItem>;
  beneficiaries: Map<number, BeneficiaryItem>;
  nextId: {
    users: number;
    policies: number;
    expenses: number;
    payments: number;
    reminders: number;
    documents: number;
    beneficiaries: number;
  };
}

const state: StoreState = {
  users: new Map(),
  policies: new Map(),
  expenses: new Map(),
  payments: new Map(),
  reminders: new Map(),
  documents: new Map(),
  beneficiaries: new Map(),
  nextId: {
    users: 1,
    policies: 1,
    expenses: 1,
    payments: 1,
    reminders: 1,
    documents: 1,
    beneficiaries: 1,
  },
};

export const memoryStore = {
  // Users
  async getOrCreateUser(uid: string, email: string, fullName?: string): Promise<UserProfile> {
    const existing = state.users.get(uid);
    if (existing) {
      if (fullName && !existing.fullName) {
        existing.fullName = fullName;
      }
      return existing;
    }

    const newUser: UserProfile = {
      id: state.nextId.users++,
      uid,
      email: email || `${uid}@example.com`,
      fullName: fullName || '',
      phone: '',
      address: '',
      dob: '',
      currency: 'INR',
      darkMode: false,
      emailNotifications: true,
      reminderDays: 7,
      createdAt: new Date().toISOString(),
    };
    state.users.set(uid, newUser);
    return newUser;
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    return state.users.get(uid) || null;
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const user = state.users.get(uid);
    if (!user) {
      const created = await this.getOrCreateUser(uid, data.email || '', data.fullName);
      Object.assign(created, data);
      return created;
    }
    Object.assign(user, data);
    return user;
  },

  // Policies
  async getPolicies(userId: string): Promise<Policy[]> {
    return Array.from(state.policies.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getPolicyById(userId: string, id: number): Promise<Policy | null> {
    const policy = state.policies.get(id);
    if (!policy || policy.userId !== userId) return null;

    const policyExpenses = Array.from(state.expenses.values())
      .filter((e) => e.userId === userId && e.policyId === id)
      .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));

    const policyPayments = Array.from(state.payments.values())
      .filter((p) => p.userId === userId && p.policyId === id)
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

    const policyBeneficiaries = Array.from(state.beneficiaries.values()).filter(
      (b) => b.userId === userId && b.policyId === id
    );

    const policyDocs = Array.from(state.documents.values()).filter(
      (d) => d.userId === userId && d.policyId === id
    );

    return {
      ...policy,
      expenses: policyExpenses,
      payments: policyPayments,
      beneficiaries: policyBeneficiaries,
      documents: policyDocs,
    };
  },

  async createPolicy(
    userId: string,
    data: {
      policyName: string;
      companyName: string;
      policyNumber: string;
      policyType: any;
      policyHolder: string;
      startDate: string;
      endDate?: string;
      premiumAmount: number;
      premiumFrequency: any;
      nextDueDate: string;
      sumAssured?: number;
      paymentMethod?: string;
      nomineeName?: string;
      nomineeRelation?: string;
      status?: any;
      notes?: string;
    }
  ): Promise<Policy> {
    const id = state.nextId.policies++;
    const newPolicy: Policy = {
      id,
      userId,
      policyName: data.policyName,
      companyName: data.companyName,
      policyNumber: data.policyNumber,
      policyType: data.policyType,
      policyHolder: data.policyHolder,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      premiumAmount: Number(data.premiumAmount),
      premiumFrequency: data.premiumFrequency,
      nextDueDate: data.nextDueDate,
      sumAssured: Number(data.sumAssured || 0),
      paymentMethod: data.paymentMethod || 'Net Banking',
      nomineeName: data.nomineeName || '',
      nomineeRelation: data.nomineeRelation || '',
      status: data.status || 'Active',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    state.policies.set(id, newPolicy);

    // Automatically create the upcoming payment schedule for this policy
    await this.createPayment(userId, {
      policyId: newPolicy.id,
      amount: newPolicy.premiumAmount,
      dueDate: newPolicy.nextDueDate,
      paymentMethod: newPolicy.paymentMethod || 'Net Banking',
      status: 'Upcoming',
      notes: `Scheduled ${newPolicy.premiumFrequency} premium for ${newPolicy.policyName}`,
    });

    // Create a reminder
    await this.createReminder(userId, {
      policyId: newPolicy.id,
      title: `${newPolicy.policyName} Premium Due`,
      reminderType: 'Premium Due',
      dueDate: newPolicy.nextDueDate,
      remindDaysBefore: 7,
    });

    if (data.nomineeName) {
      const bId = state.nextId.beneficiaries++;
      state.beneficiaries.set(bId, {
        id: bId,
        userId,
        policyId: newPolicy.id,
        name: data.nomineeName,
        relationship: data.nomineeRelation || 'Nominee',
        sharePercentage: 100,
        createdAt: new Date().toISOString(),
      });
    }

    return newPolicy;
  },

  async updatePolicy(userId: string, id: number, data: Partial<Policy>): Promise<Policy | null> {
    const policy = state.policies.get(id);
    if (!policy || policy.userId !== userId) return null;
    Object.assign(policy, data);
    return policy;
  },

  async deletePolicy(userId: string, id: number): Promise<Policy | null> {
    const policy = state.policies.get(id);
    if (!policy || policy.userId !== userId) return null;

    // Delete child records
    for (const [pId, p] of state.payments.entries()) {
      if (p.policyId === id && p.userId === userId) state.payments.delete(pId);
    }
    for (const [eId, e] of state.expenses.entries()) {
      if (e.policyId === id && e.userId === userId) state.expenses.delete(eId);
    }
    for (const [rId, r] of state.reminders.entries()) {
      if (r.policyId === id && r.userId === userId) state.reminders.delete(rId);
    }
    for (const [dId, d] of state.documents.entries()) {
      if (d.policyId === id && d.userId === userId) state.documents.delete(dId);
    }
    for (const [bId, b] of state.beneficiaries.entries()) {
      if (b.policyId === id && b.userId === userId) state.beneficiaries.delete(bId);
    }

    state.policies.delete(id);
    return policy;
  },

  // Expenses
  async getExpenses(
    userId: string,
    filters?: {
      policyId?: number;
      expenseType?: string;
      category?: string;
      paymentStatus?: string;
    }
  ): Promise<ExpenseItem[]> {
    let items = Array.from(state.expenses.values()).filter((e) => e.userId === userId);

    if (filters?.policyId) {
      items = items.filter((e) => e.policyId === filters.policyId);
    }
    if (filters?.expenseType && filters.expenseType !== 'All') {
      items = items.filter((e) => e.expenseType === filters.expenseType);
    }
    if (filters?.category && filters.category !== 'All') {
      items = items.filter((e) => e.category === filters.category);
    }
    if (filters?.paymentStatus && filters.paymentStatus !== 'All') {
      items = items.filter((e) => e.paymentStatus === filters.paymentStatus);
    }

    // Attach policy info
    return items
      .map((e) => {
        const policy = e.policyId ? state.policies.get(e.policyId) : undefined;
        return {
          ...e,
          policyName: policy?.policyName,
          companyName: policy?.companyName,
        };
      })
      .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
  },

  async createExpense(
    userId: string,
    data: {
      policyId?: number | null;
      expenseName: string;
      expenseType: any;
      category: string;
      amount: number;
      expenseDate: string;
      paymentMethod: string;
      paymentStatus?: string;
      receiptUrl?: string;
      notes?: string;
    }
  ): Promise<ExpenseItem> {
    const id = state.nextId.expenses++;
    const item: ExpenseItem = {
      id,
      userId,
      policyId: data.policyId ? Number(data.policyId) : null,
      expenseName: data.expenseName,
      expenseType: data.expenseType,
      category: data.category,
      amount: Number(data.amount),
      expenseDate: data.expenseDate,
      paymentMethod: data.paymentMethod || 'UPI',
      paymentStatus: data.paymentStatus || 'Paid',
      receiptUrl: data.receiptUrl || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    state.expenses.set(id, item);

    const policy = item.policyId ? state.policies.get(item.policyId) : undefined;
    return {
      ...item,
      policyName: policy?.policyName,
      companyName: policy?.companyName,
    };
  },

  async updateExpense(userId: string, id: number, data: Partial<ExpenseItem>): Promise<ExpenseItem | null> {
    const expense = state.expenses.get(id);
    if (!expense || expense.userId !== userId) return null;
    Object.assign(expense, data);
    const policy = expense.policyId ? state.policies.get(expense.policyId) : undefined;
    return {
      ...expense,
      policyName: policy?.policyName,
      companyName: policy?.companyName,
    };
  },

  async deleteExpense(userId: string, id: number): Promise<ExpenseItem | null> {
    const expense = state.expenses.get(id);
    if (!expense || expense.userId !== userId) return null;
    state.expenses.delete(id);
    return expense;
  },

  // Payments
  async getPayments(userId: string, policyId?: number): Promise<PaymentItem[]> {
    let items = Array.from(state.payments.values()).filter((p) => p.userId === userId);
    if (policyId) {
      items = items.filter((p) => p.policyId === policyId);
    }
    return items
      .map((p) => {
        const policy = state.policies.get(p.policyId);
        return {
          ...p,
          policyName: policy?.policyName,
          companyName: policy?.companyName,
          policyNumber: policy?.policyNumber,
        };
      })
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  },

  async createPayment(
    userId: string,
    data: {
      policyId: number;
      amount: number;
      dueDate: string;
      paymentDate?: string;
      paymentMethod?: string;
      status?: any;
      transactionReference?: string;
      receiptUrl?: string;
      notes?: string;
    }
  ): Promise<PaymentItem> {
    const id = state.nextId.payments++;
    const item: PaymentItem = {
      id,
      userId,
      policyId: Number(data.policyId),
      amount: Number(data.amount),
      dueDate: data.dueDate,
      paymentDate: data.paymentDate || undefined,
      paymentMethod: data.paymentMethod || 'Net Banking',
      status: data.status || 'Upcoming',
      transactionReference: data.transactionReference || '',
      receiptUrl: data.receiptUrl || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    state.payments.set(id, item);

    const policy = state.policies.get(item.policyId);
    return {
      ...item,
      policyName: policy?.policyName,
      companyName: policy?.companyName,
      policyNumber: policy?.policyNumber,
    };
  },

  async recordPaymentCompletion(
    userId: string,
    paymentId: number,
    details: {
      paymentDate: string;
      paymentMethod: string;
      transactionReference?: string;
      receiptUrl?: string;
      notes?: string;
      createExpenseRecord?: boolean;
    }
  ): Promise<PaymentItem | null> {
    const payment = state.payments.get(paymentId);
    if (!payment || payment.userId !== userId) return null;

    payment.status = 'Paid';
    payment.paymentDate = details.paymentDate;
    payment.paymentMethod = details.paymentMethod;
    payment.transactionReference = details.transactionReference || '';
    payment.receiptUrl = details.receiptUrl || '';
    payment.notes = details.notes || '';

    if (details.createExpenseRecord) {
      const policy = state.policies.get(payment.policyId);
      const policyName = policy?.policyName || 'Policy Premium';
      await this.createExpense(userId, {
        policyId: payment.policyId,
        expenseName: `Premium: ${policyName}`,
        expenseType: 'Direct',
        category: 'Premium',
        amount: payment.amount,
        expenseDate: details.paymentDate,
        paymentMethod: details.paymentMethod,
        paymentStatus: 'Paid',
        receiptUrl: details.receiptUrl || '',
        notes: `Recorded via payment confirmation. Ref: ${details.transactionReference || 'N/A'}`,
      });
    }

    const policy = state.policies.get(payment.policyId);
    return {
      ...payment,
      policyName: policy?.policyName,
      companyName: policy?.companyName,
      policyNumber: policy?.policyNumber,
    };
  },

  // Reminders
  async getReminders(userId: string): Promise<ReminderItem[]> {
    return Array.from(state.reminders.values())
      .filter((r) => r.userId === userId && !r.isDismissed)
      .map((r) => {
        const policy = r.policyId ? state.policies.get(r.policyId) : undefined;
        return {
          ...r,
          policyName: policy?.policyName,
          companyName: policy?.companyName,
        };
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },

  async createReminder(
    userId: string,
    data: {
      policyId?: number;
      title: string;
      reminderType: string;
      dueDate: string;
      remindDaysBefore?: number;
    }
  ): Promise<ReminderItem> {
    const id = state.nextId.reminders++;
    const item: ReminderItem = {
      id,
      userId,
      policyId: data.policyId ? Number(data.policyId) : null,
      title: data.title,
      reminderType: data.reminderType,
      dueDate: data.dueDate,
      remindDaysBefore: data.remindDaysBefore || 7,
      isRead: false,
      isDismissed: false,
      createdAt: new Date().toISOString(),
    };
    state.reminders.set(id, item);
    const policy = item.policyId ? state.policies.get(item.policyId) : undefined;
    return {
      ...item,
      policyName: policy?.policyName,
      companyName: policy?.companyName,
    };
  },

  async markReminderRead(userId: string, id: number): Promise<ReminderItem | null> {
    const reminder = state.reminders.get(id);
    if (!reminder || reminder.userId !== userId) return null;
    reminder.isRead = true;
    return reminder;
  },

  async dismissReminder(userId: string, id: number): Promise<ReminderItem | null> {
    const reminder = state.reminders.get(id);
    if (!reminder || reminder.userId !== userId) return null;
    reminder.isDismissed = true;
    return reminder;
  },

  async deleteReminder(userId: string, id: number): Promise<ReminderItem | null> {
    const reminder = state.reminders.get(id);
    if (!reminder || reminder.userId !== userId) return null;
    state.reminders.delete(id);
    return reminder;
  },

  // Documents
  async getDocuments(userId: string, policyId?: number): Promise<DocumentItem[]> {
    let items = Array.from(state.documents.values()).filter((d) => d.userId === userId);
    if (policyId) {
      items = items.filter((d) => d.policyId === policyId);
    }
    return items
      .map((d) => {
        const policy = d.policyId ? state.policies.get(d.policyId) : undefined;
        return {
          ...d,
          policyName: policy?.policyName,
          companyName: policy?.companyName,
        };
      })
      .sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));
  },

  async createDocument(
    userId: string,
    data: {
      policyId?: number;
      documentName: string;
      documentType: string;
      fileUrl: string;
      fileSize?: string;
      uploadDate: string;
      notes?: string;
    }
  ): Promise<DocumentItem> {
    const id = state.nextId.documents++;
    const item: DocumentItem = {
      id,
      userId,
      policyId: data.policyId ? Number(data.policyId) : null,
      documentName: data.documentName,
      documentType: data.documentType,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize || '1.2 MB',
      uploadDate: data.uploadDate,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    state.documents.set(id, item);
    const policy = item.policyId ? state.policies.get(item.policyId) : undefined;
    return {
      ...item,
      policyName: policy?.policyName,
      companyName: policy?.companyName,
    };
  },

  async deleteDocument(userId: string, id: number): Promise<DocumentItem | null> {
    const document = state.documents.get(id);
    if (!document || document.userId !== userId) return null;
    state.documents.delete(id);
    return document;
  },

  // Seed user data if empty
  async seedUserDataIfEmpty(userId: string, userName?: string): Promise<void> {
    const userPolicies = Array.from(state.policies.values()).filter((p) => p.userId === userId);
    if (userPolicies.length > 0) {
      return; // already seeded
    }

    const holder = userName || 'Kasthuri';

    // 1. LIC Jeevan Anand
    const p1 = await this.createPolicy(userId, {
      policyName: 'LIC Jeevan Anand',
      companyName: 'Life Insurance Corporation of India',
      policyNumber: 'LIC-78923410',
      policyType: 'Endowment',
      policyHolder: holder,
      startDate: '2024-01-10',
      endDate: '2044-01-10',
      premiumAmount: 2500,
      premiumFrequency: 'Monthly',
      nextDueDate: '2026-09-10',
      sumAssured: 1000000,
      paymentMethod: 'Net Banking',
      nomineeName: 'Priya Raman',
      nomineeRelation: 'Spouse',
      status: 'Active',
      notes: 'Endowment policy with double accidental benefit rider.',
    });

    // 2. HDFC Life Click 2 Protect
    const p2 = await this.createPolicy(userId, {
      policyName: 'HDFC Life Click 2 Protect',
      companyName: 'HDFC Life Insurance',
      policyNumber: 'HDFC-9912048',
      policyType: 'Term Life Insurance',
      policyHolder: holder,
      startDate: '2023-06-18',
      endDate: '2053-06-18',
      premiumAmount: 1800,
      premiumFrequency: 'Monthly',
      nextDueDate: '2026-09-18',
      sumAssured: 5000000,
      paymentMethod: 'UPI Auto-Debit',
      nomineeName: 'Ananya Raman',
      nomineeRelation: 'Daughter',
      status: 'Active',
      notes: 'Pure term plan with critical illness cover.',
    });

    // 3. ICICI Pru iProtect Smart
    const p3 = await this.createPolicy(userId, {
      policyName: 'ICICI Pru iProtect Smart',
      companyName: 'ICICI Prudential Life',
      policyNumber: 'ICICI-4418902',
      policyType: 'Term Life Insurance',
      policyHolder: holder,
      startDate: '2022-09-25',
      endDate: '2052-09-25',
      premiumAmount: 3200,
      premiumFrequency: 'Monthly',
      nextDueDate: '2026-09-25',
      sumAssured: 7500000,
      paymentMethod: 'Credit Card',
      nomineeName: 'Priya Raman',
      nomineeRelation: 'Spouse',
      status: 'Active',
      notes: 'Comprehensive term protection with waiver of premium.',
    });

    // Direct Expenses
    await this.createExpense(userId, {
      policyId: p1.id,
      expenseName: 'Monthly Premium - Aug 2026',
      expenseType: 'Direct',
      category: 'Premium',
      amount: 2500,
      expenseDate: '2026-08-10',
      paymentMethod: 'Net Banking',
      paymentStatus: 'Paid',
      notes: 'Paid on time via Net Banking',
    });

    await this.createExpense(userId, {
      policyId: p1.id,
      expenseName: 'Accidental Rider Premium',
      expenseType: 'Direct',
      category: 'Rider Premium',
      amount: 450,
      expenseDate: '2026-08-10',
      paymentMethod: 'Net Banking',
      paymentStatus: 'Paid',
      notes: 'Accidental disability & death rider',
    });

    await this.createExpense(userId, {
      policyId: p2.id,
      expenseName: 'Monthly Premium - Aug 2026',
      expenseType: 'Direct',
      category: 'Premium',
      amount: 1800,
      expenseDate: '2026-08-18',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      notes: 'Auto-debited via UPI',
    });

    await this.createExpense(userId, {
      policyId: p2.id,
      expenseName: 'Critical Illness Rider',
      expenseType: 'Direct',
      category: 'Rider Premium',
      amount: 600,
      expenseDate: '2026-08-18',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      notes: '34 critical illnesses covered',
    });

    await this.createExpense(userId, {
      policyId: p3.id,
      expenseName: 'Monthly Premium - Aug 2026',
      expenseType: 'Direct',
      category: 'Premium',
      amount: 3200,
      expenseDate: '2026-08-25',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      notes: 'Reward card used',
    });

    await this.createExpense(userId, {
      policyId: p3.id,
      expenseName: 'GST on Term Premium (18%)',
      expenseType: 'Direct',
      category: 'GST/Tax',
      amount: 576,
      expenseDate: '2026-08-25',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      notes: '18% GST component',
    });

    // Indirect Expenses
    await this.createExpense(userId, {
      policyId: p1.id,
      expenseName: 'Annual Agent Advisory Fee',
      expenseType: 'Indirect',
      category: 'Agent Commission',
      amount: 1200,
      expenseDate: '2026-07-15',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      notes: 'Advisory consultation & document assistance',
    });

    await this.createExpense(userId, {
      policyId: p2.id,
      expenseName: 'Medical Test & ECG Checkup',
      expenseType: 'Indirect',
      category: 'Medical Examination Fee',
      amount: 2200,
      expenseDate: '2026-06-20',
      paymentMethod: 'Debit Card',
      paymentStatus: 'Paid',
      notes: 'Pre-issuance home health checkup',
    });

    await this.createExpense(userId, {
      policyId: null,
      expenseName: 'Financial Planner Consultation',
      expenseType: 'Indirect',
      category: 'Consultation Fee',
      amount: 1500,
      expenseDate: '2026-08-05',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      notes: 'Portfolio review for family term insurance',
    });

    await this.createExpense(userId, {
      policyId: p1.id,
      expenseName: 'Physical Policy Courier & Stamp Duty',
      expenseType: 'Indirect',
      category: 'Documentation Charges',
      amount: 350,
      expenseDate: '2026-07-22',
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      notes: 'Stamp duty for policy bond',
    });

    // Paid Payments
    await this.createPayment(userId, {
      policyId: p1.id,
      amount: 2500,
      paymentDate: '2026-08-10',
      dueDate: '2026-08-10',
      paymentMethod: 'Net Banking',
      status: 'Paid',
      transactionReference: 'TXN-LIC-98124',
      notes: 'Successful receipt generated',
    });

    await this.createPayment(userId, {
      policyId: p2.id,
      amount: 1800,
      paymentDate: '2026-08-18',
      dueDate: '2026-08-18',
      paymentMethod: 'UPI',
      status: 'Paid',
      transactionReference: 'TXN-HDFC-55421',
      notes: 'Auto-debited successfully',
    });

    await this.createPayment(userId, {
      policyId: p3.id,
      amount: 3200,
      paymentDate: '2026-08-25',
      dueDate: '2026-08-25',
      paymentMethod: 'Credit Card',
      status: 'Paid',
      transactionReference: 'TXN-ICICI-33291',
      notes: 'Credit Card statement verified',
    });

    // Documents
    await this.createDocument(userId, {
      policyId: p1.id,
      documentName: 'LIC Jeevan Anand Policy Bond.pdf',
      documentType: 'Policy Document',
      fileUrl: '#doc-lic-bond',
      fileSize: '2.4 MB',
      uploadDate: '2024-01-15',
      notes: 'Original policy document with terms and conditions',
    });

    await this.createDocument(userId, {
      policyId: p1.id,
      documentName: 'LIC Premium Receipt - Aug 2026.pdf',
      documentType: 'Premium Receipt',
      fileUrl: '#doc-lic-receipt-aug',
      fileSize: '412 KB',
      uploadDate: '2026-08-10',
      notes: 'Tax exemption certificate 80C receipt',
    });

    await this.createDocument(userId, {
      policyId: p2.id,
      documentName: 'HDFC Life e-Policy Schedule.pdf',
      documentType: 'Policy Document',
      fileUrl: '#doc-hdfc-schedule',
      fileSize: '1.8 MB',
      uploadDate: '2023-06-20',
      notes: 'Digital policy certificate',
    });

    await this.createDocument(userId, {
      policyId: p3.id,
      documentName: 'ICICI Prudential Medical Underwriting Report.pdf',
      documentType: 'Medical Report',
      fileUrl: '#doc-icici-med',
      fileSize: '3.1 MB',
      uploadDate: '2022-09-20',
      notes: 'Full body medical checkup and TMT results approved',
    });
  },
};
