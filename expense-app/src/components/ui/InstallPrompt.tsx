import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import Button from './Button';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt: BeforeInstallPromptEvent | null;
    __installPromptReady: boolean;
  }
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Already installed?
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari only
      window.navigator.standalone === true;

    if (standalone) return;

    // Dismissed recently?
    const dismissedAt = localStorage.getItem('installPromptDismissedAt');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 14 * 86400 * 1000) {
      return;
    }

    // iOS detection
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    if (ios) {
      setIsIos(true);
      setVisible(true);
      return;
    }

    // Check if the event already fired before React mounted
    if (window.__deferredInstallPrompt) {
      setDeferred(window.__deferredInstallPrompt);
      setVisible(true);
      return;
    }

    // Otherwise wait for the event
    const onReady = () => {
      if (window.__deferredInstallPrompt) {
        setDeferred(window.__deferredInstallPrompt);
        setVisible(true);
      }
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener('installpromptready', onReady);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('installpromptready', onReady);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const evt = deferred ?? window.__deferredInstallPrompt;
    if (!evt) return;
    await evt.prompt();
    const choice = await evt.userChoice;
    if (choice.outcome === 'accepted') {
      setVisible(false);
    }
    window.__deferredInstallPrompt = null;
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
        <Button variant="primary" size="sm" onClick={handleInstall}>
          Install
        </Button>
      )}
      <button className="ip-close" onClick={handleDismiss} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}