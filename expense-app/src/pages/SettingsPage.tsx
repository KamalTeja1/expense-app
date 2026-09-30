import { useState } from 'react';
import Button from '../components/ui/Button';
import CategoryManager from '../features/settings/CategoryManager';

export default function SettingsPage() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: '24px 0' }}>
      <h2>Settings</h2>
      <p style={{ color: 'var(--ink-400)', marginBottom: 16 }}>
        Placeholder — full settings page comes next.
      </p>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Manage categories
      </Button>
      <CategoryManager open={open} onClose={() => setOpen(false)} />
    </div>
  );
}