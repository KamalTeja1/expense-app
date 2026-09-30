import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import {
  UtensilsCrossed,
  Car,
  Home,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Clapperboard,
  GraduationCap,
  ShoppingCart,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Gift,
  Coffee,
  Plane,
  Dumbbell,
  Book,
  Music,
  Smartphone,
  Zap,
  Fuel,
  Pizza,
  Baby,
  PawPrint,
  Shirt,
  CreditCard,
  Landmark,
  Banknote,
  TrendingUp,
  PiggyBank,
  Coins,
} from 'lucide-react';
import { Modal } from '../../components/ui/Sheet';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { db, getAllCategories, getAllTxs } from '../../lib/db';
import { CATEGORY_COLORS } from '../../lib/categories';
import type { Category, TxType } from '../../lib/types';
import './CategoryManager.css';

export interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
}

const ICON_CHOICES: { name: string; Icon: LucideIcon }[] = [
  { name: 'UtensilsCrossed', Icon: UtensilsCrossed },
  { name: 'Car', Icon: Car },
  { name: 'Home', Icon: Home },
  { name: 'ShoppingBag', Icon: ShoppingBag },
  { name: 'Receipt', Icon: Receipt },
  { name: 'HeartPulse', Icon: HeartPulse },
  { name: 'Clapperboard', Icon: Clapperboard },
  { name: 'GraduationCap', Icon: GraduationCap },
  { name: 'ShoppingCart', Icon: ShoppingCart },
  { name: 'MoreHorizontal', Icon: MoreHorizontal },
  { name: 'Wallet', Icon: Wallet },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'Gift', Icon: Gift },
  { name: 'Coffee', Icon: Coffee },
  { name: 'Plane', Icon: Plane },
  { name: 'Dumbbell', Icon: Dumbbell },
  { name: 'Book', Icon: Book },
  { name: 'Music', Icon: Music },
  { name: 'Smartphone', Icon: Smartphone },
  { name: 'Zap', Icon: Zap },
  { name: 'Fuel', Icon: Fuel },
  { name: 'Pizza', Icon: Pizza },
  { name: 'Baby', Icon: Baby },
  { name: 'PawPrint', Icon: PawPrint },
  { name: 'Shirt', Icon: Shirt },
  { name: 'CreditCard', Icon: CreditCard },
  { name: 'Landmark', Icon: Landmark },
  { name: 'Banknote', Icon: Banknote },
  { name: 'TrendingUp', Icon: TrendingUp },
  { name: 'PiggyBank', Icon: PiggyBank },
  { name: 'Coins', Icon: Coins },
];

function iconFor(name: string): LucideIcon {
  return ICON_CHOICES.find((i) => i.name === name)?.Icon ?? MoreHorizontal;
}

export default function CategoryManager({ open, onClose }: CategoryManagerProps) {
  const categories = useLiveQuery(() => getAllCategories(), []) ?? [];
  const txs = useLiveQuery(() => getAllTxs(), []) ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('MoreHorizontal');
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);
  const [type, setType] = useState<TxType>('expense');

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setIcon(editing.icon);
      setColor(editing.color);
      setType(editing.type);
    } else {
      setName('');
      setIcon('MoreHorizontal');
      setColor(CATEGORY_COLORS[0]);
      setType('expense');
    }
  }, [editing, formOpen]);

  const usage = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of txs) {
      m.set(t.categoryId, (m.get(t.categoryId) ?? 0) + 1);
    }
    return m;
  }, [txs]);

  const expense = categories.filter((c) => c.type === 'expense');
  const income = categories.filter((c) => c.type === 'income');

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editing) {
      await db.categories.update(editing.id, { name: trimmed, icon, color, type });
      toast('Category updated', 'success');
    } else {
      const id =
        trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
        '-' +
        Date.now().toString(36);
      await db.categories.put({ id, name: trimmed, icon, color, type });
      toast('Category added', 'success');
    }
    closeForm();
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmingDelete) return;
    const fallbackId =
      confirmingDelete.type === 'expense' ? 'other-expense' : 'other-income';
    const toReassign = txs.filter((t) => t.categoryId === confirmingDelete.id);
    if (toReassign.length > 0) {
      await Promise.all(
        toReassign.map((t) => db.transactions.update(t.id, { categoryId: fallbackId }))
      );
    }
    await db.categories.delete(confirmingDelete.id);
    toast('Category deleted', 'success');
    setConfirmingDelete(null);
  };

  const renderRow = (c: Category) => {
    const Icon = iconFor(c.icon);
    const used = usage.get(c.id) ?? 0;
    return (
      <li key={c.id} className="cm-row">
        <span className="cm-icon" style={{ backgroundColor: `${c.color}26`, color: c.color }}>
          <Icon size={18} />
        </span>
        <div className="cm-row-body">
          <div className="cm-row-name">{c.name}</div>
          <div className="cm-row-meta">
            {used} {used === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>
        <button type="button" className="cm-row-btn" onClick={() => openEdit(c)} aria-label="Edit">
          <Pencil size={16} />
        </button>
        <button
          type="button"
          className="cm-row-btn danger"
          onClick={() => setConfirmingDelete(c)}
          aria-label="Delete"
        >
          <Trash2 size={16} />
        </button>
      </li>
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage categories">
      <div className="cm-root">
        <div className="cm-toolbar">
          <p className="cm-hint">
            Add, edit, or remove categories. Deleted categories reassign their transactions to
            "Other".
          </p>
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={openAdd}>
            Add category
          </Button>
        </div>

        {!formOpen && (
          <div className="cm-lists">
            <section>
              <h3 className="cm-group-title">Expense</h3>
              <ul className="cm-list">{expense.map(renderRow)}</ul>
            </section>

            <section>
              <h3 className="cm-group-title">Income</h3>
              <ul className="cm-list">{income.map(renderRow)}</ul>
            </section>
          </div>
        )}

        {formOpen && (
          <div className="cm-form">
            <div className="cm-form-head">
              <h3 className="cm-form-title">{editing ? 'Edit category' : 'New category'}</h3>
              <button type="button" className="cm-form-close" onClick={closeForm} aria-label="Cancel">
                <X size={18} />
              </button>
            </div>

            <div className="cm-segment">
              <button
                type="button"
                className={clsx('cm-seg', type === 'expense' && 'active')}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={clsx('cm-seg', type === 'income' && 'active')}
                onClick={() => setType('income')}
              >
                Income
              </button>
            </div>

            <label className="cm-field">
              <span className="cm-field-label">Name</span>
              <input
                className="cm-input"
                type="text"
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Coffee"
                autoFocus
              />
            </label>

            <div className="cm-field">
              <span className="cm-field-label">Color</span>
              <div className="cm-swatches">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={clsx('cm-swatch', color === c && 'active')}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="cm-field">
              <span className="cm-field-label">Icon</span>
              <div className="cm-icons">
                {ICON_CHOICES.map(({ name: n, Icon }) => (
                  <button
                    key={n}
                    type="button"
                    className={clsx('cm-icon-btn', icon === n && 'active')}
                    onClick={() => setIcon(n)}
                    aria-label={n}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div className="cm-form-actions">
              <Button variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleSave()}
                disabled={!name.trim()}
                style={{ flex: 1 }}
              >
                {editing ? 'Save changes' : 'Add category'}
              </Button>
            </div>
          </div>
        )}

        {confirmingDelete && (
          <div className="cm-confirm-backdrop">
            <div className="cm-confirm">
              <h3 className="cm-confirm-title">Delete "{confirmingDelete.name}"?</h3>
              <p className="cm-confirm-text">
                Any transactions using this category will be moved to "Other". This cannot be
                undone.
              </p>
              <div className="cm-confirm-actions">
                <Button variant="ghost" onClick={() => setConfirmingDelete(null)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => void handleDeleteConfirmed()}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}