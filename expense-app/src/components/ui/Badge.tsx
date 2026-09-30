import { type ReactNode } from 'react';
import clsx from 'clsx';
import './Badge.css';

export type BadgeTone = 'blue' | 'green' | 'red' | 'amber' | 'neutral';

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export default function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={clsx('badge', `badge-${tone}`, className)} data-testid="badge">
      {children}
    </span>
  );
}