import { type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import './StatCard.css';

export type StatTone = 'income' | 'expense' | 'warn' | 'neutral';

export interface StatCardProps {
  label: string;
  value: string;
  tone?: StatTone;
  delta?: string;
  icon?: LucideIcon;
}

export default function StatCard({
  label,
  value,
  tone = 'neutral',
  delta,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className={clsx('stat-card', `stat-${tone}`)} data-testid="stat-card">
      <div className="stat-card-head">
        <span className="stat-label">{label}</span>
        {Icon && <Icon className="stat-icon" size={18} />}
      </div>
      <div className="stat-value">{value}</div>
      {delta && <div className="stat-delta">{delta}</div>}
    </div>
  );
}