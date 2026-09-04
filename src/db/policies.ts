import { db, isDbConfigured } from './index.ts';
import { policies, expenses, payments, beneficiaries, documents, reminders } from './schema.ts';
import { and, eq, desc } from 'drizzle-orm';
import { memoryStore } from './memoryStore.ts';

export async function getPolicies(userId: string) {
  if (!isDbConfigured) {
    return memoryStore.getPolicies(userId);
  }
  try {
    return await db
      .select()
      .from(policies)
      .where(eq(policies.userId, userId))
      .orderBy(desc(policies.createdAt));
  } catch (error) {
    console.warn('getPolicies SQL error, falling back to memory store:', error);
    return memoryStore.getPolicies(userId);
  }
}

export async function getPolicyById(userId: string, id: number) {
  if (!isDbConfigured) {
    return memoryStore.getPolicyById(userId, id);
  }
  try {
    const policyList = await db
      .select()
      .from(policies)
      .where(and(eq(policies.id, id), eq(policies.userId, userId)))
      .limit(1);

    if (!policyList.length) return null;

    const policy = policyList[0];
    const policyExpenses = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.policyId, id), eq(expenses.userId, userId)))
      .orderBy(desc(expenses.expenseDate));

    const policyPayments = await db
      .select()
      .from(payments)
      .where(and(eq(payments.policyId, id), eq(payments.userId, userId)))
      .orderBy(desc(payments.dueDate));

    const policyBeneficiaries = await db
      .select()
      .from(beneficiaries)
      .where(and(eq(beneficiaries.policyId, id), eq(beneficiaries.userId, userId)));

    const policyDocs = await db
      .select()
      .from(documents)
      .where(and(eq(documents.policyId, id), eq(documents.userId, userId)));

    return {
      ...policy,
      expenses: policyExpenses,
      payments: policyPayments,
      beneficiaries: policyBeneficiaries,
      documents: policyDocs,
    };
  } catch (error) {
    console.warn('getPolicyById SQL error, falling back to memory store:', error);
    return memoryStore.getPolicyById(userId, id);
  }
}

export async function createPolicy(
  userId: string,
  data: {
    policyName: string;
    companyName: string;
    policyNumber: string;
    policyType: string;
    policyHolder: string;
    startDate: string;
    endDate?: string;
    premiumAmount: number;
    premiumFrequency: string;
    nextDueDate: string;
    sumAssured?: number;
    paymentMethod?: string;
    nomineeName?: string;
    nomineeRelation?: string;
    status?: string;
    notes?: string;
  }
) {
  if (!isDbConfigured) {
    return memoryStore.createPolicy(userId, data as any);
  }
  try {
    const inserted = await db
      .insert(policies)
      .values({
        userId,
        policyName: data.policyName,
        companyName: data.companyName,
        policyNumber: data.policyNumber,
        policyType: data.policyType,
        policyHolder: data.policyHolder,
        startDate: data.startDate,
        endDate: data.endDate || null,
        premiumAmount: Number(data.premiumAmount),
        premiumFrequency: data.premiumFrequency,
        nextDueDate: data.nextDueDate,
        sumAssured: Number(data.sumAssured || 0),
        paymentMethod: data.paymentMethod || 'Net Banking',
        nomineeName: data.nomineeName || '',
        nomineeRelation: data.nomineeRelation || '',
        status: data.status || 'Active',
        notes: data.notes || '',
      })
      .returning();

    const newPolicy = inserted[0];

    // Automatically create the upcoming payment schedule for this policy
    await db.insert(payments).values({
      userId,
      policyId: newPolicy.id,
      amount: newPolicy.premiumAmount,
      dueDate: newPolicy.nextDueDate,
      status: 'Upcoming',
      paymentMethod: newPolicy.paymentMethod || 'Net Banking',
      notes: `Scheduled ${newPolicy.premiumFrequency} premium for ${newPolicy.policyName}`,
    });

    // Create a reminder
    await db.insert(reminders).values({
      userId,
      policyId: newPolicy.id,
      title: `${newPolicy.policyName} Premium Due`,
      reminderType: 'Premium Due',
      dueDate: newPolicy.nextDueDate,
      remindDaysBefore: 7,
    });

    if (data.nomineeName) {
      await db.insert(beneficiaries).values({
        userId,
        policyId: newPolicy.id,
        name: data.nomineeName,
        relationship: data.nomineeRelation || 'Nominee',
        sharePercentage: 100,
      });
    }

    return newPolicy;
  } catch (error) {
    console.warn('createPolicy SQL error, falling back to memory store:', error);
    return memoryStore.createPolicy(userId, data as any);
  }
}

export async function updatePolicy(
  userId: string,
  id: number,
  data: Partial<typeof policies.$inferInsert>
) {
  if (!isDbConfigured) {
    return memoryStore.updatePolicy(userId, id, data as any);
  }
  try {
    const updated = await db
      .update(policies)
      .set(data)
      .where(and(eq(policies.id, id), eq(policies.userId, userId)))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.warn('updatePolicy SQL error, falling back to memory store:', error);
    return memoryStore.updatePolicy(userId, id, data as any);
  }
}

export async function deletePolicy(userId: string, id: number) {
  if (!isDbConfigured) {
    return memoryStore.deletePolicy(userId, id);
  }
  try {
    // Safely delete all policy-dependent child records first
    await db.delete(payments).where(and(eq(payments.policyId, id), eq(payments.userId, userId)));
    await db.delete(expenses).where(and(eq(expenses.policyId, id), eq(expenses.userId, userId)));
    await db.delete(reminders).where(and(eq(reminders.policyId, id), eq(reminders.userId, userId)));
    await db.delete(documents).where(and(eq(documents.policyId, id), eq(documents.userId, userId)));
    await db.delete(beneficiaries).where(and(eq(beneficiaries.policyId, id), eq(beneficiaries.userId, userId)));

    const deleted = await db
      .delete(policies)
      .where(and(eq(policies.id, id), eq(policies.userId, userId)))
      .returning();
    return deleted[0] || null;
  } catch (error) {
    console.warn('deletePolicy SQL error, falling back to memory store:', error);
    return memoryStore.deletePolicy(userId, id);
  }
}

