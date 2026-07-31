import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { BrandingProvider } from './components/BrandingProvider';
import { AuthProvider } from './contexts/AuthContext';
import AutoSyncEffect from './components/AutoSyncEffect';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BrandingProvider>
          <AutoSyncEffect />
          <App />
        </BrandingProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
