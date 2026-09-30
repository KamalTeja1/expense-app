import { getSupabase } from './supabase';
import { exportAll, importAll, getSettings, saveSettings } from './db';
import type {
  BackupPayload,
  Category,
  Result,
  Transaction,
} from './types';

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function testConnection(): Promise<Result<{ email: string | null }>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: 'Not signed in' };

  const { error } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .limit(1);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { email: userData.user.email ?? null } };
}

// --- field mapping helpers ---

function txToRow(tx: Transaction, userId: string) {
  return {
    id: tx.id,
    user_id: userId,
    type: tx.type,
    amount_minor: tx.amountMinor,
    category_id: tx.categoryId,
    date: tx.date,
    note: tx.note ?? null,
    created_at: tx.createdAt,
    updated_at: tx.updatedAt,
    deleted: tx.deleted ?? 0,
  };
}

function rowToTx(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id),
    type: row.type as Transaction['type'],
    amountMinor: Number(row.amount_minor),
    categoryId: String(row.category_id),
    date: String(row.date),
    note: (row.note as string | null) ?? undefined,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    deleted: (Number(row.deleted) === 1 ? 1 : 0),
  };
}

function catToRow(c: Category, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    icon: c.icon,
    color: c.color,
    type: c.type,
    budget_minor: c.budgetMinor ?? null,
  };
}

function rowToCat(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    icon: String(row.icon),
    color: String(row.color),
    type: row.type as Category['type'],
    budgetMinor:
      row.budget_minor === null || row.budget_minor === undefined
        ? undefined
        : Number(row.budget_minor),
  };
}

// --- backup / restore ---

export async function backupNow(): Promise<Result<{ pushed: number; at: number }>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: 'Not signed in' };

  try {
    const payload = await exportAll();

    const txRows = payload.transactions.map((t) => txToRow(t, userId));
    const catRows = payload.categories.map((c) => catToRow(c, userId));

    const chunk = <T,>(arr: T[], size: number): T[][] => {
      const out: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        out.push(arr.slice(i, i + size));
      }
      return out;
    };

    let pushed = 0;

    for (const part of chunk(catRows, 200)) {
      const { error } = await supabase
        .from('categories')
        .upsert(part, { onConflict: 'user_id,id' });
      if (error) return { ok: false, error: `categories: ${error.message}` };
      pushed += part.length;
    }

    for (const part of chunk(txRows, 200)) {
      const { error } = await supabase
        .from('transactions')
        .upsert(part, { onConflict: 'id' });
      if (error) return { ok: false, error: `transactions: ${error.message}` };
      pushed += part.length;
    }

    const at = Date.now();
    await saveSettings({ lastBackupAt: at });

    return { ok: true, data: { pushed, at } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

export async function restoreNow(): Promise<Result<{ pulled: number }>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: 'Not signed in' };

  try {
    const { data: txRows, error: txErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (txErr) return { ok: false, error: `transactions: ${txErr.message}` };

    const { data: catRows, error: catErr } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (catErr) return { ok: false, error: `categories: ${catErr.message}` };

    const transactions = (txRows ?? []).map(rowToTx);
    const categories = (catRows ?? []).map(rowToCat);
    const settings = await getSettings();

    const payload: BackupPayload = {
      version: 1,
      exportedAt: Date.now(),
      transactions,
      categories,
      settings,
    };

    await importAll(payload);

    return {
      ok: true,
      data: { pulled: transactions.length + categories.length },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}