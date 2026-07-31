# LoopForge — Startup AI PWA

A Progressive Web App for startups to generate business analysis, audits, GTM strategies, and social media content using customised **loop-prompt AI**.

## Features

- **Business Analysis** — Market research, competitive positioning, SWOT, and 90-day action plans (3 loops)
- **Business Audit** — Operational, financial, compliance, and executive audit summary (4 loops)
- **GTM Strategy** — ICP definition, channel strategy, and 90-day launch plan (3 loops)
- **Social Media** — Brand voice, content calendar, and ready-to-post content (3 loops)
- **Loop-prompt engine** — Each AI loop builds on previous outputs for deeper analysis
- **PWA** — Installable, works offline in demo mode, auto-updating service worker
- **Export** — Copy, download as Markdown, or export as PDF
- **History** — Auto-saved generations stored locally (up to 50)
- **Custom prompts** — Edit loop prompts per module in Settings
- **Startup workspaces** — Save and reuse company profiles across modules
- **Custom branding** — App name, tagline, accent color, and logo
- **Data sync** — Export/import JSON backup to move data between devices
- **Server AI proxy** — Secure OpenAI calls via Vercel serverless (no browser key)
- **Accounts & cloud sync** — Optional Supabase auth with cross-device data sync
- **Shareable reports** — Public read-only links for generated reports

## Quick Start

```bash
cd web
npm install
cp .env.example .env   # optional — for server proxy in local dev
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy

### Vercel
```bash
cd web && npm run build
# Deploy the web/ directory — Vercel auto-detects Vite
```

### Netlify
```bash
cd web && npm run build
# Publish directory: dist
```

Both `vercel.json` and `netlify.toml` are included for SPA routing.

### Server AI (recommended for production)

1. Deploy to Vercel with root directory `web`
2. Add environment variable: `OPENAI_API_KEY=sk-...`
3. In the app, go to **Settings → AI Provider → Server Proxy**

The API key stays on the server and is never exposed to browsers.

## AI Configuration

Three modes in **Settings → AI Provider**:

| Mode | Description |
|------|-------------|
| **Demo** | Sample outputs, no API key needed |
| **Browser Key** | OpenAI key stored locally in your browser |
| **Server Proxy** | Key on server via `OPENAI_API_KEY` env var (secure) |

For local server proxy testing, create `.env` from `.env.example` with your key.

### Supabase (optional — accounts & cloud sync)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`
4. Enable Email auth in Supabase Authentication settings

Features enabled with Supabase:
- Sign up / sign in with auto-sync on login
- Cloud sync (upload/download all app data)
- Shareable report links (`/share/:id`)
- Team workspaces with invite codes and shared sync

Run `supabase/schema-v2.sql` after the base schema for teams and billing tables.

### Stripe billing (optional)

1. Create products/prices in [Stripe Dashboard](https://dashboard.stripe.com)
2. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `VITE_STRIPE_*_PRICE_ID` env vars
3. Add webhook endpoint: `https://your-domain.com/api/stripe-webhook`
4. Set `SUPABASE_SERVICE_ROLE_KEY` for webhook subscription updates

Plans: **Free** (demo), **Pro** ($19/mo), **Team** ($49/mo with team workspaces)

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- vite-plugin-pwa (Workbox)
- React Router
- React Router + Lucide icons + jsPDF + Supabase (optional)

## Project Structure

```
web/
├── api/               # Vercel serverless routes (chat, health)
├── netlify/functions/ # Netlify serverless routes (chat, health)
├── supabase/          # Database schema SQL
├── server/            # Shared API handler logic
├── src/
│   ├── components/    # UI components
│   ├── lib/           # Loop engine, prompts, history, backup
│   ├── pages/         # Landing, Dashboard, Generator, History, Settings
│   └── types/         # TypeScript types
├── public/            # Static assets & PWA icons
└── vite.config.ts     # PWA + dev API middleware
```

## How Loop Prompts Work

Each module runs multiple sequential AI loops:

1. **Loop 1** — Foundational analysis using your startup profile
2. **Loop 2** — Builds on Loop 1 with specialised depth
3. **Loop 3+** — Synthesises prior outputs into actionable deliverables

This iterative approach produces more coherent, context-aware results than single-shot prompting.

## License

Apache 2.0
