import { create } from 'zustand';
import { seedIfEmpty, getSettings, saveSettings } from '../lib/db';
import { monthKey as mk } from '../lib/format';

export interface AppState {
  monthKey: string;
  currency: string;
  locale: string;
  ready: boolean;

  setMonthKey: (key: string) => void;
  setCurrency: (currency: string) => void;
  setLocale: (locale: string) => void;
  init: () => Promise<void>;
}

export const useAppStore = create<AppState>()((set) => ({
  monthKey: mk(new Date()),
  currency: 'INR',
  locale: 'en-IN',
  ready: false,

  setMonthKey: (key) => {
    set({ monthKey: key });
  },

  setCurrency: (currency) => {
    set({ currency });
    void saveSettings({ currency });
  },

  setLocale: (locale) => {
    set({ locale });
    void saveSettings({ locale });
  },

  init: async () => {
    await seedIfEmpty();
    const s = await getSettings();
    set({ currency: s.currency, locale: s.locale, ready: true });
  },
}));