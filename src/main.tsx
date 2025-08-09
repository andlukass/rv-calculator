import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import '@/i18n';
import i18n from 'i18next';
import 'flag-icons/css/flag-icons.min.css';

function AppWithLocale({ lang }: { lang: 'pt' | 'en' }) {
  const effectiveLang = lang === 'en' ? 'en' : 'pt';
  if (i18n.language !== effectiveLang) {
    i18n.changeLanguage(effectiveLang);
  }
  return <App />;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

const app = (
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/pt" replace />} />
        <Route path="/pt" element={<AppWithLocale lang="pt" />} />
        <Route path="/en" element={<AppWithLocale lang="en" />} />
        {/* Fallback unknown locales to pt */}
        <Route path="*" element={<Navigate to="/pt" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
