import { Link } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PLANS, createCheckoutSession, isStripeConfigured } from '../lib/billing';
import { useState } from 'react';

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: 'pro' | 'team') => {
    if (!user) return;
    const priceId = PLANS[planId].priceId;
    if (!priceId) return;
    setLoading(planId);
    const result = await createCheckoutSession(priceId, user.id, user.email ?? '');
    if (result.url) window.location.href = result.url;
    setLoading(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Simple, startup-friendly pricing</h1>
        <p className="text-slate-400">
          Start free. Upgrade when you need live AI, cloud sync, or team collaboration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {(['free', 'pro', 'team'] as const).map((id) => {
          const plan = PLANS[id];
          const highlighted = id === 'pro';

          return (
            <div
              key={id}
              className={`glass-card flex flex-col p-8 ${
                highlighted ? 'border-brand-500/50 ring-1 ring-brand-500/30' : ''
              }`}
            >
              {highlighted && (
                <span className="mb-4 inline-block w-fit rounded-full bg-brand-600/20 px-3 py-1 text-xs font-medium text-brand-300">
                  Most popular
                </span>
              )}
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <div className="mb-6 mt-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              {id === 'free' ? (
                <Link to="/dashboard" className="btn-secondary w-full text-center">
                  Get Started
                </Link>
              ) : !user ? (
                <Link to="/auth" className="btn-primary w-full text-center">
                  Sign in to upgrade
                </Link>
              ) : (
                <button
                  className="btn-primary w-full"
                  onClick={() => handleUpgrade(id)}
                  disabled={
                    loading !== null ||
                    !('priceId' in plan && plan.priceId) ||
                    !isStripeConfigured()
                  }
                >
                  <Zap className="h-4 w-4" />
                  {loading === id ? 'Redirecting…' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-slate-500">
        Questions? All plans include access to all 4 AI modules and loop-prompt engine.
      </p>
    </div>
  );
}
