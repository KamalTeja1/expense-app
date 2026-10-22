import { lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PremiumLoader from './components/ui/PremiumLoader';
import RouteLoadingStage from './components/ui/RouteLoadingStage';
import AppShell from './components/layout/AppShell';
import AuthPage from './pages/AuthPage';
import { useAuth } from './store/useAuth';
import { useAppStore } from './store/useAppStore';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function AppSplash({ label }: { label: string }) {
  return <PremiumLoader label={label} fullScreen />;
}

export default function App() {
  const initAuth = useAuth((s) => s.init);
  const session = useAuth((s) => s.session);
  const authInitializing = useAuth((s) => s.initializing);

  const initApp = useAppStore((s) => s.init);
  const appReady = useAppStore((s) => s.ready);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (session) {
      void initApp();
    }
  }, [session, initApp]);

  if (authInitializing) {
    return <AppSplash label="Checking your account…" />;
  }

  if (!session) return <AuthPage />;

  if (!appReady) {
    return <AppSplash label="Preparing your local data…" />;
  }

  return (
    <BrowserRouter>
      <AppShell>
        <RouteLoadingStage>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RouteLoadingStage>
      </AppShell>
    </BrowserRouter>
  );
}
