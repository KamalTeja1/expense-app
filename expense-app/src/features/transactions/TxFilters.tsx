import { useMemo } from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import { useLiveQuery } from 'dexie-react-hooks';
import { getAllCategories } from '../../lib/db';
import { ICON_MAP } from '../../lib/categories';
import type { TxType } from '../../lib/types';
import './TxFilters.css';

export type FilterValue =
  | { kind: 'all' }
  | { kind: 'type'; type: TxType }
  | { kind: 'category'; categoryId: string };

export interface TxFiltersProps {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  search: string;
  onSearch: (s: string) => void;
}

export default function TxFilters({ value, onChange, search, onSearch }: TxFiltersProps) {
  const categories = useLiveQuery(() => getAllCategories(), []) ?? [];
  const expenseCats = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);
  const incomeCats = useMemo(() => categories.filter((c) => c.type === 'income'), [categories]);

  return (
    <div className="tx-filters" data-testid="tx-filters">
      <div className="tx-search">
        <Search size={16} className="tx-search-icon" />
        <input
          className="tx-search-input"
          type="text"
          placeholder="Search notes…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="tx-chips">
        <button
          type="button"
          className={clsx('tx-chip', value.kind === 'all' && 'active')}
          onClick={() => onChange({ kind: 'all' })}
        >
          All
        </button>

        <button
          type="button"
          className={clsx('tx-chip', value.kind === 'type' && value.type === 'expense' && 'active')}
          onClick={() => onChange({ kind: 'type', type: 'expense' })}
        >
          Expense
        </button>

        <button
          type="button"
          className={clsx('tx-chip', value.kind === 'type' && value.type === 'income' && 'active')}
          onClick={() => onChange({ kind: 'type', type: 'income' })}
        >
          Income
        </button>

        {[...expenseCats, ...incomeCats].map((c) => {
          const Icon = ICON_MAP[c.icon];
          const active = value.kind === 'category' && value.categoryId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={clsx('tx-chip', active && 'active')}
              onClick={() => onChange({ kind: 'category', categoryId: c.id })}
            >
              {Icon && <Icon size={14} />}
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}