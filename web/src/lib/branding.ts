import type { BrandingConfig } from '../types';

const STORAGE_KEY = 'loopforge_branding';

export const defaultBranding: BrandingConfig = {
  appName: 'LoopForge',
  tagline: 'Customised loop-prompt AI for startups',
  accentColor: '#6366f1',
  logoUrl: '',
};

export function getBranding(): BrandingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultBranding };
    return { ...defaultBranding, ...(JSON.parse(raw) as Partial<BrandingConfig>) };
  } catch {
    return { ...defaultBranding };
  }
}

export function saveBranding(branding: BrandingConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
  applyBrandingToDocument(branding);
}

export function applyBrandingToDocument(branding: BrandingConfig = getBranding()): void {
  const root = document.documentElement;
  root.style.setProperty('--brand-accent', branding.accentColor);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', branding.accentColor);
  }

  document.title = branding.appName.includes('—')
    ? branding.appName
    : `${branding.appName} — AI for Startups`;
}
