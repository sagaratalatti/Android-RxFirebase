import { useState } from 'react';
import { Palette, RotateCcw, Save, Check } from 'lucide-react';
import { defaultBranding } from '../lib/branding';
import type { BrandingConfig } from '../types';
import { useBranding } from './BrandingProvider';

export default function BrandingEditor() {
  const { branding: savedBranding, updateBranding, resetBranding } = useBranding();
  const [branding, setBranding] = useState<BrandingConfig>(savedBranding);
  const [saved, setSaved] = useState(false);

  const update = (field: keyof BrandingConfig, value: string | boolean) => {
    setBranding((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateBranding(branding);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetBranding();
    setBranding({ ...defaultBranding });
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${branding.accentColor}33` }}
        >
          <Palette className="h-5 w-5" style={{ color: branding.accentColor }} />
        </div>
        <div>
          <h2 className="font-semibold">Custom Branding</h2>
          <p className="text-sm text-slate-400">
            Personalise the app and PDF exports for your startup.
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt="Logo preview"
            className="h-12 w-12 rounded-xl object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
            style={{ backgroundColor: branding.accentColor }}
          >
            {branding.appName.charAt(0) || 'L'}
          </div>
        )}
        <div>
          <p className="font-semibold" style={{ color: branding.accentColor }}>
            {branding.appName || 'LoopForge'}
          </p>
          <p className="text-sm text-slate-400">{branding.tagline}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label-text" htmlFor="appName">
            App / Company Name
          </label>
          <input
            id="appName"
            className="input-field"
            value={branding.appName}
            onChange={(e) => update('appName', e.target.value)}
            placeholder="LoopForge"
          />
        </div>
        <div>
          <label className="label-text" htmlFor="tagline">
            Tagline
          </label>
          <input
            id="tagline"
            className="input-field"
            value={branding.tagline}
            onChange={(e) => update('tagline', e.target.value)}
            placeholder="Customised loop-prompt AI for startups"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text" htmlFor="accentColor">
              Accent Color
            </label>
            <div className="flex gap-3">
              <input
                id="accentColor"
                type="color"
                className="h-12 w-14 cursor-pointer rounded-lg border border-slate-600 bg-transparent"
                value={branding.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
              />
              <input
                className="input-field font-mono text-sm"
                value={branding.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                placeholder="#6366f1"
              />
            </div>
          </div>
          <div>
            <label className="label-text" htmlFor="logoUrl">
              Logo URL (optional)
            </label>
            <input
              id="logoUrl"
              className="input-field"
              value={branding.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text" htmlFor="pwaShortName">
              PWA Short Name
            </label>
            <input
              id="pwaShortName"
              className="input-field"
              value={branding.pwaShortName}
              onChange={(e) => update('pwaShortName', e.target.value)}
              placeholder="LoopForge"
            />
          </div>
          <div>
            <label className="label-text" htmlFor="customDomain">
              Custom Domain (for deploy docs)
            </label>
            <input
              id="customDomain"
              className="input-field"
              value={branding.customDomain}
              onChange={(e) => update('customDomain', e.target.value)}
              placeholder="app.yourstartup.com"
            />
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-3 pt-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-600"
            checked={branding.hidePoweredBy}
            onChange={(e) => update('hidePoweredBy', e.target.checked)}
          />
          <span className="text-sm text-slate-300">Hide default footer branding (white-label)</span>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary text-sm" onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Branding'}
        </button>
        <button className="btn-secondary text-sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
