import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import PremiumLoader from './PremiumLoader';

function TimedStage({ children }: { children: ReactNode }) {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setElapsed(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="route-loading-stage">
      {!elapsed && <PremiumLoader label="Bringing your finances into focus…" />}
      <div
        hidden={!elapsed}
        className={elapsed ? 'premium-content-reveal' : undefined}
      >
        <Suspense fallback={<PremiumLoader label="Loading your page…" />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

export default function RouteLoadingStage({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return <TimedStage key={pathname}>{children}</TimedStage>;
}
