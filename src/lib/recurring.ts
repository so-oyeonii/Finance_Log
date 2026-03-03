import { db, getSetting, setSetting } from './db';

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function getNextDate(currentDate: string, frequency: 'monthly' | 'weekly' | 'yearly'): string {
  switch (frequency) {
    case 'monthly': return addMonths(currentDate, 1);
    case 'weekly': return addWeeks(currentDate, 1);
    case 'yearly': return addYears(currentDate, 1);
  }
}

export async function processRecurringTransactions(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);

  // Check if already processed today
  const lastProcessed = await getSetting<string>('lastRecurringProcessDate', '');
  if (lastProcessed === today) return 0;

  const activeRecurring = await db.recurring
    .where('isActive')
    .equals(1)
    .toArray();

  let createdCount = 0;

  for (const rec of activeRecurring) {
    let nextDate = rec.nextDate;

    // Create transactions for all missed dates up to today
    while (nextDate <= today) {
      await db.transactions.add({
        date: nextDate,
        type: rec.type,
        category: rec.category,
        amount: rec.amount,
        memo: rec.memo ? `${rec.memo} (정기)` : '(정기)',
        accountId: rec.accountId,
        isDutchPay: false,
        recurringId: rec.id,
        createdAt: new Date().toISOString(),
      });

      // Update account balance
      if (rec.type === 'expense') {
        await db.accounts.where('id').equals(rec.accountId).modify((acc) => {
          acc.balance -= rec.amount;
          acc.updatedAt = new Date().toISOString();
        });
      } else if (rec.type === 'income') {
        await db.accounts.where('id').equals(rec.accountId).modify((acc) => {
          acc.balance += rec.amount;
          acc.updatedAt = new Date().toISOString();
        });
      }

      createdCount++;
      nextDate = getNextDate(nextDate, rec.frequency);
    }

    // Update nextDate on recurring record
    if (nextDate !== rec.nextDate) {
      await db.recurring.update(rec.id!, { nextDate });
    }
  }

  // Mark as processed today
  await setSetting('lastRecurringProcessDate', today);

  return createdCount;
}
