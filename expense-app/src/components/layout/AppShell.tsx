import type { ReactNode } from 'react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import './AppShell.css';

export type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <>
      <TopBar />
      <main className="app-main">{children}</main>
      <BottomNav />
    </>
  );
}