import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Target } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getAllCategories, getTxsForMonth } from '../lib/db';
import { formatMoney, monthLabel } from '../lib/format';
import { Card, CardBody } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import BudgetCard from '../features/budgets/BudgetCard';
import BudgetEditor from '../features/budgets/BudgetEditor';
import type { Category } from '../lib/types';
import './BudgetsPage.css';

export default function BudgetsPage() {
  const { monthKey, currency } = useAppStore();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | undefined>();

  const categories = useLiveQuery(() => getAllCategories(), []) ?? [];
  const txs = useLiveQuery(() => getTxsForMonth(monthKey), [monthKey]) ?? [];

  const spentByCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of txs) {
      if (t.type !== 'expense') continue;
      m.set(t.categoryId, (m.get(t.categoryId) ?? 0) + t.amountMinor);
    }
    return m;
  }, [txs]);

  const expenseCats = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );

  const budgeted = expenseCats.filter((c) => (c.budgetMinor ?? 0) > 0);
  const unbudgeted = expenseCats.filter((c) => !c.budgetMinor);

  const totalBudget = budgeted.reduce((s, c) => s + (c.budgetMinor ?? 0), 0);
  const totalSpent = budgeted.reduce((s, c) => s + (spentByCat.get(c.id) ?? 0), 0);
  const remaining = totalBudget - totalSpent;
  const pct = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;
  const overTotal = totalSpent > totalBudget;

  return (
    <div className="budgets-page">
      <h1 className="bp-title">Budgets</h1>
      <p className="bp-month">{monthLabel(monthKey)}</p>

      <Card>
        <CardBody>
          <div className="bp-hero">
            <div className="bp-hero-top">
              <span className="bp-hero-label">Total budgeted</span>
              <span className="bp-hero-remaining">
                {overTotal ? 'Over by ' : 'Left '}
                {formatMoney(Math.abs(remaining), currency)}
              </span>
            </div>
            <div className="bp-hero-numbers">
              {formatMoney(totalSpent, currency)}
              <span className="bp-hero-of"> of {formatMoney(totalBudget, currency)}</span>
            </div>
            <div className="bp-track">
              <div
                className={overTotal ? 'bp-fill over' : 'bp-fill'}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {budgeted.length > 0 && (
        <section>
          <h2 className="bp-section-title">Active budgets</h2>
          <div className="bp-grid">
            {budgeted.map((cat) => (
              <BudgetCard
                key={cat.id}
                category={cat}
                usedMinor={spentByCat.get(cat.id) ?? 0}
                currency={currency}
                onEdit={(c) => {
                  setEditingCat(c);
                  setEditorOpen(true);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {unbudgeted.length > 0 && (
        <section>
          <h2 className="bp-section-title">Not budgeted yet</h2>
          <Card>
            <CardBody>
              <ul className="bp-unbudgeted">
                {unbudgeted.map((cat) => (
                  <li key={cat.id} className="bp-unbudgeted-row">
                    <span className="bp-unbudgeted-name">{cat.name}</span>
                    <button
                      type="button"
                      className="bp-set"
                      onClick={() => {
                        setEditingCat(cat);
                        setEditorOpen(true);
                      }}
                    >
                      Set budget
                    </button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </section>
      )}

      {budgeted.length === 0 && unbudgeted.length === 0 && (
        <Card>
          <EmptyState
            icon={Target}
            title="No expense categories"
            description="Add categories from Settings to start budgeting."
          />
        </Card>
      )}

      <BudgetEditor
        open={editorOpen}
        category={editingCat}
        onClose={() => {
          setEditorOpen(false);
          setEditingCat(undefined);
        }}
      />
    </div>
  );
}