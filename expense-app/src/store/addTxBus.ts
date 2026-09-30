import { create } from 'zustand';
import type { Transaction } from '../lib/types';

export interface AddTxBusState {
  open: boolean;
  editing?: Transaction;
  openSheet: (tx?: Transaction) => void;
  closeSheet: () => void;
}

export const useAddTxBus = create<AddTxBusState>()((set) => ({
  open: false,
  editing: undefined,
  openSheet: (tx) => set({ open: true, editing: tx }),
  closeSheet: () => set({ open: false, editing: undefined }),
}));