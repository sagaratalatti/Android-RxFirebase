import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ModuleCard } from '../components/ui';
import { modules } from '../lib/modules';
import { isAIConfigured, checkServerAI, getAIMode, getAIStatusLabel } from '../lib/ai-service';
import { Sparkles, Key } from 'lucide-react';
import OnboardingBanner from '../components/OnboardingBanner';
import { PlanUsageBadge } from '../components/UpgradeBanner';

export default function DashboardPage() {
  const [aiEnabled, setAiEnabled] = useState(isAIConfigured());
  const [statusLabel, setStatusLabel] = useState(getAIStatusLabel());

  useEffect(() => {
    checkServerAI().then(() => {
      setAiEnabled(isAIConfigured());
      setStatusLabel(getAIStatusLabel());
    });
  }, []);

  const mode = getAIMode();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-400">
          Choose a module to generate startup intelligence with loop-prompt AI.
        </p>
        <div className="mt-3">
          <PlanUsageBadge />
        </div>
      </div>

      <OnboardingBanner />

      {!aiEnabled && (
        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <Key className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-medium text-amber-200">
              {mode === 'server' ? 'Server AI not configured' : 'Demo mode active'}
            </p>
            <p className="mt-1 text-sm text-amber-200/70">
              {mode === 'server' ? (
                <>
                  Set <code className="text-amber-100">OPENAI_API_KEY</code> on your deployment, or
                  switch mode in{' '}
                  <Link to="/settings" className="underline hover:text-amber-100">
                    Settings
                  </Link>
                  .
                </>
              ) : (
                <>
                  Enable live AI in{' '}
                  <Link to="/settings" className="underline hover:text-amber-100">
                    Settings
                  </Link>{' '}
                  — use a browser key or server proxy. Demo mode uses sample outputs.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {aiEnabled && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <p className="text-sm text-emerald-200">{statusLabel}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            title={mod.title}
            description={mod.description}
            icon={mod.icon as 'BarChart3' | 'ClipboardCheck' | 'Rocket' | 'Share2'}
            color={mod.color}
            loopCount={mod.loopCount}
            to={`/generate/${mod.id}`}
          />
        ))}
      </div>

      <div className="mt-12 glass-card p-8">
        <h2 className="mb-4 text-xl font-semibold">How to get the best results</h2>
        <ul className="space-y-3 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-brand-400">1.</span>
            Save startup profiles as workspaces in Settings for quick reuse.
          </li>
          <li className="flex gap-2">
            <span className="text-brand-400">2.</span>
            Customise loop prompts per module to match your methodology.
          </li>
          <li className="flex gap-2">
            <span className="text-brand-400">3.</span>
            Export backups to sync data across devices without an account.
          </li>
          <li className="flex gap-2">
            <span className="text-brand-400">4.</span>
            Use server proxy mode in production to keep API keys secure.
          </li>
        </ul>
      </div>
    </div>
  );
}
