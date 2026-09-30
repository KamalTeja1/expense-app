import { useEffect, useState } from 'react';
import './BudgetRing.css';

function formatMinorShort(minor: number, symbol: string): string {
  const major = minor / 100;
  if (major >= 100000) return `${symbol}${(major / 1000).toFixed(1)}k`;
  return `${symbol}${Math.round(major).toLocaleString()}`;
}

export interface BudgetRingProps {
  used: number;
  total: number;
  color: string;
  currencySymbol: string;
  size?: number;
}

export default function BudgetRing({
  used,
  total,
  color,
  currencySymbol,
  size = 140,
}: BudgetRingProps) {
  const pct = total > 0 ? Math.min(1, used / total) : 0;
  const over = used > total && total > 0;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setProgress(pct));
    return () => cancelAnimationFrame(t);
  }, [pct]);

  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);
  const c = size / 2;

  return (
    <div className="budget-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={10}
        />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={over ? 'var(--red-500)' : color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="ring-content">
        <div className="ring-value">{formatMinorShort(used, currencySymbol)}</div>
        <div className="ring-sub">of {formatMinorShort(total, currencySymbol)}</div>
      </div>
    </div>
  );
}