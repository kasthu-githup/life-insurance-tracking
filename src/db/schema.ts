import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name').default(''),
  phone: text('phone').default(''),
  address: text('address').default(''),
  dob: text('dob').default(''),
  currency: text('currency').default('INR'),
  darkMode: boolean('dark_mode').default(false),
  emailNotifications: boolean('email_notifications').default(true),
  reminderDays: integer('reminder_days').default(7),
  createdAt: timestamp('created_at').defaultNow(),
});

// Policies table
export const policies = pgTable('policies', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  policyName: text('policy_name').notNull(),
  companyName: text('company_name').notNull(),
  policyNumber: text('policy_number').notNull(),
  policyType: text('policy_type').notNull(),
  policyHolder: text('policy_holder').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  premiumAmount: doublePrecision('premium_amount').notNull(),
  premiumFrequency: text('premium_frequency').notNull(), // Monthly, Quarterly, Half-Yearly, Yearly
  nextDueDate: text('next_due_date').notNull(),
  sumAssured: doublePrecision('sum_assured').default(0),
  paymentMethod: text('payment_method').default('Net Banking'),
  nomineeName: text('nominee_name').default(''),
  nomineeRelation: text('nominee_relation').default(''),
  status: text('status').notNull().default('Active'), // Active, Lapsed, Matured, Surrendered
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Expenses table (Direct and Indirect)
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  policyId: integer('policy_id').references(() => policies.id, { onDelete: 'cascade' }),
  expenseName: text('expense_name').notNull(),
  expenseType: text('expense_type').notNull(), // 'Direct' or 'Indirect'
  category: text('category').notNull(), // e.g. Premium, Rider Premium, Agent Commission, Travel Expense, etc.
  amount: doublePrecision('amount').notNull(),
  expenseDate: text('expense_date').notNull(),
  paymentMethod: text('payment_method').notNull().default('UPI'),
  paymentStatus: text('payment_status').notNull().default('Paid'), // 'Paid', 'Pending'
  receiptUrl: text('receipt_url').default(''),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Payments table (Premium payment tracking & history)
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  policyId: integer('policy_id').references(() => policies.id, { onDelete: 'cascade' }).notNull(),
  amount: doublePrecision('amount').notNull(),
  paymentDate: text('payment_date'),
  dueDate: text('due_date').notNull(),
  paymentMethod: text('payment_method').default('Net Banking'),
  status: text('status').notNull().default('Upcoming'), // 'Paid', 'Upcoming', 'Overdue', 'Failed'
  transactionReference: text('transaction_reference').default(''),
  receiptUrl: text('receipt_url').default(''),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reminders table
export const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  policyId: integer('policy_id').references(() => policies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  reminderType: text('reminder_type').notNull(), // 'Premium Due', 'Policy Expiry', 'Renewal', 'Payment'
  dueDate: text('due_date').notNull(),
  remindDaysBefore: integer('remind_days_before').notNull().default(7),
  isRead: boolean('is_read').default(false),
  isDismissed: boolean('is_dismissed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Documents metadata table
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  policyId: integer('policy_id').references(() => policies.id, { onDelete: 'cascade' }),
  documentName: text('document_name').notNull(),
  documentType: text('document_type').notNull(), // 'Policy Document', 'Premium Receipt', 'Medical Report', etc.
  fileUrl: text('file_url').notNull(),
  fileSize: text('file_size').default(''),
  uploadDate: text('upload_date').notNull(),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Beneficiaries table
export const beneficiaries = pgTable('beneficiaries', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  policyId: integer('policy_id').references(() => policies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  relationship: text('relationship').notNull(),
  sharePercentage: doublePrecision('share_percentage').default(100),
  phone: text('phone').default(''),
  email: text('email').default(''),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const policiesRelations = relations(policies, ({ many }) => ({
  expenses: many(expenses),
  payments: many(payments),
  documents: many(documents),
  beneficiaries: many(beneficiaries),
  reminders: many(reminders),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  policy: one(policies, {
    fields: [expenses.policyId],
    references: [policies.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  policy: one(policies, {
    fields: [payments.policyId],
    references: [policies.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  policy: one(policies, {
    fields: [documents.policyId],
    references: [policies.id],
  }),
}));

export const beneficiariesRelations = relations(beneficiaries, ({ one }) => ({
  policy: one(policies, {
    fields: [beneficiaries.policyId],
    references: [policies.id],
  }),
}));
