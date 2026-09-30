import { type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import './SegmentedTabs.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface SegmentedTabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function SegmentedTabs({
  items,
  value,
  onChange,
  className,
}: SegmentedTabsProps) {
  return (
    <div className={clsx('tabs', className)} role="tablist" data-testid="segmented-tabs">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={clsx('tab', active && 'tab-active')}
            onClick={() => onChange(item.id)}
          >
            {Icon && <Icon size={16} />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}