import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Wallet,
  ReceiptText,
  PiggyBank,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAddTxBus } from '../store/addTxBus';
import { getSummaryForMonth, getTxsForMonth } from '../lib/db';
import {
  formatMoney,
  addMonths,
  monthLabel,
  formatDayLabel,
} from '../lib/format';
import { getCategory, ICON_MAP } from '../lib/categories';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import MonthPicker from '../components/ui/MonthPicker';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import DonutChart from '../components/charts/DonutChart';
import TrendArea from '../components/charts/TrendArea';
import CategoryBars from '../components/charts/CategoryBars';
import MonthCompare from '../components/charts/MonthCompare';
import './DashboardPage.css';

function makeDelta(current: number, previous: number, prevLabel: string): string {
  if (previous === 0) return '';
  const pct = Math.round(((current - previous) / Math.abs(previous)) * 100);
  const sign = pct >= 0 ? '+' : '';
  const short = prevLabel.split(' ')[0].slice(0, 3);
  return `${sign}${pct}% vs ${short}`;
}

export default function DashboardPage() {
  const { monthKey, currency, ready, init } = useAppStore();
  const setMonthKey = useAppStore((s) => s.setMonthKey);
  const openSheet = useAddTxBus((s) => s.openSheet);

  useEffect(() => {
    void init();
  }, [init]);

  const summary = useLiveQuery(() => getSummaryForMonth(monthKey), [monthKey]);
  const txs = useLiveQuery(() => getTxsForMonth(monthKey), [monthKey]);

  const last6 = useLiveQuery(async () => {
    const keys = [5, 4, 3, 2, 1, 0].map((n) => addMonths(monthKey, -n));
    const rows = await Promise.all(
      keys.map(async (k) => {
        const s = await getSummaryForMonth(k);
        return {
          monthKey: k,
          incomeMinor: s.incomeMinor,
          expenseMinor: s.expenseMinor,
        };
      })
    );
    return rows;
  }, [monthKey]);

  const prev = useLiveQuery(
    () => getSummaryForMonth(addMonths(monthKey, -1)),
    [monthKey]
  );

  if (!ready) return <DashboardSkeleton />;

  const prevLabel = monthLabel(addMonths(monthKey, -1));
  const incomeDelta = prev
    ? makeDelta(summary?.incomeMinor ?? 0, prev.incomeMinor, prevLabel)
    : '';
  const expenseDelta = prev
    ? makeDelta(summary?.expenseMinor ?? 0, prev.expenseMinor, prevLabel)
    : '';
  const netDelta = prev
    ? makeDelta(summary?.netMinor ?? 0, prev.netMinor, prevLabel)
    : '';

  const byCategoryDonut =
    summary?.byCategory.map((b) => {
      const cat = getCategory(b.categoryId);
      return { name: cat.name, value: b.totalMinor, color: cat.color };
    }) ?? [];

  const dailyAvg = summary
    ? Math.round(summary.expenseMinor / Math.max(1, summary.daily.length))
    : 0;

  const recent = txs?.slice(0, 5) ?? [];

  const isEmpty =
    !!summary &&
    summary.incomeMinor === 0 &&
    summary.expenseMinor === 0 &&
    (txs?.length ?? 0) === 0;

  return (
    <div className="dashboard">
      <section className="hero">
        <div className="hero-blob" aria-hidden />
        <span className="hero-badge">{monthLabel(monthKey)}</span>
        <h1 className="hero-net">{formatMoney(summary?.netMinor ?? 0, currency)}</h1>
        <div className="hero-split">
          <div className="hero-mini">
            <ArrowDownLeft size={16} className="hero-mini-icon" />
            <div>
              <div className="hero-mini-label">Income</div>
              <div className="hero-mini-value">
                {formatMoney(summary?.incomeMinor ?? 0, currency)}
              </div>
            </div>
          </div>
          <div className="hero-divider" />
          <div className="hero-mini">
            <ArrowUpRight size={16} className="hero-mini-icon" />
            <div>
              <div className="hero-mini-label">Spent</div>
              <div className="hero-mini-value">
                {formatMoney(summary?.expenseMinor ?? 0, currency)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-month">
        <MonthPicker value={monthKey} onChange={setMonthKey} />
      </div>

      <section className="dashboard-stats">
        <StatCard
          label="Income"
          tone="income"
          value={formatMoney(summary?.incomeMinor ?? 0, currency)}
          icon={Wallet}
          delta={incomeDelta}
        />
        <StatCard
          label="Expenses"
          tone="expense"
          value={formatMoney(summary?.expenseMinor ?? 0, currency)}
          icon={ReceiptText}
          delta={expenseDelta}
        />
        <StatCard
          label="Net Saved"
          tone="neutral"
          value={formatMoney(summary?.netMinor ?? 0, currency)}
          icon={PiggyBank}
          delta={netDelta}
        />
        <StatCard
          label="Daily Avg"
          tone="warn"
          value={formatMoney(dailyAvg, currency)}
          icon={TrendingUp}
        />
      </section>

      {isEmpty ? (
        <Card>
          <EmptyState
            icon={ReceiptText}
            title="No activity yet"
            description="Tap + to log your first expense or income for this month."
            actionLabel="Add transaction"
            onAction={() => openSheet()}
          />
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader title="Where it went" />
            <CardBody>
              <DonutChart data={byCategoryDonut} currency={currency} />
              <div className="dashboard-spacer" />
              <CategoryBars
                items={summary?.byCategory ?? []}
                totalMinor={summary?.expenseMinor ?? 0}
                currency={currency}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Daily spend" />
            <CardBody>
              <TrendArea data={summary?.daily ?? []} currency={currency} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Last 6 months" />
            <CardBody>
              <MonthCompare data={last6 ?? []} currency={currency} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Recent"
              action={
                <a className="dashboard-viewall" href="/transactions">
                  View all
                </a>
              }
            />
            <CardBody>
              <ul className="dashboard-recent">
                {recent.map((tx) => {
                  const cat = getCategory(tx.categoryId);
                  const Icon = ICON_MAP[cat.icon] ?? ICON_MAP.MoreHorizontal;
                  const isIncome = tx.type === 'income';
                  return (
                    <li key={tx.id} className="recent-row">
                      <div
                        className="recent-icon"
                        style={{
                          backgroundColor: `${cat.color}26`,
                          color: cat.color,
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="recent-body">
                        <div className="recent-name">{cat.name}</div>
                        <div className="recent-date">{formatDayLabel(tx.date)}</div>
                      </div>
                      <div
                        className={isIncome ? 'recent-amt income' : 'recent-amt expense'}
                      >
                        {isIncome ? '+' : '-'}
                        {formatMoney(tx.amountMinor, currency)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </>
      )}

      <button
        type="button"
        className="dashboard-fab"
        aria-label="Add transaction"
        onClick={() => openSheet()}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <Skeleton h={180} radius={16} />
      <Skeleton h={64} radius={12} />
      <div className="dashboard-stats">
        <Skeleton h={96} radius={12} />
        <Skeleton h={96} radius={12} />
        <Skeleton h={96} radius={12} />
        <Skeleton h={96} radius={12} />
      </div>
      <Skeleton h={280} radius={14} />
      <Skeleton h={220} radius={14} />
    </div>
  );
}