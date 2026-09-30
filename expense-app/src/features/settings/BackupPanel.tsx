import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatDistanceToNow } from 'date-fns';
import { CloudUpload, CloudDownload, Wifi } from 'lucide-react';
import clsx from 'clsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { getSettings, saveSettings } from '../../lib/db';
import { useAuth } from '../../store/useAuth';
import { testConnection, backupNow, restoreNow } from '../../lib/sync';
import type { AppSettings } from '../../lib/types';
import './BackupPanel.css';

export default function BackupPanel() {
  const user = useAuth((s) => s.user);
  const settings = useLiveQuery(() => getSettings(), []) as AppSettings | undefined;

  const [testing, setTesting] = useState(false);
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const lastBackupLabel = settings?.lastBackupAt
    ? formatDistanceToNow(settings.lastBackupAt, { addSuffix: true })
    : 'Never';

  const handleTest = async () => {
    setTesting(true);
    const r = await testConnection();
    setTesting(false);
    if (r.ok) toast(`Connected as ${r.data.email ?? 'user'}`, 'success');
    else toast(r.error, 'error');
  };

  const handleBackup = async () => {
    setBacking(true);
    const r = await backupNow();
    setBacking(false);
    if (r.ok) toast(`Backed up ${r.data.pushed} rows`, 'success');
    else toast(r.error, 'error');
  };

  const handleRestore = async () => {
    setRestoring(true);
    const r = await restoreNow();
    setRestoring(false);
    setConfirmRestore(false);
    if (r.ok) toast(`Restored ${r.data.pulled} rows`, 'success');
    else toast(r.error, 'error');
  };

  const handleAutoBackupToggle = async () => {
    await saveSettings({ autoBackup: !settings?.autoBackup });
  };

  return (
    <Card>
      <CardHeader title="Backup & sync" />
      <CardBody>
        <div className="bp2-root">
          <div className="bp2-row">
            <span className="bp2-label">Account</span>
            <span className="bp2-value">{user?.email ?? 'Not signed in'}</span>
          </div>

          <div className="bp2-row">
            <span className="bp2-label">Last backup</span>
            <span className="bp2-value">{lastBackupLabel}</span>
          </div>

          <div className="bp2-row">
            <span className="bp2-label">Auto-backup</span>
            <button
              type="button"
              className={clsx('bp2-switch', settings?.autoBackup && 'on')}
              onClick={() => void handleAutoBackupToggle()}
              aria-pressed={settings?.autoBackup ?? false}
              aria-label="Toggle auto-backup"
            >
              <span className="bp2-switch-knob" />
            </button>
          </div>

          <div className="bp2-hint">
            Server credentials are stored in the app's .env file and are never shown here.
          </div>

          <div className="bp2-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleTest()}
              loading={testing}
              leftIcon={<Wifi size={14} />}
            >
              Test connection
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleBackup()}
              loading={backing}
              leftIcon={<CloudUpload size={14} />}
            >
              Backup now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmRestore(true)}
              disabled={restoring}
              leftIcon={<CloudDownload size={14} />}
            >
              Restore from server
            </Button>
          </div>
        </div>

        {confirmRestore && (
          <div className="bp2-confirm-backdrop">
            <div className="bp2-confirm">
              <h3 className="bp2-confirm-title">Restore from server?</h3>
              <p className="bp2-confirm-text">
                This overwrites your local data with the latest server backup. Make a JSON export
                first if you're not sure.
              </p>
              <div className="bp2-confirm-actions">
                <Button variant="ghost" onClick={() => setConfirmRestore(false)}>
                  Cancel
                </Button>
                <Button variant="primary" loading={restoring} onClick={() => void handleRestore()}>
                  Restore
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}