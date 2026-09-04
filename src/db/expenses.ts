import { db, isDbConfigured } from './index.ts';
import { expenses, policies } from './schema.ts';
import { and, eq, desc } from 'drizzle-orm';
import { memoryStore } from './memoryStore.ts';

export async function getExpenses(
  userId: string,
  filters?: {
    policyId?: number;
    expenseType?: string; // 'Direct' | 'Indirect'
    category?: string;
    paymentStatus?: string;
  }
) {
  if (!isDbConfigured) {
    return memoryStore.getExpenses(userId, filters);
  }
  try {
    const conditions = [eq(expenses.userId, userId)];

    if (filters?.policyId) {
      conditions.push(eq(expenses.policyId, filters.policyId));
    }
    if (filters?.expenseType && filters.expenseType !== 'All') {
      conditions.push(eq(expenses.expenseType, filters.expenseType));
    }
    if (filters?.category && filters.category !== 'All') {
      conditions.push(eq(expenses.category, filters.category));
    }
    if (filters?.paymentStatus && filters.paymentStatus !== 'All') {
      conditions.push(eq(expenses.paymentStatus, filters.paymentStatus));
    }

    const items = await db
      .select({
        id: expenses.id,
        userId: expenses.userId,
        policyId: expenses.policyId,
        expenseName: expenses.expenseName,
        expenseType: expenses.expenseType,
        category: expenses.category,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        paymentMethod: expenses.paymentMethod,
        paymentStatus: expenses.paymentStatus,
        receiptUrl: expenses.receiptUrl,
        notes: expenses.notes,
        createdAt: expenses.createdAt,
        policyName: policies.policyName,
        companyName: policies.companyName,
      })
      .from(expenses)
      .leftJoin(policies, eq(expenses.policyId, policies.id))
      .where(and(...conditions))
      .orderBy(desc(expenses.expenseDate));

    return items;
  } catch (error) {
    console.warn('getExpenses SQL error, falling back to memory store:', error);
    return memoryStore.getExpenses(userId, filters);
  }
}

export async function createExpense(
  userId: string,
  data: {
    policyId?: number | null;
    expenseName: string;
    expenseType: string;
    category: string;
    amount: number;
    expenseDate: string;
    paymentMethod: string;
    paymentStatus?: string;
    receiptUrl?: string;
    notes?: string;
  }
) {
  if (!isDbConfigured) {
    return memoryStore.createExpense(userId, data as any);
  }
  try {
    const inserted = await db
      .insert(expenses)
      .values({
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
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.warn('createExpense SQL error, falling back to memory store:', error);
    return memoryStore.createExpense(userId, data as any);
  }
}

export async function updateExpense(
  userId: string,
  id: number,
  data: Partial<typeof expenses.$inferInsert>
) {
  if (!isDbConfigured) {
    return memoryStore.updateExpense(userId, id, data as any);
  }
  try {
    const updated = await db
      .update(expenses)
      .set(data)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.warn('updateExpense SQL error, falling back to memory store:', error);
    return memoryStore.updateExpense(userId, id, data as any);
  }
}

export async function deleteExpense(userId: string, id: number) {
  if (!isDbConfigured) {
    return memoryStore.deleteExpense(userId, id);
  }
  try {
    const deleted = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return deleted[0] || null;
  } catch (error) {
    console.warn('deleteExpense SQL error, falling back to memory store:', error);
    return memoryStore.deleteExpense(userId, id);
  }
}

