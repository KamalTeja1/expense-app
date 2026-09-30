import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ReceiptText } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getTxsForMonth } from '../lib/db';
import { formatMoney } from '../lib/format';
import MonthPicker from '../components/ui/MonthPicker';
import { Card, CardBody } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import GroupedList from '../features/transactions/GroupedList';
import TxFilters, { type FilterValue } from '../features/transactions/TxFilters';
import './TransactionsPage.css';

export default function TransactionsPage() {
  const monthKey = useAppStore((s) => s.monthKey);
  const setMonthKey = useAppStore((s) => s.setMonthKey);
  const currency = useAppStore((s) => s.currency);

  const [filter, setFilter] = useState<FilterValue>({ kind: 'all' });
  const [search, setSearch] = useState('');

  const txs = useLiveQuery(() => getTxsForMonth(monthKey), [monthKey]) ?? [];

  const filtered = useMemo(() => {
    let r = txs;
    if (filter.kind === 'type') r = r.filter((t) => t.type === filter.type);
    if (filter.kind === 'category') r = r.filter((t) => t.categoryId === filter.categoryId);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter((t) => (t.note ?? '').toLowerCase().includes(q));
    }
    return r;
  }, [txs, filter, search]);

  const summary = useMemo(() => {
    let spent = 0;
    let earned = 0;
    for (const t of txs) {
      if (t.type === 'expense') spent += t.amountMinor;
      else earned += t.amountMinor;
    }
    return { spent, earned };
  }, [txs]);

  return (
    <div className="tx-page">
      <MonthPicker value={monthKey} onChange={setMonthKey} />

      <Card>
        <CardBody>
          <div className="tx-summary">
            <span>{formatMoney(summary.spent, currency)} spent</span>
            <span className="tx-summary-dot">·</span>
            <span>{formatMoney(summary.earned, currency)} earned</span>
          </div>
        </CardBody>
      </Card>

      <TxFilters value={filter} onChange={setFilter} search={search} onSearch={setSearch} />

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={ReceiptText}
            title="Nothing here"
            description={
              txs.length === 0
                ? 'No transactions for this month yet.'
                : 'No results for the current filter.'
            }
            actionLabel={txs.length === 0 ? undefined : 'Clear filters'}
            onAction={
              txs.length === 0
                ? undefined
                : () => {
                    setFilter({ kind: 'all' });
                    setSearch('');
                  }
            }
          />
        </Card>
      ) : (
        <Card>
          <CardBody>
            <GroupedList txs={filtered} currency={currency} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}