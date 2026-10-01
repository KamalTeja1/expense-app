import { useEffect, useState } from 'react';
import Sheet from '../../components/ui/Sheet';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { updateCategory } from '../../lib/db';
import { parseMoneyToMinor } from '../../lib/format';
import { getCategory } from '../../lib/categories';
import type { Category } from '../../lib/types';
import './BudgetEditor.css';

export interface BudgetEditorProps {
  open: boolean;
  category?: Category;
  onClose: () => void;
}

export default function BudgetEditor({
  open,
  category,
  onClose,
}: BudgetEditorProps) {
  const [amountStr, setAmountStr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmountStr(
      category?.budgetMinor ? (category.budgetMinor / 100).toString() : ''
    );
  }, [open, category]);

  const handleSave = async () => {
    if (!category) return;
    const minor = parseMoneyToMinor(amountStr);
    setSaving(true);

    try {
      await updateCategory(category.id, {
        budgetMinor: minor || undefined,
      });
      toast('Budget saved', 'success');
      onClose();
    } catch {
      toast('Could not save budget', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    setSaving(true);

    try {
      await updateCategory(category.id, { budgetMinor: undefined });
      toast('Budget removed', 'success');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={category ? `Budget · ${getCategory(category.id).name}` : 'Set budget'}
    >
      <div className="budget-editor">
        <label className="be-field">
          <span className="be-label">Monthly budget</span>
          <input
            className="be-input"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amountStr}
            onChange={(event) => setAmountStr(event.target.value)}
            autoFocus
          />
        </label>

        <div className="be-actions">
          {category?.budgetMinor ? (
            <Button variant="ghost" onClick={() => void handleDelete()} disabled={saving}>
              Remove
            </Button>
          ) : null}
          <Button
            variant="primary"
            onClick={() => void handleSave()}
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}