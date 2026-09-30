import { useRef, type ChangeEvent } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { exportAll, importAll, db } from '../../lib/db';
import type { BackupPayload } from '../../lib/types';
import './DataPanel.css';

export default function DataPanel() {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const payload = await exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported', 'success');
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as BackupPayload;
      if (!parsed.transactions || !parsed.categories) {
        toast('Invalid backup file', 'error');
        return;
      }
      await importAll(parsed);
      toast(`Imported ${parsed.transactions.length} transactions`, 'success');
    } catch {
      toast('Could not import file', 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleErase = async () => {
    const confirmed = window.confirm(
      'Erase ALL data on this device? This cannot be undone. ' +
        'Export first if you want to keep a copy.'
    );
    if (!confirmed) return;
    const reallySure = window.confirm('Really erase everything? There is no undo.');
    if (!reallySure) return;
    await db.transactions.clear();
    await db.categories.clear();
    toast('All data erased', 'info');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <Card>
      <CardHeader title="Data" />
      <CardBody>
        <div className="dp-root">
          <div className="dp-row">
            <div>
              <div className="dp-title">Export JSON</div>
              <div className="dp-desc">Download a backup file to your device.</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={() => void handleExport()}
            >
              Export
            </Button>
          </div>

          <div className="dp-row">
            <div>
              <div className="dp-title">Import JSON</div>
              <div className="dp-desc">Restore from a backup file.</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={handleImportClick}
            >
              Import
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="dp-file"
              onChange={(e) => void handleFile(e)}
            />
          </div>

          <div className="dp-row">
            <div>
              <div className="dp-title dp-danger">Erase all data</div>
              <div className="dp-desc">Wipes everything on this device.</div>
            </div>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => void handleErase()}
            >
              Erase
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}