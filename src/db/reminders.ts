import { db, isDbConfigured } from './index.ts';
import { reminders, policies } from './schema.ts';
import { and, eq, desc } from 'drizzle-orm';
import { memoryStore } from './memoryStore.ts';

export async function getReminders(userId: string) {
  if (!isDbConfigured) {
    return memoryStore.getReminders(userId);
  }
  try {
    const items = await db
      .select({
        id: reminders.id,
        userId: reminders.userId,
        policyId: reminders.policyId,
        title: reminders.title,
        reminderType: reminders.reminderType,
        dueDate: reminders.dueDate,
        remindDaysBefore: reminders.remindDaysBefore,
        isRead: reminders.isRead,
        isDismissed: reminders.isDismissed,
        createdAt: reminders.createdAt,
        policyName: policies.policyName,
        companyName: policies.companyName,
      })
      .from(reminders)
      .leftJoin(policies, eq(reminders.policyId, policies.id))
      .where(and(eq(reminders.userId, userId), eq(reminders.isDismissed, false)))
      .orderBy(desc(reminders.dueDate));

    return items;
  } catch (error) {
    console.warn('getReminders SQL error, falling back to memory store:', error);
    return memoryStore.getReminders(userId);
  }
}

export async function createReminder(
  userId: string,
  data: {
    policyId?: number;
    title: string;
    reminderType: string;
    dueDate: string;
    remindDaysBefore?: number;
  }
) {
  if (!isDbConfigured) {
    return memoryStore.createReminder(userId, data as any);
  }
  try {
    const inserted = await db
      .insert(reminders)
      .values({
        userId,
        policyId: data.policyId ? Number(data.policyId) : null,
        title: data.title,
        reminderType: data.reminderType,
        dueDate: data.dueDate,
        remindDaysBefore: data.remindDaysBefore || 7,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.warn('createReminder SQL error, falling back to memory store:', error);
    return memoryStore.createReminder(userId, data as any);
  }
}

export async function markReminderRead(userId: string, id: number) {
  if (!isDbConfigured) {
    return memoryStore.markReminderRead(userId, id);
  }
  try {
    const updated = await db
      .update(reminders)
      .set({ isRead: true })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.warn('markReminderRead SQL error, falling back to memory store:', error);
    return memoryStore.markReminderRead(userId, id);
  }
}

export async function dismissReminder(userId: string, id: number) {
  if (!isDbConfigured) {
    return memoryStore.dismissReminder(userId, id);
  }
  try {
    const updated = await db
      .update(reminders)
      .set({ isDismissed: true })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.warn('dismissReminder SQL error, falling back to memory store:', error);
    return memoryStore.dismissReminder(userId, id);
  }
}

export async function deleteReminder(userId: string, id: number) {
  if (!isDbConfigured) {
    return memoryStore.deleteReminder(userId, id);
  }
  try {
    const deleted = await db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return deleted[0] || null;
  } catch (error) {
    console.warn('deleteReminder SQL error, falling back to memory store:', error);
    return memoryStore.deleteReminder(userId, id);
  }
}


