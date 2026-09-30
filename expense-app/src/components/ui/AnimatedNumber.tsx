import { useEffect, useRef, useState } from 'react';
import { formatMoney } from '../../lib/format';
import './AnimatedNumber.css';

export interface AnimatedNumberProps {
  value: number;
  currency: string;
  className?: string;
  duration?: number;
}

export default function AnimatedNumber({
  value,
  currency,
  className,
  duration = 500,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reducedMotion) {
      displayRef.current = value;
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const from = displayRef.current;
    const to = value;

    if (from === to) return;

    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (to - from) * eased);
      setDisplay(next);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        displayRef.current = to;
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className={className} data-testid="animated-number">
      {formatMoney(display, currency)}
    </span>
  );
}