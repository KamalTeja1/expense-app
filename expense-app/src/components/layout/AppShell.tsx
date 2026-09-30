import TopBar from './TopBar';
import BottomNav from './BottomNav';
import AddTxSheetHost from '../../features/transactions/AddTxSheetHost';
import { ToastHost } from '../ui/Toast';
import InstallPrompt from '../ui/InstallPrompt';
import OfflineBanner from '../ui/OfflineBanner';
import './AppShell.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <OfflineBanner />
      <main className="app-main">{children}</main>
      <BottomNav />
      <AddTxSheetHost />
      <ToastHost />
      <InstallPrompt />
    </>
  );
}