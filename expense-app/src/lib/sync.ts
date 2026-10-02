import { getSupabase } from './supabase';
import { exportAll, importAll, getSettings, saveSettings } from './db';
import type {
  BackupPayload,
  Category,
  Result,
  Transaction,
  TxType,
} from './types';

type TxRowRemote = {
  id: string;
  user_id: string;
  type: TxType;
  amount_minor: number;
  category_id: string;
  date: string;
  note: string | null;
  created_at: number;
  updated_at: number;
  deleted: 0 | 1 | null;
};

type CatRowRemote = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: TxType;
  budget_minor: number | null;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < arr.length; index += size) {
    out.push(arr.slice(index, index + size));
  }
  return out;
}

function errMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function testConnection(): Promise<Result<{ email: string | null }>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { ok: false, error: 'Not signed in' };

  const { error } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .limit(1);

  if (error) return { ok: false, error: error.message };

  return { ok: true, data: { email: user.email ?? null } };
}

export async function backupNow(): Promise<Result<{ pushed: number; at: number }>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: 'Not signed in' };

  try {
    const payload = await exportAll();

const transactions: TxRowRemote[] = payload.transactions.map((tx) => ({
  id: tx.id,
  user_id: userId,
  type: tx.type,
  amount_minor: tx.amountMinor,
  category_id: tx.categoryId,
  date: tx.date,
  note: tx.note ?? null,
  created_at: tx.createdAt,
  updated_at: tx.updatedAt,
  deleted: tx.deleted ?? null,
}));

const categories: CatRowRemote[] = payload.categories.map((category) => ({
  id: category.id,
  user_id: userId,
  name: category.name,
  icon: category.icon,
  color: category.color,
  type: category.type,
  budget_minor: category.budgetMinor ?? null,
}));

    let total = 0;

    for (const rows of chunk(transactions, 200)) {
      const { error } = await supabase.from('transactions').upsert(rows);
      if (error) throw new Error(error.message);
      total += rows.length;
    }

    for (const rows of chunk(categories, 200)) {
      const { error } = await supabase.from('categories').upsert(rows);
      if (error) throw new Error(error.message);
      total += rows.length;
    }

    const at = Date.now();
    await saveSettings({ lastBackupAt: at });

    return { ok: true, data: { pushed: total, at } };
  } catch (error) {
    return { ok: false, error: errMessage(error) };
  }
}

export async function restoreNow(): Promise<Result<{ pulled: number }>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: 'Not signed in' };

  try {
    const transactionsResult = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (transactionsResult.error) {
      throw new Error(transactionsResult.error.message);
    }

    const categoriesResult = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (categoriesResult.error) {
      throw new Error(categoriesResult.error.message);
    }

const transactions: Transaction[] = (
  (transactionsResult.data ?? []) as TxRowRemote[]
).map((row) => ({
  id: row.id,
  type: row.type,
  amountMinor: row.amount_minor,
  categoryId: row.category_id,
  date: row.date,
  ...(row.note === null ? {} : { note: row.note }),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  ...(row.deleted === null ? {} : { deleted: row.deleted }),
}));

const categories: Category[] = (
  (categoriesResult.data ?? []) as CatRowRemote[]
).map((row) => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  type: row.type,
  ...(row.budget_minor === null
    ? {}
    : { budgetMinor: row.budget_minor }),
}));

    const settings = await getSettings();

    const payload: BackupPayload = {
      version: 1,
      exportedAt: Date.now(),
      transactions,
      categories,
      settings,
    };

    await importAll(payload);

    // Server is now authoritative; clear the queue.
    return {
      ok: true,
      data: { pulled: transactions.length + categories.length },
    };
  } catch (error) {
    return { ok: false, error: errMessage(error) };
  }
}