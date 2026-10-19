import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import Sheet from '../../components/ui/Sheet';
import { toast } from '../../store/toastStore';
import { createTx, softDeleteTx } from '../../lib/db';
import { useAddTxBus } from '../../store/addTxBus';
import type { Transaction } from '../../lib/types';
import './TxContextSheet.css';

export interface TxContextSheetProps {
  tx: Transaction | null;
  onClose: () => void;
}

export default function TxContextSheet({ tx, onClose }: TxContextSheetProps) {
  const openSheet = useAddTxBus((s) => s.openSheet);
  const [busy, setBusy] = useState(false);
  const actionLock = useRef(false);

  const handleEdit = () => {
    if (!tx || busy) return;
    openSheet(tx);
    onClose();
  };

  const handleDuplicate = async () => {
    if (!tx || actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    try {
      await createTx({ ...tx, id: undefined });
      toast('Duplicated', 'success');
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Duplicate failed', 'error');
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!tx || actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    try {
      await softDeleteTx(tx.id);
      toast('Deleted', 'success');
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Delete failed', 'error');
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };

  return (
    <Sheet open={!!tx} onClose={() => { if (!busy) onClose(); }}>
      <div className="ctx-root">
        <button type="button" className="ctx-item" onClick={handleEdit} disabled={busy}>
          <Pencil size={18} />
          <span>Edit</span>
        </button>
        <button type="button" className="ctx-item" onClick={() => void handleDuplicate()} disabled={busy}>
          <Copy size={18} />
          <span>Duplicate</span>
        </button>
        <button
          type="button"
          className="ctx-item danger"
          onClick={() => void handleDelete()}
          disabled={busy}
        >
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
      </div>
    </Sheet>
  );
}