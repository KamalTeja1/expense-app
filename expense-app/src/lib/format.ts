import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths as dfAddMonths,
  isToday,
  isYesterday,
} from 'date-fns';

export function formatMoney(
  minor: number,
  currency = 'INR',
  locale = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(minor / 100);
}

export function parseMoneyToMinor(input: string): number {
  const cleaned = input.replace(/[^0-9.\-]/g, '');
  if (cleaned === '') return 0;
  const value = parseFloat(cleaned);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function formatDayLabel(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'd MMM');
}

export function monthKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM');
}

export function monthRange(key: string): { start: string; end: string } {
  const base = parseISO(`${key}-01`);
  return {
    start: format(startOfMonth(base), 'yyyy-MM-dd'),
    end: format(endOfMonth(base), 'yyyy-MM-dd'),
  };
}

export function addMonths(key: string, delta: number): string {
  const base = parseISO(`${key}-01`);
  return format(dfAddMonths(base, delta), 'yyyy-MM');
}

export function monthLabel(key: string): string {
  return format(parseISO(`${key}-01`), 'MMMM yyyy');
}