import { useEffect, useState } from 'react';
import { formatMoney } from '../../lib/format';
import { ICON_MAP } from '../../lib/categories';
import { useCategoryMap } from '../../lib/useCategoryMap';
import './CategoryBars.css';

export interface CategoryBarItem {
  categoryId: string;
  totalMinor: number;
}

export interface CategoryBarsProps {
  items: CategoryBarItem[];
  totalMinor: number;
  currency?: string;
}

export default function CategoryBars({
  items,
  totalMinor,
  currency = 'INR',
}: CategoryBarsProps) {
  const [mounted, setMounted] = useState(false);
  const { get } = useCategoryMap();

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (items.length === 0) {
    return <div className="category-bars-empty">No data</div>;
  }

  return (
    <ul className="category-bars" data-testid="category-bars">
      {items.map((item) => {
        const cat = get(item.categoryId);
        const Icon = ICON_MAP[cat.icon] ?? ICON_MAP.MoreHorizontal;
        const pct =
          totalMinor > 0 ? Math.min(100, (item.totalMinor / totalMinor) * 100) : 0;

        return (
          <li key={item.categoryId} className="category-bar">
            <div
              className="category-bar-icon"
              style={{
                backgroundColor: `${cat.color}26`,
                color: cat.color,
              }}
            >
              <Icon size={18} />
            </div>

            <div className="category-bar-body">
              <div className="category-bar-head">
                <span className="category-bar-name">{cat.name}</span>
                <span className="category-bar-value">
                  {formatMoney(item.totalMinor, currency)}
                </span>
              </div>
              <div className="category-bar-track">
                <div
                  className="category-bar-fill"
                  style={{
                    width: mounted ? `${pct}%` : '0%',
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}