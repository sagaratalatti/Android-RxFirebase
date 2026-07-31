import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';

export default function AuthPage() {
  const { configured, signIn, signUp, user } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
        <h1 className="mb-2 text-2xl font-bold">You're signed in</h1>
        <p className="mb-6 text-slate-400">{user.email}</p>
        <Link to={redirect} className="btn-primary">
          Continue
        </Link>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold">Auth Not Configured</h1>
        <p className="mb-6 text-slate-400">
          Set <code className="text-brand-300">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-brand-300">VITE_SUPABASE_ANON_KEY</code> in your environment
          to enable accounts and cloud sync.
        </p>
        <Link to="/dashboard" className="btn-secondary">
          Continue without account
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const result =
      mode === 'signin' ? await signIn(email, password) : await signUp(email, password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else if (mode === 'signup') {
      setSuccess('Account created! Check your email to confirm, then sign in.');
      setMode('signin');
    } else {
      window.location.href = redirect;
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-20">
      <div className="glass-card p-8">
        <h1 className="mb-2 text-2xl font-bold">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="mb-8 text-sm text-slate-400">
          {mode === 'signin'
            ? 'Sign in to sync your data across devices.'
            : 'Get cloud sync and shareable report links.'}
        </p>

        <div className="mb-6 flex rounded-xl border border-slate-700 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'signin' ? 'bg-brand-600 text-white' : 'text-slate-400'
            }`}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-brand-600 text-white' : 'text-slate-400'
            }`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label-text" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
