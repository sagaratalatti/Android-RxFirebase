import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { getServerHealth, handleChatRequest, readJsonBody } from './server/chat-handler';

function devApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'loopforge-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(getServerHealth(env)));
      });

      server.middlewares.use('/api/chat', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          const parsed = readJsonBody<{ prompt: string; systemContext: string }>(body);
          if (!parsed) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
          }

          const result = await handleChatRequest(parsed, env);
          res.setHeader('Content-Type', 'application/json');
          if ('error' in result) {
            res.statusCode = result.status;
            res.end(JSON.stringify({ error: result.error }));
            return;
          }
          res.end(JSON.stringify({ content: result.content }));
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      devApiPlugin(env),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'LoopForge — AI for Startups',
          short_name: 'LoopForge',
          description:
            'Customised loop-prompt AI for business analysis, audits, GTM strategy, and social media content.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/.*/i,
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
    ],
  };
});
