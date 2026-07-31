import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Check, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  PLANS,
  getUserSubscription,
  createCheckoutSession,
  createBillingPortal,
  isStripeConfigured,
} from '../lib/billing';
import type { PlanId } from '../types';

export default function BillingPanel() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanId>('free');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    getUserSubscription(user.id).then((sub) => {
      if (sub) {
        setPlan(sub.plan);
        setStatus(sub.status);
      }
    });
  }, [user]);

  const handleUpgrade = async (priceId: string | undefined) => {
    if (!user || !priceId) return;
    setLoading(true);
    setMessage('');
    const result = await createCheckoutSession(priceId, user.id, user.email ?? '');
    setLoading(false);
    if (result.url) {
      window.location.href = result.url;
    } else {
      setMessage(result.error ?? 'Checkout failed');
    }
  };

  const handlePortal = async () => {
    if (!user) return;
    setLoading(true);
    const result = await createBillingPortal(user.id);
    setLoading(false);
    if (result.url) {
      window.location.href = result.url;
    } else {
      setMessage(result.error ?? 'Could not open billing portal');
    }
  };

  const currentPlan = PLANS[plan];

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-emerald-400" />
        <div>
          <h2 className="font-semibold">Billing & Plan</h2>
          <p className="text-sm text-slate-400">
            Current plan:{' '}
            <span className="text-white">{currentPlan.name}</span>
            {status !== 'active' && (
              <span className="ml-2 text-amber-400">({status})</span>
            )}
          </p>
        </div>
      </div>

      {!isStripeConfigured() && (
        <p className="mb-4 text-sm text-slate-500">
          Stripe not configured. Set <code className="text-brand-300">STRIPE_SECRET_KEY</code> and{' '}
          <code className="text-brand-300">VITE_STRIPE_*_PRICE_ID</code> env vars.
        </p>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {(['pro', 'team'] as const).map((id) => {
          const p = PLANS[id];
          const isCurrent = plan === id;
          return (
            <div
              key={id}
              className={`rounded-xl border p-4 ${
                isCurrent ? 'border-brand-500 bg-brand-500/10' : 'border-slate-700'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">{p.name}</span>
                <span className="text-brand-400">
                  {p.price}
                  <span className="text-xs text-slate-500">{p.period}</span>
                </span>
              </div>
              <ul className="mb-4 space-y-1">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex gap-1.5 text-xs text-slate-400">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              {!user ? (
                <Link to="/auth" className="btn-secondary w-full text-xs">
                  Sign in to upgrade
                </Link>
              ) : isCurrent ? (
                <button className="btn-secondary w-full text-xs" onClick={handlePortal} disabled={loading}>
                  Manage subscription
                </button>
              ) : (
                <button
                  className="btn-primary w-full text-xs"
                  onClick={() => handleUpgrade(p.priceId)}
                  disabled={loading || !p.priceId || !isStripeConfigured()}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Link
        to="/pricing"
        className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300"
      >
        View full pricing
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>

      {message && <p className="mt-4 text-sm text-red-400">{message}</p>}
    </div>
  );
}
