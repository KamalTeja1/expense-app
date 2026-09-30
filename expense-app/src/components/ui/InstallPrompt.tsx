import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import Button from './Button';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem('installPromptDismissedAt');
    if (
      dismissedAt &&
      Date.now() - Number(dismissedAt) < 14 * 86400 * 1000
    ) {
      return;
    }

    const installed = window.matchMedia('(display-mode: standalone)').matches;
    if (installed) return;

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !window.matchMedia('(display-mode: standalone)').matches;

    if (ios) {
      setIsIos(true);
      setVisible(true);
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') setVisible(false);
    setDeferred(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissedAt', String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="install-prompt" data-testid="install-prompt">
      <div className="ip-icon">
        <Download size={20} />
      </div>
      <div className="ip-body">
        <div className="ip-title">Install Expense App</div>
        <div className="ip-desc">
          {isIos
            ? 'Tap Share, then "Add to Home Screen".'
            : 'Add it to your home screen for offline access.'}
        </div>
      </div>
      {!isIos && (
        <Button variant="primary" size="sm" onClick={() => void handleInstall()}>
          Install
        </Button>
      )}
      <button
        type="button"
        className="ip-close"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}