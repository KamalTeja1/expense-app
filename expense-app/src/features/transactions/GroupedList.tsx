import { useMemo } from 'react';
import TxRow from './TxRow';
import { formatMoney, formatDayLabel } from '../../lib/format';
import type { Transaction } from '../../lib/types';
import './GroupedList.css';

export interface GroupedListProps {
  txs: Transaction[];
  currency: string;
}

interface DayGroup {
  date: string;
  items: Transaction[];
  total: number;
}

export default function GroupedList({ txs, currency }: GroupedListProps) {
  const groups = useMemo(() => {
    const map = new Map<string, DayGroup>();
    for (const tx of txs) {
      const key = tx.date;
      const g = map.get(key) ?? { date: key, items: [], total: 0 };
      g.items.push(tx);
      if (tx.type === 'expense') g.total += tx.amountMinor;
      map.set(key, g);
    }
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [txs]);

  return (
    <div className="grouped-list">
      {groups.map((g) => (
        <section key={g.date} className="group">
          <header className="group-header">
            <span className="group-day">{formatDayLabel(g.date)}</span>
            <span className="group-total">{formatMoney(g.total, currency)}</span>
          </header>
          <div className="group-body">
            {g.items.map((tx) => (
              <TxRow key={tx.id} tx={tx} currency={currency} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}