import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAddTxBus } from '../../store/addTxBus';
import { useAuth } from '../../store/useAuth';
import './TopBar.css';

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/settings': 'Settings',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = TITLES[pathname] ?? 'Expense App';
  const openSheet = useAddTxBus((s) => s.openSheet);
  const user = useAuth((s) => s.user);
  const initial = (user?.email?.[0] ?? '?').toUpperCase();

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-actions">
        <button
          type="button"
          className="topbar-avatar"
          aria-label={user?.email ?? 'Account'}
          onClick={() => navigate('/settings')}
        >
          {initial}
        </button>

        <button
          type="button"
          className="topbar-action"
          aria-label="Add transaction"
          onClick={() => openSheet()}
        >
          <Plus size={20} />
        </button>
      </div>
    </header>
  );
}