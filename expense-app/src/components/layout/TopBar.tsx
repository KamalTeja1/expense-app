import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAddTxBus } from '../../store/addTxBus';
import './TopBar.css';

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/settings': 'Settings',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Expense App';
  const openSheet = useAddTxBus((s) => s.openSheet);

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <button
        type="button"
        className="topbar-action"
        aria-label="Add transaction"
        onClick={() => openSheet()}
      >
        <Plus size={20} />
      </button>
    </header>
  );
}