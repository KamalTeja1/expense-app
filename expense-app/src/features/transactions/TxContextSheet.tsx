import { Copy, Pencil, Trash2 } from 'lucide-react';
import Sheet from '../../components/ui/Sheet';
import { toast } from '../../components/ui/Toast';
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

  const handleEdit = () => {
    if (!tx) return;
    openSheet(tx);
    onClose();
  };

  const handleDuplicate = async () => {
    if (!tx) return;
    await createTx({ ...tx, id: undefined });
    toast('Duplicated', 'success');
    onClose();
  };

  const handleDelete = async () => {
    if (!tx) return;
    await softDeleteTx(tx.id);
    toast('Deleted', 'success');
    onClose();
  };

  return (
    <Sheet open={!!tx} onClose={onClose}>
      <div className="ctx-root">
        <button type="button" className="ctx-item" onClick={handleEdit}>
          <Pencil size={18} />
          <span>Edit</span>
        </button>
        <button type="button" className="ctx-item" onClick={() => void handleDuplicate()}>
          <Copy size={18} />
          <span>Duplicate</span>
        </button>
        <button
          type="button"
          className="ctx-item danger"
          onClick={() => void handleDelete()}
        >
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
      </div>
    </Sheet>
  );
}