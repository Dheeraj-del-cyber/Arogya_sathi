import React from 'react';
import { LANGUAGES } from '../i18n/strings.js';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function LanguageSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <select className="lang-switch" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Choose language">
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
