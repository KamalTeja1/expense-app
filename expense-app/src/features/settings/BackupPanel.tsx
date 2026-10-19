import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatDistanceToNow } from 'date-fns';
import { CloudUpload, CloudDownload, Wifi } from 'lucide-react';
import clsx from 'clsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from '../../store/toastStore';
import { getSettings, saveSettings } from '../../lib/db';
import { useAuth } from '../../store/useAuth';
import { testConnection, backupNow, restoreNow } from '../../lib/sync';
import type { AppSettings } from '../../lib/types';
import './BackupPanel.css';

export default function BackupPanel() {
  const user = useAuth((s) => s.user);
  const settings = useLiveQuery(() => getSettings(), []) as AppSettings | undefined;

  const [operation, setOperation] = useState<'test' | 'backup' | 'restore' | 'auto' | null>(null);
  const actionLock = useRef(false);
  const testing = operation === 'test';
  const backing = operation === 'backup';
  const restoring = operation === 'restore';
  const savingAuto = operation === 'auto';
  const busy = operation !== null;
  const [confirmRestore, setConfirmRestore] = useState(false);

  const lastBackupLabel = settings?.lastBackupAt
    ? formatDistanceToNow(settings.lastBackupAt, { addSuffix: true })
    : 'Never';

  const runOp = async (
    kind: 'test' | 'backup' | 'restore' | 'auto',
    work: () => Promise<void>
  ) => {
    if (actionLock.current) return;
    actionLock.current = true;
    setOperation(kind);
    try {
      await work();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Something went wrong', 'error');
    } finally {
      actionLock.current = false;
      setOperation(null);
    }
  };

  const handleTest = () =>
    runOp('test', async () => {
      const r = await testConnection();
      if (r.ok) toast(`Connected as ${r.data.email ?? 'user'}`, 'success');
      else toast(r.error, 'error');
    });

  const handleBackup = () =>
    runOp('backup', async () => {
      const r = await backupNow();
      if (r.ok) toast(`Backed up ${r.data.pushed} rows`, 'success');
      else toast(r.error, 'error');
    });

  const handleRestore = () =>
    runOp('restore', async () => {
      const r = await restoreNow();
      if (r.ok) toast(`Restored ${r.data.pulled} rows`, 'success');
      else toast(r.error, 'error');
      setConfirmRestore(false);
    });

  const handleAutoBackupToggle = () =>
    runOp('auto', async () => {
      await saveSettings({ autoBackup: !settings?.autoBackup });
    });

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
            <span className="bp2-label">{savingAuto ? 'Saving…' : 'Auto-backup'}</span>
            <button
              type="button"
              className={clsx('bp2-switch', settings?.autoBackup && 'on')}
              onClick={() => void handleAutoBackupToggle()}
              aria-pressed={settings?.autoBackup ?? false}
              aria-label="Toggle auto-backup"
              aria-busy={savingAuto}
              disabled={busy || confirmRestore}
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
              disabled={busy || confirmRestore}
              leftIcon={<Wifi size={14} />}
            >
              {testing ? 'Testing…' : 'Test connection'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleBackup()}
              loading={backing}
              disabled={busy || confirmRestore}
              leftIcon={<CloudUpload size={14} />}
            >
              {backing ? 'Backing up…' : 'Backup now'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmRestore(true)}
              disabled={busy || confirmRestore}
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
                <Button variant="ghost" disabled={busy} onClick={() => setConfirmRestore(false)}>
                  Cancel
                </Button>
                <Button variant="primary" loading={restoring} disabled={busy} onClick={() => void handleRestore()}>
                  {restoring ? 'Restoring…' : 'Restore'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}