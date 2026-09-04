import { db, isDbConfigured } from './index.ts';
import { payments, policies, expenses } from './schema.ts';
import { and, eq, desc } from 'drizzle-orm';
import { memoryStore } from './memoryStore.ts';

export async function getPayments(userId: string, policyId?: number) {
  if (!isDbConfigured) {
    return memoryStore.getPayments(userId, policyId);
  }
  try {
    const conditions = [eq(payments.userId, userId)];
    if (policyId) {
      conditions.push(eq(payments.policyId, policyId));
    }

    const items = await db
      .select({
        id: payments.id,
        userId: payments.userId,
        policyId: payments.policyId,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        dueDate: payments.dueDate,
        paymentMethod: payments.paymentMethod,
        status: payments.status,
        transactionReference: payments.transactionReference,
        receiptUrl: payments.receiptUrl,
        notes: payments.notes,
        createdAt: payments.createdAt,
        policyName: policies.policyName,
        companyName: policies.companyName,
        policyNumber: policies.policyNumber,
      })
      .from(payments)
      .leftJoin(policies, eq(payments.policyId, policies.id))
      .where(and(...conditions))
      .orderBy(desc(payments.dueDate));

    return items;
  } catch (error) {
    console.warn('getPayments SQL error, falling back to memory store:', error);
    return memoryStore.getPayments(userId, policyId);
  }
}

export async function createPayment(
  userId: string,
  data: {
    policyId: number;
    amount: number;
    dueDate: string;
    paymentDate?: string;
    paymentMethod?: string;
    status?: string;
    transactionReference?: string;
    receiptUrl?: string;
    notes?: string;
  }
) {
  if (!isDbConfigured) {
    return memoryStore.createPayment(userId, data as any);
  }
  try {
    const inserted = await db
      .insert(payments)
      .values({
        userId,
        policyId: Number(data.policyId),
        amount: Number(data.amount),
        dueDate: data.dueDate,
        paymentDate: data.paymentDate || null,
        paymentMethod: data.paymentMethod || 'Net Banking',
        status: data.status || 'Upcoming',
        transactionReference: data.transactionReference || '',
        receiptUrl: data.receiptUrl || '',
        notes: data.notes || '',
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.warn('createPayment SQL error, falling back to memory store:', error);
    return memoryStore.createPayment(userId, data as any);
  }
}

export async function recordPaymentCompletion(
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
) {
  if (!isDbConfigured) {
    return memoryStore.recordPaymentCompletion(userId, paymentId, details);
  }
  try {
    const updatedPayment = await db
      .update(payments)
      .set({
        status: 'Paid',
        paymentDate: details.paymentDate,
        paymentMethod: details.paymentMethod,
        transactionReference: details.transactionReference || '',
        receiptUrl: details.receiptUrl || '',
        notes: details.notes || '',
      })
      .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)))
      .returning();

    if (!updatedPayment.length) return null;
    const paid = updatedPayment[0];

    // Optionally create an expense record as well
    if (details.createExpenseRecord) {
      const policyList = await db
        .select()
        .from(policies)
        .where(eq(policies.id, paid.policyId))
        .limit(1);

      const policyName = policyList[0]?.policyName || 'Policy Premium';

      await db.insert(expenses).values({
        userId,
        policyId: paid.policyId,
        expenseName: `Premium: ${policyName}`,
        expenseType: 'Direct',
        category: 'Premium',
        amount: paid.amount,
        expenseDate: details.paymentDate,
        paymentMethod: details.paymentMethod,
        paymentStatus: 'Paid',
        receiptUrl: details.receiptUrl || '',
        notes: `Recorded via payment confirmation. Ref: ${details.transactionReference || 'N/A'}`,
      });
    }

    return paid;
  } catch (error) {
    console.warn('recordPaymentCompletion SQL error, falling back to memory store:', error);
    return memoryStore.recordPaymentCompletion(userId, paymentId, details);
  }
}

