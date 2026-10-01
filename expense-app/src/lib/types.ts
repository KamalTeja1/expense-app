export type TxType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide-react icon name, e.g. "UtensilsCrossed"
  color: string; // hex from the palette, e.g. "#E8A317"
  type: TxType;
  budgetMinor?: number; // optional monthly budget in minor units
}

export interface Transaction {
  id: string;
  type: TxType;
  amountMinor: number; // integer minor units (paise/cents)
  categoryId: string;
  date: string; // ISO date 'yyyy-MM-dd'
  note?: string;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  deleted?: 0 | 1; // soft delete flag
}

export interface AppSettings {
  id: 'app'; // singleton row
  currency: string; // 'INR' | 'USD' | ...
  locale: string; // 'en-IN' | 'en-US' | ...
  monthStartDay: number; // 1 | 5 | 15 | 25 | 28
  autoBackup: boolean;
  lastBackupAt?: number; // epoch ms
  supabaseUrl?: string;
  backupIntervalMin: number; 
  supabaseKey?: string;
}

export interface MonthlySummary {
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
  byCategory: { categoryId: string; totalMinor: number }[];
  daily: { date: string; expenseMinor: number }[];
}

export interface BackupPayload {
  version: 1;
  exportedAt: number;
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };