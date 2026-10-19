import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastStore {
  items: ToastItem[];
  push: (message: string, tone: ToastTone) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>()((set) => ({
  items: [],
  push: (message, tone) => {
    const id = crypto.randomUUID();
    set((s) => ({ items: [...s.items, { id, message, tone }] }));
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
    }, 3000);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export function toast(message: string, tone: ToastTone = 'info'): void {
  useToastStore.getState().push(message, tone);
}
