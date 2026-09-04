export type PolicyType =
  | 'Term Life Insurance'
  | 'Whole Life'
  | 'Endowment'
  | 'ULIP'
  | 'Money Back'
  | 'Child Insurance'
  | 'Other';

export type PremiumFrequency = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';

export type PolicyStatus = 'Active' | 'Lapsed' | 'Matured' | 'Surrendered';

export type ExpenseType = 'Direct' | 'Indirect';

export type DirectCategory =
  | 'Premium'
  | 'Renewal Charges'
  | 'Policy Fees'
  | 'Rider Premium'
  | 'Late Payment Fee'
  | 'GST/Tax'
  | 'Medical Examination Fee';

export type IndirectCategory =
  | 'Agent Commission'
  | 'Travel Expense'
  | 'Documentation Charges'
  | 'Bank Charges'
  | 'Service Charges'
  | 'Consultation Fee'
  | 'Courier Charges'
  | 'Other';

export type PaymentStatus = 'Paid' | 'Upcoming' | 'Overdue' | 'Failed';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  dob: string;
  currency: string;
  darkMode: boolean;
  emailNotifications: boolean;
  reminderDays: number;
  createdAt: string;
}

export interface Policy {
  id: number;
  userId: string;
  policyName: string;
  companyName: string;
  policyNumber: string;
  policyType: PolicyType;
  policyHolder: string;
  startDate: string;
  endDate?: string;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  nextDueDate: string;
  sumAssured: number;
  paymentMethod: string;
  nomineeName: string;
  nomineeRelation: string;
  status: PolicyStatus;
  notes: string;
  createdAt: string;
  expenses?: ExpenseItem[];
  payments?: PaymentItem[];
  beneficiaries?: BeneficiaryItem[];
  documents?: DocumentItem[];
}

export interface ExpenseItem {
  id: number;
  userId: string;
  policyId: number | null;
  expenseName: string;
  expenseType: ExpenseType;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  paymentStatus: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  policyName?: string;
  companyName?: string;
}

export interface PaymentItem {
  id: number;
  userId: string;
  policyId: number;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  paymentMethod?: string;
  status: PaymentStatus;
  transactionReference?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  policyName?: string;
  companyName?: string;
  policyNumber?: string;
}

export interface ReminderItem {
  id: number;
  userId: string;
  policyId: number | null;
  title: string;
  reminderType: string;
  dueDate: string;
  remindDaysBefore: number;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  policyName?: string;
  companyName?: string;
}

export interface DocumentItem {
  id: number;
  userId: string;
  policyId: number | null;
  documentName: string;
  documentType: string;
  fileUrl: string;
  fileSize: string;
  uploadDate: string;
  notes?: string;
  createdAt: string;
  policyName?: string;
  companyName?: string;
}

export interface BeneficiaryItem {
  id: number;
  userId: string;
  policyId: number;
  name: string;
  relationship: string;
  sharePercentage: number;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardData {
  summary: {
    totalExpenses: number;
    paidThisMonth: number;
    upcomingPremiumsCount: number;
    upcomingPremiumsAmount: number;
    overdueCount: number;
    overdueAmount: number;
    activePoliciesCount: number;
    totalPoliciesCount: number;
    annualInsuranceCost: number;
  };
  directVsIndirect: {
    directTotal: number;
    indirectTotal: number;
    directPercentage: number;
    indirectPercentage: number;
  };
  monthlyChart: Array<{
    label: string;
    direct: number;
    indirect: number;
    total: number;
  }>;
  policyWiseExpenses: Array<{
    name: string;
    amount: number;
  }>;
  upcomingPayments: PaymentItem[];
  activePolicies: Policy[];
  reminders: ReminderItem[];
}
