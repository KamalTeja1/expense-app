import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { addMonths, monthKey, monthLabel } from '../../lib/format';
import './MonthPicker.css';

export interface MonthPickerProps {
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  const current = monthKey(new Date());
  const isCurrent = value === current;

  const goPrev = () => onChange(addMonths(value, -1));
  const goNext = () => onChange(addMonths(value, 1));
  const goToday = () => onChange(current);

  return (
    <div className={clsx('month-picker', className)} data-testid="month-picker">
      <button
        type="button"
        className="month-nav"
        onClick={goPrev}
        aria-label="Previous month"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="month-picker-label">
        <span className="month-name">{monthLabel(value)}</span>
        {!isCurrent && (
          <button type="button" className="month-today" onClick={goToday}>
            Today
          </button>
        )}
      </div>

      <button
        type="button"
        className="month-nav"
        onClick={goNext}
        aria-label="Next month"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}