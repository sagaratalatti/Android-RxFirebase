import type { PlanId } from '../types';
import { isStripeConfigured } from './billing';
import { isSupabaseConfigured } from './supabase';

export const PLAN_LIMITS = {
  free: {
    maxHistory: 10,
    liveAI: false,
    cloudSync: false,
    shareReports: false,
    customBranding: false,
    generationsPerDay: 5,
  },
  pro: {
    maxHistory: 50,
    liveAI: true,
    cloudSync: true,
    shareReports: true,
    customBranding: true,
    generationsPerDay: Infinity,
  },
  team: {
    maxHistory: 50,
    liveAI: true,
    cloudSync: true,
    shareReports: true,
    customBranding: true,
    generationsPerDay: Infinity,
  },
} as const;

const GENERATION_COUNT_KEY = 'loopforge_daily_generations';

export function shouldEnforcePlanLimits(): boolean {
  return isStripeConfigured() && isSupabaseConfigured();
}

export function getPlanLimits(plan: PlanId) {
  return PLAN_LIMITS[plan];
}

export function canUseLiveAIForPlan(plan: PlanId): boolean {
  if (!shouldEnforcePlanLimits()) return true;
  return PLAN_LIMITS[plan].liveAI;
}

export function canShareReports(plan: PlanId): boolean {
  if (!shouldEnforcePlanLimits()) return true;
  return PLAN_LIMITS[plan].shareReports;
}

export function getMaxHistory(plan: PlanId): number {
  if (!shouldEnforcePlanLimits()) return 50;
  return PLAN_LIMITS[plan].maxHistory;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyGenerationCount(): number {
  try {
    const raw = localStorage.getItem(GENERATION_COUNT_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw) as { date: string; count: number };
    return date === todayKey() ? count : 0;
  } catch {
    return 0;
  }
}

export function incrementDailyGenerationCount(): void {
  const count = getDailyGenerationCount() + 1;
  localStorage.setItem(GENERATION_COUNT_KEY, JSON.stringify({ date: todayKey(), count }));
}

export function canGenerateToday(plan: PlanId): boolean {
  if (!shouldEnforcePlanLimits()) return true;
  const limit = PLAN_LIMITS[plan].generationsPerDay;
  if (!Number.isFinite(limit)) return true;
  return getDailyGenerationCount() < limit;
}

export function generationsRemaining(plan: PlanId): number | null {
  if (!shouldEnforcePlanLimits()) return null;
  const limit = PLAN_LIMITS[plan].generationsPerDay;
  if (!Number.isFinite(limit)) return null;
  return Math.max(0, limit - getDailyGenerationCount());
}
