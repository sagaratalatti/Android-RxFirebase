import { Link } from 'react-router-dom';
import { Zap, Crown } from 'lucide-react';
import { usePlan } from '../contexts/PlanContext';
import { shouldEnforcePlanLimits } from '../lib/plan-limits';

interface UpgradeBannerProps {
  feature: string;
  requiredPlan?: 'pro' | 'team';
}

export default function UpgradeBanner({ feature, requiredPlan = 'pro' }: UpgradeBannerProps) {
  const { plan } = usePlan();

  if (!shouldEnforcePlanLimits() || plan === requiredPlan || plan === 'team') {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
      <div className="flex items-start gap-3">
        <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <p className="font-medium text-amber-200">{feature} requires {requiredPlan === 'team' ? 'Team' : 'Pro'}</p>
          <p className="text-sm text-amber-200/70">
            You're on the Free plan. Upgrade for live AI, cloud sync, and more.
          </p>
        </div>
      </div>
      <Link to="/pricing" className="btn-primary shrink-0 text-sm">
        <Zap className="h-4 w-4" />
        Upgrade
      </Link>
    </div>
  );
}

export function PlanUsageBadge() {
  const { plan, generationsLeft, canUseLiveAI } = usePlan();

  if (!shouldEnforcePlanLimits()) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs text-slate-400">
      <span className="capitalize text-slate-300">{plan}</span>
      {!canUseLiveAI && generationsLeft !== null && (
        <span>· {generationsLeft} demo runs left today</span>
      )}
      {canUseLiveAI && <span className="text-emerald-400">· Live AI</span>}
    </div>
  );
}
