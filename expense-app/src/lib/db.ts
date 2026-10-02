import Dexie, { type Table } from 'dexie';
import type {
  Transaction,
  Category,
  AppSettings,
  MonthlySummary,
  BackupPayload,
} from './types';
import { DEFAULT_CATEGORIES } from './categories';
import { monthRange, todayLocal } from './format';

class AppDB extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  settings!: Table<AppSettings, string>;
  meta!: Table<{ key: string; value: string }, string>;

  constructor() {
    super('expense-app');

    this.version(1).stores({
      transactions: 'id, date, categoryId, type, updatedAt',
      categories: 'id, type',
      settings: 'id',
      meta: 'key',
    });
  }
}

export const db = new AppDB();

const DEFAULT_SETTINGS: AppSettings = {
  id: 'app',
  currency: 'INR',
  locale: 'en-IN',
  monthStartDay: 1,
  autoBackup: false,
  backupIntervalMin: 30,
};

export async function seedIfEmpty(): Promise<void> {
  if ((await db.categories.count()) === 0) {
    await db.categories.bulkPut(DEFAULT_CATEGORIES);
  }

  if ((await db.settings.get('app')) === undefined) {
    await db.settings.put(DEFAULT_SETTINGS);
  }
}

export async function createTx(
  partial: Partial<Transaction>
): Promise<Transaction> {
  const now = Date.now();

  const tx: Transaction = {
    id: crypto.randomUUID(),
    type: partial.type ?? 'expense',
    amountMinor: partial.amountMinor ?? 0,
    categoryId: partial.categoryId ?? 'other-expense',
    date: partial.date ?? todayLocal(),
    note: partial.note,
    createdAt: now,
    updatedAt: now,
    deleted: 0,
  };

  await db.transactions.put(tx);

  return tx;
}

export async function updateTx(
  id: string,
  patch: Partial<Transaction>
): Promise<void> {
  await db.transactions.update(id, {
    ...patch,
    updatedAt: Date.now(),
  });
}

export async function softDeleteTx(id: string): Promise<void> {
  await updateTx(id, { deleted: 1 });
}

export async function getTxsForMonth(key: string): Promise<Transaction[]> {
  const { start, end } = monthRange(key);

  const rows = await db.transactions
    .where('date')
    .between(start, end, true, true)
    .toArray();

  return rows
    .filter((tx) => !tx.deleted)
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.updatedAt - a.updatedAt
    );
}

export async function getSummaryForMonth(
  key: string
): Promise<MonthlySummary> {
  const txs = await getTxsForMonth(key);

  let incomeMinor = 0;
  let expenseMinor = 0;
  const categoryTotals = new Map<string, number>();
  const dailyTotals = new Map<string, number>();

  for (const tx of txs) {
    if (tx.type === 'income') {
      incomeMinor += tx.amountMinor;
      continue;
    }

    expenseMinor += tx.amountMinor;

    categoryTotals.set(
      tx.categoryId,
      (categoryTotals.get(tx.categoryId) ?? 0) + tx.amountMinor
    );

    dailyTotals.set(
      tx.date,
      (dailyTotals.get(tx.date) ?? 0) + tx.amountMinor
    );
  }

  const byCategory = Array.from(
    categoryTotals,
    ([categoryId, totalMinor]) => ({ categoryId, totalMinor })
  ).sort((a, b) => b.totalMinor - a.totalMinor);

  const daily = Array.from(
    dailyTotals,
    ([date, total]) => ({ date, expenseMinor: total })
  ).sort((a, b) => a.date.localeCompare(b.date));

  return {
    incomeMinor,
    expenseMinor,
    netMinor: incomeMinor - expenseMinor,
    byCategory,
    daily,
  };
}

export async function getAllTxs(): Promise<Transaction[]> {
  return db.transactions.toArray();
}

export async function getAllCategories(): Promise<Category[]> {
  return db.categories.toArray();
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('app');

  if (!settings) {
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  return settings;
}

export async function saveSettings(
  patch: Partial<AppSettings>
): Promise<void> {
  const current = await getSettings();
  await db.settings.put({ ...current, ...patch, id: 'app' });
}

export async function importAll(payload: BackupPayload): Promise<void> {
  await db.transaction(
    'rw',
    db.transactions,
    db.categories,
    db.settings,
    async () => {
      // Restore is server-authoritative: replace local records rather than
      // merging them, including records the server no longer contains.
      await db.transactions.clear();
      await db.categories.clear();

      await db.transactions.bulkPut(payload.transactions);
      await db.categories.bulkPut(payload.categories);
      await db.settings.put(payload.settings);
    }
  );
}

export async function exportAll(): Promise<BackupPayload> {
  return {
    version: 1,
    exportedAt: Date.now(),
    transactions: await db.transactions.toArray(),
    categories: await db.categories.toArray(),
    settings: await getSettings(),
  };
}