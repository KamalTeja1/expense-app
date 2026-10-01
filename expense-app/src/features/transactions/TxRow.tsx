import { useRef, useState, type PointerEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ICON_MAP } from '../../lib/categories';
import { useCategoryMap } from '../../lib/useCategoryMap';
import { formatMoney, formatDayLabel } from '../../lib/format';
import { useAddTxBus } from '../../store/addTxBus';
import { softDeleteTx } from '../../lib/db';
import { toast } from '../../components/ui/Toast';
import type { Transaction } from '../../lib/types';
import TxContextSheet from './TxContextSheet';
import './TxRow.css';

export interface TxRowProps {
  tx: Transaction;
  currency: string;
}

const SWIPE = 88;

export default function TxRow({ tx, currency }: TxRowProps) {
  const openSheet = useAddTxBus((s) => s.openSheet);
  const { get } = useCategoryMap();
  const [dx, setDx] = useState(0);
  const [ctxOpen, setCtxOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const movedRef = useRef(false);

  const cat = get(tx.categoryId);
  const Icon = ICON_MAP[cat.icon];
  const isIncome = tx.type === 'income';

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    movedRef.current = false;
    longPressTimer.current = window.setTimeout(() => {
      if (!movedRef.current) {
        setCtxOpen(true);
      }
    }, 550);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;

    if (Math.abs(delta) > 6) {
      movedRef.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    if (delta < 0) setDx(Math.max(-SWIPE, delta));
    else setDx(0);
  };

  const onPointerUp = () => {
    startX.current = null;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setDx(dx < -SWIPE / 2 ? -SWIPE : 0);
  };

  const handleEdit = () => {
    setDx(0);
    openSheet(tx);
  };

  const handleDelete = async () => {
    await softDeleteTx(tx.id);
    toast('Deleted', 'success');
  };

  return (
    <div className="tx-row-wrap" data-testid="tx-row">
      <div className="tx-row-actions">
        <button type="button" className="tx-action edit" onClick={handleEdit} aria-label="Edit">
          <Pencil size={16} />
        </button>
        <button
          type="button"
          className="tx-action del"
          onClick={() => void handleDelete()}
          aria-label="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div
        className="tx-row"
        style={{ transform: `translateX(${dx}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (ctxOpen) return;
          if (dx === 0) handleEdit();
          else setDx(0);
        }}
      >
        <div
          className="tx-row-icon"
          style={{ backgroundColor: `${cat.color}26`, color: cat.color }}
        >
          {Icon && <Icon size={18} />}
        </div>
        <div className="tx-row-body">
          <div className="tx-row-name">{cat.name}</div>
          {tx.note && <div className="tx-row-note">{tx.note}</div>}
        </div>
        <div className="tx-row-right">
          <div className={isIncome ? 'tx-row-amt income' : 'tx-row-amt expense'}>
            {isIncome ? '+' : '-'}
            {formatMoney(tx.amountMinor, currency)}
          </div>
          <div className="tx-row-date">{formatDayLabel(tx.date)}</div>
        </div>
      </div>

      <TxContextSheet tx={ctxOpen ? tx : null} onClose={() => setCtxOpen(false)} />
    </div>
  );
}