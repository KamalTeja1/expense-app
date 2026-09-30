import Dexie, { type Table } from 'dexie';
import type {
  Transaction,
  Category,
  AppSettings,
  MonthlySummary,
  BackupPayload,
} from './types';
import { DEFAULT_CATEGORIES } from './categories';
import { monthRange } from './format';

export class AppDB extends Dexie {
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
};

export async function seedIfEmpty(): Promise<void> {
  if ((await db.categories.count()) === 0) {
    await db.categories.bulkPut(DEFAULT_CATEGORIES);
  }
  if ((await db.settings.get('app')) === undefined) {
    await db.settings.put({ ...DEFAULT_SETTINGS });
  }
}

export async function createTx(partial: Partial<Transaction>): Promise<Transaction> {
  const now = Date.now();
  const tx: Transaction = {
    id: crypto.randomUUID(),
    type: partial.type ?? 'expense',
    amountMinor: partial.amountMinor ?? 0,
    categoryId: partial.categoryId ?? 'other-expense',
    date: partial.date ?? new Date().toISOString().slice(0, 10),
    note: partial.note,
    createdAt: now,
    updatedAt: now,
    deleted: 0,
  };
  await db.transactions.put(tx);
  return tx;
}

export async function updateTx(id: string, patch: Partial<Transaction>): Promise<void> {
  await db.transactions.update(id, { ...patch, updatedAt: Date.now() });
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
    .filter((t) => t.deleted !== 1)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.updatedAt - a.updatedAt;
    });
}

export async function getSummaryForMonth(key: string): Promise<MonthlySummary> {
  const txs = await getTxsForMonth(key);
  let incomeMinor = 0;
  let expenseMinor = 0;
  const catTotals = new Map<string, number>();
  const dayTotals = new Map<string, number>();

  for (const t of txs) {
    if (!dayTotals.has(t.date)) dayTotals.set(t.date, 0);
    if (t.type === 'income') {
      incomeMinor += t.amountMinor;
    } else {
      expenseMinor += t.amountMinor;
      catTotals.set(t.categoryId, (catTotals.get(t.categoryId) ?? 0) + t.amountMinor);
      dayTotals.set(t.date, (dayTotals.get(t.date) ?? 0) + t.amountMinor);
    }
  }

  const byCategory = Array.from(catTotals, ([categoryId, totalMinor]) => ({
    categoryId,
    totalMinor,
  })).sort((a, b) => b.totalMinor - a.totalMinor);

  const daily = Array.from(dayTotals, ([date, exp]) => ({
    date,
    expenseMinor: exp,
  })).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

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
  const existing = await db.settings.get('app');
  if (existing) return existing;
  const fresh: AppSettings = { ...DEFAULT_SETTINGS };
  await db.settings.put(fresh);
  return fresh;
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await db.settings.put({ ...current, ...patch, id: 'app' });
}

export async function importAll(payload: BackupPayload): Promise<void> {
  await db.transaction('rw', db.transactions, db.categories, db.settings, async () => {
    await db.transactions.bulkPut(payload.transactions);
    await db.categories.bulkPut(payload.categories);
    await db.settings.put(payload.settings);
  });
}

export async function exportAll(): Promise<BackupPayload> {
  const [transactions, categories, settings] = await Promise.all([
    getAllTxs(),
    getAllCategories(),
    getSettings(),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    transactions,
    categories,
    settings,
  };
}