import { useEffect, useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Trash2,
  Check,
  ExternalLink,
  Server,
  Monitor,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_MODELS,
  OPENROUTER_MODELS,
  PROVIDER_LABELS,
  type AIProvider,
} from '../lib/ai-provider';
import {
  getStoredApiKey,
  setStoredApiKey,
  getAIMode,
  setAIMode,
  checkServerAI,
  getAIStatusLabel,
  isAIConfigured,
  getAIProvider,
  setAIProvider,
  getAIModel,
  setAIModel,
  getServerProvider,
  getServerModel,
  type AIMode,
} from '../lib/ai-service';

const PROVIDER_LINKS: Record<AIProvider, { url: string; label: string }> = {
  openai: { url: 'https://platform.openai.com/api-keys', label: 'OpenAI Platform' },
  openrouter: { url: 'https://openrouter.ai/keys', label: 'OpenRouter' },
};

export default function AISettingsPanel() {
  const [mode, setMode] = useState<AIMode>(getAIMode());
  const [provider, setProvider] = useState<AIProvider>(getAIProvider());
  const [model, setModel] = useState(getAIModel());
  const [apiKey, setApiKey] = useState(getStoredApiKey() || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverReady, setServerReady] = useState<boolean | null>(null);
  const [statusLabel, setStatusLabel] = useState(getAIStatusLabel());

  useEffect(() => {
    checkServerAI().then((ready) => {
      setServerReady(ready);
      setStatusLabel(getAIStatusLabel());
    });
  }, [mode, provider]);

  const refreshStatus = () => {
    setStatusLabel(getAIStatusLabel());
    if (getAIMode() === 'server') {
      checkServerAI().then((ready) => setServerReady(ready));
    }
  };

  const handleModeChange = (next: AIMode) => {
    setMode(next);
    setAIMode(next);
    refreshStatus();
  };

  const handleProviderChange = (next: AIProvider) => {
    setProvider(next);
    setAIProvider(next);
    if (!localStorage.getItem('loopforge_ai_model')) {
      setModel(DEFAULT_MODELS[next]);
    }
    refreshStatus();
  };

  const handleModelChange = (next: string) => {
    setModel(next);
    setAIModel(next);
    refreshStatus();
  };

  const handleSaveKey = () => {
    setStoredApiKey(apiKey);
    if (apiKey) handleModeChange('client');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refreshStatus();
  };

  const handleClearKey = () => {
    setApiKey('');
    setStoredApiKey('');
    if (mode === 'client') handleModeChange('demo');
    refreshStatus();
  };

  const configured = isAIConfigured();
  const serverProvider = getServerProvider();
  const serverModel = getServerModel();
  const providerLink = PROVIDER_LINKS[provider];

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20">
          <Sparkles className="h-5 w-5 text-brand-400" />
        </div>
        <div>
          <h2 className="font-semibold">AI Provider</h2>
          <p className="text-sm text-slate-400">
            Connect via OpenAI or OpenRouter — demo, browser key, or server proxy.
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <ModeCard
          active={mode === 'demo'}
          title="Demo"
          description="Sample outputs, no API needed"
          icon={<Monitor className="h-5 w-5" />}
          onClick={() => handleModeChange('demo')}
        />
        <ModeCard
          active={mode === 'client'}
          title="Browser Key"
          description="Key stored locally in browser"
          icon={<Key className="h-5 w-5" />}
          onClick={() => handleModeChange('client')}
        />
        <ModeCard
          active={mode === 'server'}
          title="Server Proxy"
          description="Secure — key stays on server"
          icon={<Server className="h-5 w-5" />}
          onClick={() => handleModeChange('server')}
          badge={serverReady ? 'Ready' : serverReady === false ? 'Not configured' : '…'}
        />
      </div>

      {(mode === 'client' || mode === 'server') && (
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Provider</label>
            <select
              className="input-field"
              value={mode === 'server' ? (serverProvider ?? provider) : provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              disabled={mode === 'server'}
            >
              <option value="openai">{PROVIDER_LABELS.openai}</option>
              <option value="openrouter">{PROVIDER_LABELS.openrouter}</option>
            </select>
            {mode === 'server' && (
              <p className="mt-2 text-xs text-slate-500">
                Server provider is set via{' '}
                <code className="rounded bg-slate-800 px-1 py-0.5">AI_PROVIDER</code> env var.
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Model</label>
            {mode === 'client' && provider === 'openrouter' ? (
              <>
                <input
                  className="input-field font-mono text-sm"
                  list="openrouter-models"
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  placeholder={DEFAULT_MODELS.openrouter}
                />
                <datalist id="openrouter-models">
                  {OPENROUTER_MODELS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </>
            ) : mode === 'client' ? (
              <input
                className="input-field font-mono text-sm"
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                placeholder={DEFAULT_MODELS.openai}
              />
            ) : (
              <input
                className="input-field font-mono text-sm"
                value={serverModel ?? ''}
                readOnly
                placeholder="Set AI_MODEL on server"
              />
            )}
          </div>
        </div>
      )}

      <div
        className={`mb-4 rounded-lg px-4 py-3 text-sm ${
          configured ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'
        }`}
      >
        Status: {statusLabel}
      </div>

      {mode === 'client' && (
        <>
          <div className="relative mb-4">
            <input
              type={showKey ? 'text' : 'password'}
              className="input-field pr-12 font-mono text-sm"
              placeholder={provider === 'openrouter' ? 'sk-or-...' : 'sk-...'}
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
            <button className="btn-primary text-sm" onClick={handleSaveKey}>
              {saved ? <Check className="h-4 w-4" /> : null}
              {saved ? 'Saved!' : 'Save Key'}
            </button>
            {apiKey && (
              <button className="btn-secondary text-sm" onClick={handleClearKey}>
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Get a key from{' '}
            <a
              href={providerLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-400 hover:underline"
            >
              {providerLink.label}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </>
      )}

      {mode === 'server' && (
        <div className="rounded-lg bg-slate-900/50 p-4 text-sm text-slate-400">
          <p className="mb-2">
            Set one of these on your deployment (Vercel/Netlify):
          </p>
          <ul className="mb-3 list-inside list-disc space-y-1 text-slate-500">
            <li>
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-300">OPENAI_API_KEY</code>{' '}
              — direct OpenAI
            </li>
            <li>
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-300">OPENROUTER_API_KEY</code>{' '}
              — OpenRouter (auto-detected)
            </li>
            <li>
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-300">AI_PROVIDER</code>{' '}
              — optional: <code className="text-slate-400">openai</code> or{' '}
              <code className="text-slate-400">openrouter</code>
            </li>
            <li>
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-300">AI_MODEL</code>{' '}
              — optional model override (e.g. <code className="text-slate-400">openai/gpt-4o-mini</code>)
            </li>
          </ul>
          <p>
            {serverReady
              ? `✓ Server proxy is configured${serverProvider ? ` (${PROVIDER_LABELS[serverProvider]})` : ''}.`
              : serverReady === false
                ? 'Server proxy not detected. Deploy with OPENAI_API_KEY or OPENROUTER_API_KEY, or set them in .env for local dev.'
                : 'Checking server availability…'}
          </p>
        </div>
      )}
    </div>
  );
}

function ModeCard({
  active,
  title,
  description,
  icon,
  onClick,
  badge,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all ${
        active
          ? 'border-brand-500 bg-brand-500/10'
          : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
      }`}
    >
      <div className={`mb-2 ${active ? 'text-brand-400' : 'text-slate-400'}`}>{icon}</div>
      <p className="font-medium text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
      {badge && (
        <span className="mt-2 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
          {badge}
        </span>
      )}
    </button>
  );
}
