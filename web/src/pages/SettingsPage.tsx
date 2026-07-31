import { useState } from 'react';
import { Key, Eye, EyeOff, Trash2, Check, ExternalLink } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, isAIConfigured } from '../lib/ai-service';
import PromptEditor from '../components/PromptEditor';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState(getStoredApiKey() || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setApiKey('');
    setStoredApiKey('');
  };

  const configured = isAIConfigured();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Settings</h1>
      <p className="mb-10 text-slate-400">Configure your AI provider and preferences.</p>

      <div className="glass-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20">
            <Key className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="font-semibold">OpenAI API Key</h2>
            <p className="text-sm text-slate-400">
              Stored locally in your browser — never sent to our servers.
            </p>
          </div>
        </div>

        <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${configured ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
          Status: {configured ? 'Live AI enabled (GPT-4o-mini)' : 'Demo mode — no API key set'}
        </div>

        <div className="relative mb-4">
          <input
            type={showKey ? 'text' : 'password'}
            className="input-field pr-12 font-mono text-sm"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            onClick={() => setShowKey(!showKey)}
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn-primary text-sm" onClick={handleSave}>
            {saved ? <Check className="h-4 w-4" /> : null}
            {saved ? 'Saved!' : 'Save Key'}
          </button>
          {apiKey && (
            <button className="btn-secondary text-sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          Get an API key from{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand-400 hover:underline"
          >
            OpenAI Platform
            <ExternalLink className="h-3 w-3" />
          </a>
          . Without a key, LoopForge runs in demo mode with sample outputs tailored to your
          startup profile.
        </p>
      </div>

      <div className="mt-8">
        <PromptEditor />
      </div>

      <div className="mt-8 glass-card p-6 sm:p-8">
        <h2 className="mb-4 font-semibold">About LoopForge</h2>
        <div className="space-y-3 text-sm text-slate-400">
          <p>
            LoopForge is a Progressive Web App that uses customised multi-loop AI prompts
            to help startups generate:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Business analysis and market research</li>
            <li>Operational and compliance audits</li>
            <li>Go-to-market strategies and launch plans</li>
            <li>Social media content and calendars</li>
          </ul>
          <p>
            Each module runs 3–4 iterative loops where each prompt builds on previous
            outputs, producing deeper and more actionable results than single-shot AI
            generation.
          </p>
        </div>
      </div>
    </div>
  );
}
