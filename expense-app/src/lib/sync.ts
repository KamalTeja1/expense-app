import { getSupabase } from './supabase';
import { exportAll, importAll, saveSettings, getSettings } from './db';
import type { BackupPayload, Category, Result, Transaction } from './types';

type TxRowRemote = Transaction & { user_id: string };
type CatRowRemote = Category & { user_id: string };

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Unknown error';
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
    const txs: TxRowRemote[] = payload.transactions.map((t) => ({ ...t, user_id: userId }));
    const cats: CatRowRemote[] = payload.categories.map((c) => ({ ...c, user_id: userId }));
    let total = 0;

    for (const part of chunk(txs, 200)) {
      const { error } = await supabase.from('transactions').upsert(part);
      if (error) throw new Error(error.message);
      total += part.length;
    }
    for (const part of chunk(cats, 200)) {
      const { error } = await supabase.from('categories').upsert(part);
      if (error) throw new Error(error.message);
      total += part.length;
    }

    const at = Date.now();
    await saveSettings({ lastBackupAt: at });
    return { ok: true, data: { pushed: total, at } };
  } catch (e) {
    return { ok: false, error: errMessage(e) };
  }
}

export async function restoreNow(): Promise<Result<{ pulled: number }>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: 'Not signed in' };

  try {
    const txRes = await supabase.from('transactions').select('*').eq('user_id', userId);
    if (txRes.error) throw new Error(txRes.error.message);
    const catRes = await supabase.from('categories').select('*').eq('user_id', userId);
    if (catRes.error) throw new Error(catRes.error.message);

    const transactions: Transaction[] = ((txRes.data ?? []) as TxRowRemote[]).map((row) => {
      const { user_id: _omit, ...rest } = row;
      void _omit;
      return rest;
    });
    const categories: Category[] = ((catRes.data ?? []) as CatRowRemote[]).map((row) => {
      const { user_id: _omit, ...rest } = row;
      void _omit;
      return rest;
    });

    const settings = await getSettings();
    const payload: BackupPayload = {
      version: 1,
      exportedAt: Date.now(),
      transactions,
      categories,
      settings,
    };
    await importAll(payload);
    return { ok: true, data: { pulled: transactions.length + categories.length } };
  } catch (e) {
    return { ok: false, error: errMessage(e) };
  }
}