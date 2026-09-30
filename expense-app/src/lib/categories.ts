import {
  UtensilsCrossed,
  Car,
  Home,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Clapperboard,
  GraduationCap,
  ShoppingCart,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Gift,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'UtensilsCrossed', color: '#E8A317', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#409BD2', type: 'expense' },
  { id: 'rent', name: 'Rent', icon: 'Home', color: '#007AC3', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#85BC20', type: 'expense' },
  { id: 'bills', name: 'Bills', icon: 'Receipt', color: '#46586a', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#E5202E', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Clapperboard', color: '#7c8ea0', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#409BD2', type: 'expense' },
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#85BC20', type: 'expense' },
  { id: 'other-expense', name: 'Other', icon: 'MoreHorizontal', color: '#7c8ea0', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: 'Wallet', color: '#85BC20', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'Briefcase', color: '#007AC3', type: 'income' },
  { id: 'gift', name: 'Gift', icon: 'Gift', color: '#E8A317', type: 'income' },
  { id: 'other-income', name: 'Other', icon: 'MoreHorizontal', color: '#7c8ea0', type: 'income' },
];

export const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  Home,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Clapperboard,
  GraduationCap,
  ShoppingCart,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Gift,
};

export function getCategory(id: string): Category {
  const found = DEFAULT_CATEGORIES.find((c) => c.id === id);
  if (found) return found;
  return DEFAULT_CATEGORIES.find((c) => c.id === 'other-expense') as Category;
}

export const CATEGORY_COLORS: string[] = [
  '#007AC3',
  '#409BD2',
  '#A6D1EA',
  '#85BC20',
  '#E8A317',
  '#E5202E',
  '#0c2536',
  '#46586a',
  '#7c8ea0',
  '#f6c7cb',
  '#fdeced',
  '#fdf3dd',
];