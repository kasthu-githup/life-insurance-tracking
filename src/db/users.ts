import { db, isDbConfigured } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';
import { memoryStore } from './memoryStore.ts';

export async function getOrCreateUser(uid: string, email: string, fullName?: string) {
  if (!isDbConfigured) {
    return memoryStore.getOrCreateUser(uid, email, fullName);
  }
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      if (fullName && !existing[0].fullName) {
        const updated = await db
          .update(users)
          .set({ fullName })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return existing[0];
    }

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email: email || `${uid}@example.com`,
        fullName: fullName || '',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          ...(fullName ? { fullName } : {}),
        },
      })
      .returning();
    return inserted[0];
  } catch (error: any) {
    // If a concurrent insert already succeeded, fetch and return the existing record safely
    try {
      const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      if (existing.length > 0) {
        return existing[0];
      }
    } catch {
      // ignore
    }
    console.warn('getOrCreateUser SQL error, falling back to memory store:', error);
    return memoryStore.getOrCreateUser(uid, email, fullName);
  }
}

export async function getUserProfile(uid: string) {
  if (!isDbConfigured) {
    return memoryStore.getUserProfile(uid);
  }
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.warn('getUserProfile SQL error, falling back to memory store:', error);
    return memoryStore.getUserProfile(uid);
  }
}

export async function updateUserProfile(
  uid: string,
  data: Partial<typeof users.$inferInsert>
) {
  if (!isDbConfigured) {
    return memoryStore.updateUserProfile(uid, data as any);
  }
  try {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.warn('updateUserProfile SQL error, falling back to memory store:', error);
    return memoryStore.updateUserProfile(uid, data as any);
  }
}

