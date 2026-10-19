import { useToastStore, type ToastTone } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';
import './Toast.css';

export function ToastHost() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  const iconFor = (tone: ToastTone) => {
    if (tone === 'success') return <CheckCircle2 size={18} />;
    if (tone === 'error') return <AlertCircle size={18} />;
    return <Info size={18} />;
  };

  return (
    <div className="toast-host" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={clsx('toast', `toast-${t.tone}`)} data-testid="toast">
          <span className="toast-icon">{iconFor(t.tone)}</span>
          <span className="toast-msg">{t.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}