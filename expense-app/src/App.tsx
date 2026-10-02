import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './store/useAuth';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const initAuth = useAuth((s) => s.init);
  const session = useAuth((s) => s.session);
  const initializing = useAuth((s) => s.initializing);

  const initApp = useAppStore((s) => s.init);
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (session) initApp();
  }, [session, initApp]);

  if (initializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink-400)',
        fontSize: 14,
      }}>
        Loading…
      </div>
    );
  }

  if (!session) return <AuthPage />;

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}