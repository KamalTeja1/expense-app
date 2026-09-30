import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import './TopBar.css';

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/settings': 'Settings',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Dashboard';

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <button type="button" className="topbar-action" aria-label="Add">
        <Plus size={20} />
      </button>
    </header>
  );
}