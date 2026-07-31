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

## AI Configuration

1. Go to **Settings** in the app
2. Add your [OpenAI API key](https://platform.openai.com/api-keys)
3. Keys are stored locally in your browser only

Without an API key, the app runs in **demo mode** with sample outputs tailored to your startup profile.

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- vite-plugin-pwa (Workbox)
- React Router
- Lucide icons

## Project Structure

```
web/
├── src/
│   ├── components/    # UI components
│   ├── lib/           # Loop engine, prompts, AI service
│   ├── pages/         # Landing, Dashboard, Generator, Settings
│   └── types/         # TypeScript types
├── public/            # Static assets & PWA icons
└── vite.config.ts     # PWA manifest config
```

## How Loop Prompts Work

Each module runs multiple sequential AI loops:

1. **Loop 1** — Foundational analysis using your startup profile
2. **Loop 2** — Builds on Loop 1 with specialised depth
3. **Loop 3+** — Synthesises prior outputs into actionable deliverables

This iterative approach produces more coherent, context-aware results than single-shot prompting.

## License

Apache 2.0
