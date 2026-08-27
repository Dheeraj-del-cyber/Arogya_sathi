import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Home from './pages/Home.jsx';
import Teleconsult from './pages/Teleconsult.jsx';
import Referrals from './pages/Referrals.jsx';
import Availability from './pages/Availability.jsx';
import Followups from './pages/Followups.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useApp } from './AppContext.jsx';
import { useI18n } from './i18n/I18nContext.jsx';

export default function App() {
  const { loading, online } = useApp();
  const { t } = useI18n();

  return (
    <div className="app-shell">
      <Nav />
      <main className="content">
        {!online && <div className="offline-banner">{t('low_connectivity')}</div>}
        {loading ? (
          <div className="page"><p className="muted">Loading Arogya Sathi…</p></div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teleconsult" element={<Teleconsult />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/followups" element={<Followups />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        )}
      </main>
    </div>
  );
}
