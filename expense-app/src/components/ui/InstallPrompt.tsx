import { useState, useSyncExternalStore } from 'react';
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

const DISMISS_KEY = 'installPromptDismissedAt';
const DISMISS_DURATION_MS = 14 * 86400 * 1000;

type PromptMode = 'hidden' | 'ios' | 'native';

function readPromptMode(): PromptMode {
  // Already installed?
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS Safari only
    window.navigator.standalone === true;

  if (standalone) return 'hidden';

  // Dismissed recently?
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
  if (dismissedAt && Date.now() - dismissedAt < DISMISS_DURATION_MS) {
    return 'hidden';
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' : 'native';
}

// index.html captures beforeinstallprompt and emits installpromptready.
function subscribeToInstallPrompt(onChange: () => void) {
  window.addEventListener('installpromptready', onChange);
  window.addEventListener('appinstalled', onChange);

  return () => {
    window.removeEventListener('installpromptready', onChange);
    window.removeEventListener('appinstalled', onChange);
  };
}

function getDeferredInstallPrompt() {
  return window.__deferredInstallPrompt;
}

export default function InstallPrompt() {
  const [mode] = useState(readPromptMode);
  const [dismissed, setDismissed] = useState(false);
  const deferred = useSyncExternalStore(
    subscribeToInstallPrompt,
    getDeferredInstallPrompt
  );

  const isIos = mode === 'ios';
  const visible =
    !dismissed && (isIos || (mode === 'native' && deferred !== null));

  const handleInstall = async () => {
    if (!deferred) return;

    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // The browser may reject a prompt that is no longer available.
    } finally {
      // A deferred install prompt can only be used once.
      window.__deferredInstallPrompt = null;
      window.__installPromptReady = false;
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
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
