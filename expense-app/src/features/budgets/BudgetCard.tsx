import { Pencil } from 'lucide-react';
import clsx from 'clsx';
import { ICON_MAP } from '../../lib/categories';
import { useCategoryMap } from '../../lib/useCategoryMap';
import { formatMoney } from '../../lib/format';
import type { Category } from '../../lib/types';
import './BudgetCard.css';

export interface BudgetCardProps {
  category: Category;
  usedMinor: number;
  currency: string;
  onEdit: (cat: Category) => void;
}

export default function BudgetCard({
  category,
  usedMinor,
  currency,
  onEdit,
}: BudgetCardProps) {
  const { get } = useCategoryMap();
  const total = category.budgetMinor ?? 0;
  const pct = total > 0 ? usedMinor / total : 0;
  const over = pct > 1;
  const close = pct >= 0.8 && pct <= 1;
  const cat = get(category.id);
  const Icon = ICON_MAP[cat.icon];

  const badgeTone = over ? 'red' : close ? 'amber' : 'green';
  const badgeText = over ? 'Over' : close ? 'Close' : 'On track';

  return (
    <div
      className="budget-card"
      data-testid="budget-card"
      style={{ borderLeftColor: cat.color }}
    >
      <div className="bc-head">
        <div
          className="bc-icon"
          style={{ backgroundColor: `${cat.color}26`, color: cat.color }}
        >
          {Icon && <Icon size={18} />}
        </div>
        <div className="bc-title">{cat.name}</div>
        <button
          type="button"
          className="bc-edit"
          onClick={() => onEdit(category)}
          aria-label="Edit budget"
        >
          <Pencil size={14} />
        </button>
      </div>

      <div className="bc-track">
        <div
          className={clsx('bc-fill', over && 'over')}
          style={{
            width: `${Math.min(100, pct * 100)}%`,
            backgroundColor: over ? 'var(--red-500)' : cat.color,
          }}
        />
      </div>

      <div className="bc-foot">
        <span className="bc-numbers">
          {formatMoney(usedMinor, currency)} / {formatMoney(total, currency)}
        </span>
        <span className={clsx('bc-badge', `bc-${badgeTone}`)}>{badgeText}</span>
      </div>
    </div>
  );
}