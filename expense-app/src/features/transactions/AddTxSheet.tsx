import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Sheet from '../../components/ui/Sheet';
import SegmentedTabs from '../../components/ui/SegmentedTabs';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { useAddTxBus } from '../../store/addTxBus';
import { useAppStore } from '../../store/useAppStore';
import { createTx, updateTx, getAllCategories } from '../../lib/db';
import { parseMoneyToMinor, todayLocal } from '../../lib/format';
import { ICON_MAP } from '../../lib/categories';
import type { TxType } from '../../lib/types';
import './AddTxSheet.css';


function todayIso(): string {
  return todayLocal();
}

function currencySymbol(currency: string): string {
  if (currency === 'INR') return '₹';
  if (currency === 'USD') return '$';
  if (currency === 'EUR') return '€';
  if (currency === 'GBP') return '£';
  return '';
}

export default function AddTxSheet() {
  const open = useAddTxBus((s) => s.open);
  const editing = useAddTxBus((s) => s.editing);
  const closeSheet = useAddTxBus((s) => s.closeSheet);
  const currency = useAppStore((s) => s.currency);

  const [type, setType] = useState<TxType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(() => todayIso());
  const [note, setNote] = useState('');

  const categories = useLiveQuery(() => getAllCategories(), []) ?? [];

  const filtered = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setAmountStr((editing.amountMinor / 100).toString());
      setCategoryId(editing.categoryId);
      setDate(editing.date);
      setNote(editing.note ?? '');
    } else {
      setType('expense');
      setAmountStr('');
      setCategoryId('');
      setDate(todayIso());
      setNote('');
    }
  }, [open, editing]);

  useEffect(() => {
    if (!categoryId) return;
    const stillValid = filtered.some((c) => c.id === categoryId);
    if (!stillValid) setCategoryId('');
  }, [filtered, categoryId]);

  const amountMinor = parseMoneyToMinor(amountStr);
  const canSave = amountMinor > 0 && categoryId !== '';

  const handleSave = async () => {
    if (!canSave) return;
    const payload = {
      type,
      amountMinor,
      categoryId,
      date,
      note: note.trim() || undefined,
    };
    if (editing) {
      await updateTx(editing.id, payload);
      toast('Updated', 'success');
    } else {
      await createTx(payload);
      toast('Saved', 'success');
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
    closeSheet();
  };

  return (
    <Sheet
      open={open}
      onClose={closeSheet}
      title={editing ? 'Edit transaction' : 'Add transaction'}
    >
      <div className="tx-sheet">
        <SegmentedTabs
          items={[
            { id: 'expense', label: 'Expense', icon: ArrowUpRight },
            { id: 'income', label: 'Income', icon: ArrowDownLeft },
          ]}
          value={type}
          onChange={(v) => setType(v as TxType)}
        />

        <div className="tx-amount-display">
          <span className="tx-currency">{currencySymbol(currency)}</span>
          <input
            className="tx-amount-input"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            autoFocus
          />
        </div>

        <div className="tx-category-row">
          {filtered.map((c) => {
            const Icon = ICON_MAP[c.icon];
            const active = c.id === categoryId;
            return (
              <button
                key={c.id}
                type="button"
                className={active ? 'tx-cat active' : 'tx-cat'}
                onClick={() => setCategoryId(c.id)}
                aria-label={c.name}
              >
                <span
                  className="tx-cat-icon"
                  style={{
                    backgroundColor: active ? c.color : `${c.color}26`,
                    color: active ? 'white' : c.color,
                  }}
                >
                  {Icon && <Icon size={20} />}
                </span>
                <span className="tx-cat-name">{c.name}</span>
              </button>
            );
          })}
        </div>

        <label className="tx-row">
          <span className="tx-row-label">Date</span>
          <input
            className="tx-row-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className="tx-row">
          <span className="tx-row-label">Note</span>
          <input
            className="tx-row-input"
            type="text"
            placeholder="Optional"
            maxLength={80}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className="tx-sheet-footer">
          <Button
            variant="primary"
            onClick={() => void handleSave()}
            disabled={!canSave}
            style={{ width: '100%' }}
          >
            {editing ? 'Update' : type === 'expense' ? 'Save expense' : 'Save income'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}