import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Target, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import './BottomNav.css';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            clsx('bottom-nav-item', isActive && 'active')
          }
        >
          <Icon size={22} />
          <span className="bottom-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}