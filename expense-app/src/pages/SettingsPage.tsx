import { useState } from 'react';
import { LogOut, Tags } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { toast } from '../components/ui/Toast';
import CategoryManager from '../features/settings/CategoryManager';
import BackupPanel from '../features/settings/BackupPanel';
import DataPanel from '../features/settings/DataPanel';
import PreferencesPanel from '../features/settings/PreferencesPanel';
import { useAuth } from '../store/useAuth';
import './SettingsPage.css';

export default function SettingsPage() {
  const [catOpen, setCatOpen] = useState(false);
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  const handleSignOut = async () => {
    const confirmed = window.confirm(
      'Sign out? Your local data stays on this device. ' +
        'Remember to back up to the server first.'
    );
    if (!confirmed) return;
    await signOut();
    toast('Signed out', 'info');
  };

  return (
    <div className="settings-page">
      <Card>
        <CardBody>
          <div className="settings-account">
            <div className="settings-avatar">{(user?.email?.[0] ?? '?').toUpperCase()}</div>
            <div>
              <div className="settings-email">{user?.email ?? 'Not signed in'}</div>
              <div className="settings-role">Local account</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <PreferencesPanel />
      <BackupPanel />

      <Card>
        <CardHeader title="Categories" />
        <CardBody>
          <button type="button" className="settings-row" onClick={() => setCatOpen(true)}>
            <Tags size={18} />
            <span className="settings-row-label">Manage categories</span>
            <span className="settings-row-arrow">›</span>
          </button>
        </CardBody>
      </Card>

      <DataPanel />

      <Card>
        <CardHeader title="Account" />
        <CardBody>
          <Button
            variant="ghost"
            leftIcon={<LogOut size={16} />}
            onClick={() => void handleSignOut()}
            style={{ width: '100%' }}
          >
            Sign out
          </Button>
        </CardBody>
      </Card>

      <p className="settings-foot">Expense App · v1.0</p>

      <CategoryManager open={catOpen} onClose={() => setCatOpen(false)} />
    </div>
  );
}