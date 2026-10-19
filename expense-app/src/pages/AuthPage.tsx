import { type FormEvent, useRef, useState } from 'react';
import { LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../store/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import './AuthPage.css';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const submitLock = useRef(false);

  const signIn = useAuth((s) => s.signIn);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitLock.current || !isSupabaseConfigured) return;

    submitLock.current = true;
    setLocalError(null);
    setSubmitting(true);

    try {
      const result = await signIn(email.trim(), password);
      if (!result.ok) {
        setLocalError(result.error ?? 'Sign in failed');
      }
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.'
      );
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-mark">₹</div>
          <h1 className="auth-title">Expense App</h1>
          <p className="auth-sub">Sign in with the credentials provided to you.</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="auth-warn">
            Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your
            .env file and restart the dev server.
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={(e) => void handleSubmit(e)}
          aria-busy={submitting}
        >
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              className="auth-input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </label>

          {localError && (
            <div className="auth-error" role="alert">{localError}</div>
          )}

          <Button
            variant="primary"
            type="submit"
            loading={submitting}
            disabled={submitting || !isSupabaseConfigured}
            leftIcon={<LogIn size={16} />}
            style={{ width: '100%' }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="auth-foot">
          Don't have an account? Ask the app owner to create one for you.
        </p>
      </div>
    </div>
  );
}
