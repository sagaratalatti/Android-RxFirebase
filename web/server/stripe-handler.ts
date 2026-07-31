import Stripe from 'stripe';

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function createCheckoutSession(params: {
  priceId: string;
  userId: string;
  email: string;
  origin: string;
}): Promise<{ url?: string; error?: string; status?: number }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: 'Stripe not configured. Set STRIPE_SECRET_KEY.', status: 503 };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: params.email,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: `${params.origin}/settings?billing=success`,
      cancel_url: `${params.origin}/pricing?canceled=1`,
      metadata: { userId: params.userId },
      subscription_data: {
        metadata: { userId: params.userId },
      },
    });

    return { url: session.url ?? undefined };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Checkout failed',
      status: 500,
    };
  }
}

export async function createPortalSession(params: {
  customerId: string;
  origin: string;
}): Promise<{ url?: string; error?: string; status?: number }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: 'Stripe not configured', status: 503 };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: `${params.origin}/settings`,
    });
    return { url: session.url };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Portal failed',
      status: 500,
    };
  }
}

export function planFromPriceId(priceId: string): 'pro' | 'team' {
  const teamPrice =
    process.env.STRIPE_TEAM_PRICE_ID || process.env.VITE_STRIPE_TEAM_PRICE_ID;
  if (teamPrice && priceId === teamPrice) return 'team';
  return 'pro';
}
