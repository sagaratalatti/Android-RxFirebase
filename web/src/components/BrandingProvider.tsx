import { createContext, useContext, useEffect, useState } from 'react';
import {
  getBranding,
  saveBranding as persistBranding,
  applyBrandingToDocument,
  defaultBranding,
} from '../lib/branding';
import type { BrandingConfig } from '../types';

interface BrandingContextValue {
  branding: BrandingConfig;
  updateBranding: (config: BrandingConfig) => void;
  resetBranding: () => void;
}

const BrandingContext = createContext<BrandingContextValue | null>(null);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(getBranding());

  useEffect(() => {
    applyBrandingToDocument(branding);
  }, [branding]);

  const updateBranding = (config: BrandingConfig) => {
    persistBranding(config);
    setBranding(config);
  };

  const resetBranding = () => {
    localStorage.removeItem('loopforge_branding');
    setBranding({ ...defaultBranding });
    applyBrandingToDocument(defaultBranding);
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextValue {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return ctx;
}
