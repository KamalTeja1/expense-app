import TopBar from './TopBar';
import BottomNav from './BottomNav';
import AddTxSheetHost from '../../features/transactions/AddTxSheetHost';
import './AppShell.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="app-main">{children}</main>
      <BottomNav />
      <AddTxSheetHost />
    </>
  );
}