import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Rocket, Settings, Sparkles } from 'lucide-react';
import { getWorkspaces } from '../lib/workspaces';
import { isSupabaseConfigured } from '../lib/supabase';

const ONBOARDING_KEY = 'loopforge_onboarding_complete';

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function markOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

export default function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(isOnboardingComplete());
  const hasWorkspaces = getWorkspaces().length > 0;

  if (dismissed || hasWorkspaces) return null;

  const steps = [
    {
      icon: <Settings className="h-5 w-5" />,
      title: 'Set up your workspace',
      description: 'Save your startup profile in Settings for quick reuse.',
      link: '/settings',
      linkText: 'Open Settings',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Enable live AI',
      description: 'Use server proxy or a browser key for real GPT-4o-mini output.',
      link: '/settings',
      linkText: 'Configure AI',
    },
    {
      icon: <Rocket className="h-5 w-5" />,
      title: 'Run your first module',
      description: 'Start with Business Analysis or GTM Strategy.',
      link: '/generate/business-analysis',
      linkText: 'Start Analysis',
    },
  ];

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-600/10 to-cyan-600/5">
      <div className="flex items-start justify-between gap-4 p-6">
        <div>
          <h2 className="mb-1 text-lg font-semibold">Welcome to LoopForge 👋</h2>
          <p className="text-sm text-slate-400">
            Get started in 3 steps — {isSupabaseConfigured() ? 'sign in for cloud sync.' : 'no account needed.'}
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          onClick={() => {
            markOnboardingComplete();
            setDismissed(true);
          }}
          aria-label="Dismiss onboarding"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-px border-t border-brand-500/20 bg-brand-500/10 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={i} className="bg-surface/60 p-5">
            <div className="mb-3 text-brand-400">{step.icon}</div>
            <h3 className="mb-1 text-sm font-semibold">{step.title}</h3>
            <p className="mb-3 text-xs leading-relaxed text-slate-500">{step.description}</p>
            <Link
              to={step.link}
              className="text-xs font-medium text-brand-400 hover:text-brand-300"
              onClick={() => {
                markOnboardingComplete();
                setDismissed(true);
              }}
            >
              {step.linkText} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
