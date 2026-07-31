# LoopForge Production Deployment Guide

## Prerequisites

- [Vercel](https://vercel.com) or [Netlify](https://netlify.com) account
- [Supabase](https://supabase.com) project (for auth, sync, teams)
- [Stripe](https://stripe.com) account (for billing)
- [OpenAI](https://platform.openai.com) or [OpenRouter](https://openrouter.ai) API key

## 1. Supabase Setup

1. Create a new Supabase project
2. Run SQL migrations in order:
   - `supabase/schema.sql`
   - `supabase/schema-v2.sql`
   - `supabase/schema-v3.sql`
3. Enable **Email** auth under Authentication → Providers
4. Copy **Project URL**, **anon key**, and **service_role key**

## 2. Stripe Setup

1. Create two products in Stripe Dashboard:
   - **Pro** — $19/month recurring
   - **Team** — $49/month recurring
2. Copy both **Price IDs** (`price_...`)
3. Create a webhook endpoint:
   - URL: `https://your-domain.com/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the **webhook signing secret** (`whsec_...`)

## 3. Deploy to Vercel (recommended)

1. Import your GitHub repository
2. Set **Root Directory** to `web`
3. Framework preset: **Vite**
4. Add environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For OpenAI | Server-side AI proxy (OpenAI direct) |
| `OPENROUTER_API_KEY` | For OpenRouter | Server-side AI via OpenRouter |
| `AI_PROVIDER` | Optional | `openai` or `openrouter` (auto-detected from keys) |
| `AI_MODEL` | Optional | Model override (e.g. `openai/gpt-4o-mini` for OpenRouter) |
| `APP_URL` | Optional | App URL for OpenRouter HTTP-Referer header |
| `VITE_SUPABASE_URL` | For cloud | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For cloud | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | For billing | Service role (server only) |
| `STRIPE_SECRET_KEY` | For billing | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For billing | Webhook signing secret |
| `VITE_STRIPE_PRO_PRICE_ID` | For billing | Pro plan price ID |
| `VITE_STRIPE_TEAM_PRICE_ID` | For billing | Team plan price ID |
| `VITE_STRIPE_PUBLISHABLE_KEY` | For billing | Stripe publishable key |
| `VITE_ADMIN_EMAILS` | Optional | Comma-separated admin emails |
| `ADMIN_EMAILS` | Optional | Server-side admin emails |

5. Deploy
6. In the app: **Settings → AI Provider → Server Proxy**

## 4. Deploy to Netlify

1. Connect repository, set base directory to `web`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the same environment variables as Vercel
5. `netlify.toml` handles API routing automatically

## 5. Custom Domain

### Vercel
1. Project Settings → Domains → Add `app.yourstartup.com`
2. Update DNS with provided CNAME/A records
3. SSL is automatic

### White-label branding
1. In the app: **Settings → Custom Branding**
2. Set app name, logo, accent color
3. Enable **Hide footer branding**
4. Set **Custom Domain** field for your records

## 6. Post-deploy Checklist

- [ ] `/api/health` returns `{ configured: true }`
- [ ] Sign up / sign in works
- [ ] Server AI generates live content (Pro plan)
- [ ] Stripe checkout completes and updates plan
- [ ] Cloud sync upload/download works
- [ ] Team invite link (`/join/:token`) works
- [ ] Share report link (`/share/:id`) works
- [ ] Admin dashboard (`/admin`) accessible for admin emails
- [ ] PWA installs on mobile (Add to Home Screen)

## 7. Self-hosted (no billing)

Omit Stripe env vars to disable plan enforcement. Users get full access with any configured AI mode.

```bash
cd web
cp .env.example .env
# Set OPENAI_API_KEY or OPENROUTER_API_KEY
npm install && npm run build && npm run preview
```

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to the client
- `VITE_*` variables are bundled into the frontend — only use for public keys
- Set `ADMIN_EMAILS` server-side for admin API protection
