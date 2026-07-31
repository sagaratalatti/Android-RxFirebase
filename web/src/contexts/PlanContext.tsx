import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { PlanId } from '../types';
import { useAuth } from './AuthContext';
import { getUserSubscription } from '../lib/billing';
import {
  shouldEnforcePlanLimits,
  getPlanLimits,
  canUseLiveAIForPlan,
  canShareReports,
  getMaxHistory,
  canGenerateToday,
  generationsRemaining,
} from '../lib/plan-limits';

interface PlanContextValue {
  plan: PlanId;
  loading: boolean;
  limits: ReturnType<typeof getPlanLimits>;
  canUseLiveAI: boolean;
  canShare: boolean;
  maxHistory: number;
  canGenerate: boolean;
  generationsLeft: number | null;
  refresh: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { user, configured } = useAuth();
  const [plan, setPlan] = useState<PlanId>('pro');
  const [loading, setLoading] = useState(configured);

  const refresh = useCallback(async () => {
    if (!shouldEnforcePlanLimits()) {
      setPlan('pro');
      setLoading(false);
      return;
    }

    if (!user) {
      setPlan('free');
      setLoading(false);
      return;
    }

    setLoading(true);
    const sub = await getUserSubscription(user.id);
    const activePlan =
      sub && (sub.status === 'active' || sub.status === 'trialing') ? sub.plan : 'free';
    setPlan(activePlan);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const limits = getPlanLimits(plan);

  return (
    <PlanContext.Provider
      value={{
        plan,
        loading,
        limits,
        canUseLiveAI: canUseLiveAIForPlan(plan),
        canShare: canShareReports(plan),
        maxHistory: getMaxHistory(plan),
        canGenerate: canGenerateToday(plan),
        generationsLeft: generationsRemaining(plan),
        refresh,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
