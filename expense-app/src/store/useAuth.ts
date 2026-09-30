import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';

export interface AuthState {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  error: string | null;

  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

let subscription: { unsubscribe: () => void } | null = null;

export const useAuth = create<AuthState>()((set) => ({
  session: null,
  user: null,
  initializing: true,
  error: null,

  init: async () => {
    set({ initializing: true });
    const supabase = getSupabase();
    if (!supabase) {
      set({ initializing: false });
      return;
    }
    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
      initializing: false,
    });
    if (!subscription) {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        useAuth.setState({ session, user: session?.user ?? null });
      });
      subscription = sub.subscription;
    }
  },

  signIn: async (email, password) => {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'Supabase is not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      return { ok: false, error: error.message };
    }
    set({ error: null });
    return { ok: true };
  },

  signOut: async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));