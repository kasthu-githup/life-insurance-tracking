import { db, isDbConfigured } from './index.ts';
import { policies, expenses, payments, beneficiaries, documents, reminders } from './schema.ts';
import { eq } from 'drizzle-orm';
import { memoryStore } from './memoryStore.ts';

export async function seedUserDataIfEmpty(userId: string, userName?: string) {
  if (!isDbConfigured) {
    return memoryStore.seedUserDataIfEmpty(userId, userName);
  }
  try {
    const existing = await db
      .select({ id: policies.id })
      .from(policies)
      .where(eq(policies.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return; // Already has data
    }


    const holder = userName || 'Kasthuri';

    // 1. Insert Policy 1: LIC Jeevan Anand
    const [p1] = await db
      .insert(policies)
      .values({
        userId,
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
      })
      .returning();

    // 2. Insert Policy 2: HDFC Life Click 2 Protect
    const [p2] = await db
      .insert(policies)
      .values({
        userId,
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
      })
      .returning();

    // 3. Insert Policy 3: ICICI Pru iProtect Smart
    const [p3] = await db
      .insert(policies)
      .values({
        userId,
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
      })
      .returning();

    // Beneficiaries
    await db.insert(beneficiaries).values([
      {
        userId,
        policyId: p1.id,
        name: 'Priya Raman',
        relationship: 'Spouse',
        sharePercentage: 100,
        phone: '+91 98765 43210',
        email: 'priya.raman@example.com',
      },
      {
        userId,
        policyId: p2.id,
        name: 'Ananya Raman',
        relationship: 'Daughter',
        sharePercentage: 100,
        phone: '+91 98765 43211',
      },
      {
        userId,
        policyId: p3.id,
        name: 'Priya Raman',
        relationship: 'Spouse',
        sharePercentage: 100,
        phone: '+91 98765 43210',
      },
    ]);

    // Direct Expenses
    await db.insert(expenses).values([
      {
        userId,
        policyId: p1.id,
        expenseName: 'Monthly Premium - Aug 2026',
        expenseType: 'Direct',
        category: 'Premium',
        amount: 2500,
        expenseDate: '2026-08-10',
        paymentMethod: 'Net Banking',
        paymentStatus: 'Paid',
        notes: 'Paid on time via Net Banking',
      },
      {
        userId,
        policyId: p1.id,
        expenseName: 'Accidental Rider Premium',
        expenseType: 'Direct',
        category: 'Rider Premium',
        amount: 450,
        expenseDate: '2026-08-10',
        paymentMethod: 'Net Banking',
        paymentStatus: 'Paid',
        notes: 'Accidental disability & death rider',
      },
      {
        userId,
        policyId: p2.id,
        expenseName: 'Monthly Premium - Aug 2026',
        expenseType: 'Direct',
        category: 'Premium',
        amount: 1800,
        expenseDate: '2026-08-18',
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        notes: 'Auto-debited via UPI',
      },
      {
        userId,
        policyId: p2.id,
        expenseName: 'Critical Illness Rider',
        expenseType: 'Direct',
        category: 'Rider Premium',
        amount: 600,
        expenseDate: '2026-08-18',
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        notes: '34 critical illnesses covered',
      },
      {
        userId,
        policyId: p3.id,
        expenseName: 'Monthly Premium - Aug 2026',
        expenseType: 'Direct',
        category: 'Premium',
        amount: 3200,
        expenseDate: '2026-08-25',
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        notes: 'Reward card used',
      },
      {
        userId,
        policyId: p3.id,
        expenseName: 'GST on Term Premium (18%)',
        expenseType: 'Direct',
        category: 'GST/Tax',
        amount: 576,
        expenseDate: '2026-08-25',
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        notes: '18% GST component',
      },
      // Indirect Expenses
      {
        userId,
        policyId: p1.id,
        expenseName: 'Annual Agent Advisory Fee',
        expenseType: 'Indirect',
        category: 'Agent Commission',
        amount: 1200,
        expenseDate: '2026-07-15',
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        notes: 'Advisory consultation & document assistance',
      },
      {
        userId,
        policyId: p2.id,
        expenseName: 'Medical Test & ECG Checkup',
        expenseType: 'Indirect',
        category: 'Medical Examination Fee',
        amount: 2200,
        expenseDate: '2026-06-20',
        paymentMethod: 'Debit Card',
        paymentStatus: 'Paid',
        notes: 'Pre-issuance home health checkup',
      },
      {
        userId,
        policyId: null,
        expenseName: 'Financial Planner Consultation',
        expenseType: 'Indirect',
        category: 'Consultation Fee',
        amount: 1500,
        expenseDate: '2026-08-05',
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        notes: 'Portfolio review for family term insurance',
      },
      {
        userId,
        policyId: p1.id,
        expenseName: 'Physical Policy Courier & Stamp Duty',
        expenseType: 'Indirect',
        category: 'Documentation Charges',
        amount: 350,
        expenseDate: '2026-07-22',
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        notes: 'Stamp duty for policy bond',
      },
    ]);

    // Payments schedule & history
    await db.insert(payments).values([
      // Paid
      {
        userId,
        policyId: p1.id,
        amount: 2500,
        paymentDate: '2026-08-10',
        dueDate: '2026-08-10',
        paymentMethod: 'Net Banking',
        status: 'Paid',
        transactionReference: 'TXN-LIC-98124',
        notes: 'Successful receipt generated',
      },
      {
        userId,
        policyId: p2.id,
        amount: 1800,
        paymentDate: '2026-08-18',
        dueDate: '2026-08-18',
        paymentMethod: 'UPI',
        status: 'Paid',
        transactionReference: 'TXN-HDFC-55421',
        notes: 'Auto-debited successfully',
      },
      {
        userId,
        policyId: p3.id,
        amount: 3200,
        paymentDate: '2026-08-25',
        dueDate: '2026-08-25',
        paymentMethod: 'Credit Card',
        status: 'Paid',
        transactionReference: 'TXN-ICICI-33291',
        notes: 'Credit Card statement verified',
      },
      // Upcoming in Sep 2026
      {
        userId,
        policyId: p1.id,
        amount: 2500,
        dueDate: '2026-09-10',
        paymentMethod: 'Net Banking',
        status: 'Upcoming',
        notes: 'LIC premium due Sep 10',
      },
      {
        userId,
        policyId: p2.id,
        amount: 1800,
        dueDate: '2026-09-18',
        paymentMethod: 'UPI',
        status: 'Upcoming',
        notes: 'HDFC Life premium due Sep 18',
      },
      {
        userId,
        policyId: p3.id,
        amount: 3200,
        dueDate: '2026-09-25',
        paymentMethod: 'Credit Card',
        status: 'Upcoming',
        notes: 'ICICI Prudential premium due Sep 25',
      },
    ]);

    // Reminders
    await db.insert(reminders).values([
      {
        userId,
        policyId: p1.id,
        title: 'LIC Jeevan Anand Premium Due (₹2,500)',
        reminderType: 'Premium Due',
        dueDate: '2026-09-10',
        remindDaysBefore: 7,
      },
      {
        userId,
        policyId: p2.id,
        title: 'HDFC Life Click 2 Protect Due (₹1,800)',
        reminderType: 'Premium Due',
        dueDate: '2026-09-18',
        remindDaysBefore: 5,
      },
      {
        userId,
        policyId: p3.id,
        title: 'ICICI Pru iProtect Smart Premium Due (₹3,200)',
        reminderType: 'Premium Due',
        dueDate: '2026-09-25',
        remindDaysBefore: 7,
      },
    ]);

    // Documents
    await db.insert(documents).values([
      {
        userId,
        policyId: p1.id,
        documentName: 'LIC Jeevan Anand Policy Bond.pdf',
        documentType: 'Policy Document',
        fileUrl: '#doc-lic-bond',
        fileSize: '2.4 MB',
        uploadDate: '2024-01-15',
        notes: 'Original policy document with terms and conditions',
      },
      {
        userId,
        policyId: p1.id,
        documentName: 'LIC Premium Receipt - Aug 2026.pdf',
        documentType: 'Premium Receipt',
        fileUrl: '#doc-lic-receipt-aug',
        fileSize: '412 KB',
        uploadDate: '2026-08-10',
        notes: 'Tax exemption certificate 80C receipt',
      },
      {
        userId,
        policyId: p2.id,
        documentName: 'HDFC Life e-Policy Schedule.pdf',
        documentType: 'Policy Document',
        fileUrl: '#doc-hdfc-schedule',
        fileSize: '1.8 MB',
        uploadDate: '2023-06-20',
        notes: 'Digital policy certificate',
      },
      {
        userId,
        policyId: p3.id,
        documentName: 'ICICI Prudential Medical Underwriting Report.pdf',
        documentType: 'Medical Report',
        fileUrl: '#doc-icici-med',
        fileSize: '3.1 MB',
        uploadDate: '2022-09-20',
        notes: 'Full body medical checkup and TMT results approved',
      },
    ]);
  } catch (error) {
    console.warn('seedUserDataIfEmpty SQL error, falling back to memory store:', error);
    await memoryStore.seedUserDataIfEmpty(userId, userName);
  }
}
