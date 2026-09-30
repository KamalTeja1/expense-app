import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSettings } from './db';
import { backupNow } from './sync';

export function useAutoBackup(): void {
  const txCount = useLiveQuery(async () => (await db.transactions.toArray()).length, []);
  const catCount = useLiveQuery(async () => (await db.categories.toArray()).length, []);
  const settings = useLiveQuery(() => getSettings(), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoBackup = settings?.autoBackup ?? false;

  useEffect(() => {
    if (txCount === undefined || catCount === undefined) return;
    if (!autoBackup || !navigator.onLine) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void backupNow();
    }, 5000);
  }, [txCount, catCount, autoBackup]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
}