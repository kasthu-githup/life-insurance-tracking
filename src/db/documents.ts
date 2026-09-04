import { db, isDbConfigured } from './index.ts';
import { documents, policies } from './schema.ts';
import { and, eq, desc } from 'drizzle-orm';
import { memoryStore } from './memoryStore.ts';

export async function getDocuments(userId: string, policyId?: number) {
  if (!isDbConfigured) {
    return memoryStore.getDocuments(userId, policyId);
  }
  try {
    const conditions = [eq(documents.userId, userId)];
    if (policyId) {
      conditions.push(eq(documents.policyId, policyId));
    }

    const items = await db
      .select({
        id: documents.id,
        userId: documents.userId,
        policyId: documents.policyId,
        documentName: documents.documentName,
        documentType: documents.documentType,
        fileUrl: documents.fileUrl,
        fileSize: documents.fileSize,
        uploadDate: documents.uploadDate,
        notes: documents.notes,
        createdAt: documents.createdAt,
        policyName: policies.policyName,
        companyName: policies.companyName,
      })
      .from(documents)
      .leftJoin(policies, eq(documents.policyId, policies.id))
      .where(and(...conditions))
      .orderBy(desc(documents.uploadDate));

    return items;
  } catch (error) {
    console.warn('getDocuments SQL error, falling back to memory store:', error);
    return memoryStore.getDocuments(userId, policyId);
  }
}

export async function createDocument(
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
) {
  if (!isDbConfigured) {
    return memoryStore.createDocument(userId, data as any);
  }
  try {
    const inserted = await db
      .insert(documents)
      .values({
        userId,
        policyId: data.policyId ? Number(data.policyId) : null,
        documentName: data.documentName,
        documentType: data.documentType,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize || '1.2 MB',
        uploadDate: data.uploadDate,
        notes: data.notes || '',
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.warn('createDocument SQL error, falling back to memory store:', error);
    return memoryStore.createDocument(userId, data as any);
  }
}

export async function deleteDocument(userId: string, id: number) {
  if (!isDbConfigured) {
    return memoryStore.deleteDocument(userId, id);
  }
  try {
    const deleted = await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();
    return deleted[0] || null;
  } catch (error) {
    console.warn('deleteDocument SQL error, falling back to memory store:', error);
    return memoryStore.deleteDocument(userId, id);
  }
}

