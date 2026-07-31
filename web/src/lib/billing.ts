import type { PlanId, Subscription } from '../types';
import { getSupabase, isSupabaseConfigured } from './supabase';

export const PLANS = {
  free: {
    id: 'free' as PlanId,
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Demo mode AI outputs',
      'All 4 modules',
      'Local history (up to 10)',
      'JSON backup export',
    ],
  },
  pro: {
    id: 'pro' as PlanId,
    name: 'Pro',
    price: '$19',
    period: '/month',
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID as string | undefined,
    features: [
      'Unlimited live AI generations',
      'Cloud sync across devices',
      'Shareable report links',
      'Unlimited history',
      'Custom branding',
    ],
  },
  team: {
    id: 'team' as PlanId,
    name: 'Team',
    price: '$49',
    period: '/month',
    priceId: import.meta.env.VITE_STRIPE_TEAM_PRICE_ID as string | undefined,
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Shared cloud sync for teams',
      'Invite collaborators',
      'Priority support',
    ],
  },
};

export function isStripeConfigured(): boolean {
  return Boolean(
    PLANS.pro.priceId &&
      PLANS.team.priceId &&
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  );
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id, plan, status, current_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return { user_id: userId, plan: 'free', status: 'active' };
  return data as Subscription;
}

export function canUseLiveAI(plan: PlanId): boolean {
  return plan === 'pro' || plan === 'team';
}

export function canUseTeams(plan: PlanId): boolean {
  return plan === 'team';
}

export async function createCheckoutSession(
  priceId: string,
  userId: string,
  email: string
): Promise<{ url?: string; error?: string }> {
  const response = await fetch('/api/stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userId, email }),
  });

  const data = (await response.json()) as { url?: string; error?: string };
  if (!response.ok) return { error: data.error || 'Checkout failed' };
  return data;
}

export async function createBillingPortal(
  userId: string
): Promise<{ url?: string; error?: string }> {
  const response = await fetch('/api/stripe-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  const data = (await response.json()) as { url?: string; error?: string };
  if (!response.ok) return { error: data.error || 'Portal failed' };
  return data;
}
