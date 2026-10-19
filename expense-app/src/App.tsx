import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AppShell from './components/layout/AppShell';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './store/useAuth';
import { useAppStore } from './store/useAppStore';

function AppSplash({ label }: { label: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background:
          'linear-gradient(180deg, var(--surface-0, #f8fafc), var(--surface-1, #ffffff))',
      }}
    >
      <div
        style={{
          width: 'min(420px, 100%)',
          borderRadius: 20,
          border: '1px solid var(--line, #e2e8f0)',
          background: 'var(--card, #fff)',
          boxShadow: '0 10px 30px rgba(2,6,23,0.06)',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            margin: '0 auto 12px',
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(59,130,246,0.12)',
            color: '#2563eb',
          }}
        >
          <Loader2 size={22} className="spin" />
        </div>

        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Expense App</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--ink-500, #64748b)', fontSize: 14 }}>
          {label}
        </p>
      </div>
    </div>
  );
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