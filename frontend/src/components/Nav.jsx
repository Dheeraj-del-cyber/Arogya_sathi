import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';

const ITEMS = [
  { to: '/', key: 'nav_triage', icon: '\u2695' },
  { to: '/teleconsult', key: 'nav_teleconsult', icon: '\u260E' },
  { to: '/referrals', key: 'nav_referrals', icon: '\u21C4' },
  { to: '/availability', key: 'nav_availability', icon: '\u2316' },
  { to: '/followups', key: 'nav_followups', icon: '\u23F0' },
  { to: '/dashboard', key: 'nav_dashboard', icon: '\u25A6' },
];

export default function Nav() {
  const { t } = useI18n();
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="30" height="30">
              <path d="M16 3 C 8 8, 5 14, 5 19 A 11 11 0 0 0 27 19 C 27 14, 24 8, 16 3 Z" className="brand-leaf" />
              <path d="M16 10 L16 22 M10 16 L22 16" className="brand-cross" />
            </svg>
          </span>
          <div>
            <div className="brand-name">{t('appName')}</div>
            <div className="brand-tagline">{t('tagline')}</div>
          </div>
        </div>
        <LanguageSwitch />
      </header>
      <nav className="sidenav">
        {ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `sidenav-link ${isActive ? 'active' : ''}`}>
            <span className="sidenav-icon" aria-hidden="true">{item.icon}</span>
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>
      <nav className="tabbar">
        {ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `tabbar-link ${isActive ? 'active' : ''}`}>
            <span className="tabbar-icon" aria-hidden="true">{item.icon}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
