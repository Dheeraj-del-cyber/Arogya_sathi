// Minimal multilingual dictionary. Keys are used across the app via t('key').
// Real deployments would load these from a translation-managed source; for the
// MVP they live inline so the language switch works fully offline.
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
];

export const STRINGS = {
  appName: { en: 'Arogya Sathi', hi: 'आरोग्य साथी', ta: 'ஆரோக்ய சாதி', kn: 'ಆರೋಗ್ಯ ಸಾಥಿ', ml: 'ആരോഗ്യ സാഥി' },
  tagline: {
    en: 'One thread through the public health journey',
    hi: 'सार्वजनिक स्वास्थ्य यात्रा को जोड़ने वाला एक सूत्र',
    ta: 'பொது சுகாதார பயணத்தை இணைக்கும் ஒரு நூல்',
    kn: 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಪ್ರಯಾಣವನ್ನು ಬೆಸೆಯುವ ಒಂದು ದಾರ',
    ml: 'പൊതുജനാരോഗ്യ യാത്രയെ ബന്ധിപ്പിക്കുന്ന ഒരു നൂൽ',
  },
  nav_triage: { en: 'Triage', hi: 'जांच', ta: 'முன் பரிசோதனை', kn: 'ಟ್ರಯಾಜ್', ml: 'ട്രയാജ്' },
  nav_teleconsult: { en: 'Teleconsultation', hi: 'टेली-परामर्श', ta: 'தொலைநல ஆலோசனை', kn: 'ಟೆಲಿಕನ್ಸಲ್ಟೇಶನ್', ml: 'ടെലികൺസൾട്ടേഷൻ' },
  nav_referrals: { en: 'Referrals', hi: 'रेफरल', ta: 'பரிந்துரைகள்', kn: 'ರೆಫರಲ್‌ಗಳು', ml: 'റഫറലുകൾ' },
  nav_availability: { en: 'Availability', hi: 'उपलब्धता', ta: 'கிடைக்கும் தன்மை', kn: 'ಲಭ್ಯತೆ', ml: 'ലഭ്യത' },
  nav_followups: { en: 'Follow-ups', hi: 'फॉलो-अप', ta: 'பின்தொடர்தல்', kn: 'ಅನುಸರಣೆ', ml: 'ഫോളോ അപ്പ്' },
  nav_dashboard: { en: 'Facility Dashboard', hi: 'सुविधा डैशबोर्ड', ta: 'வசதி டாஷ்போர்டு', kn: 'ಸೌಲಭ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', ml: 'ഫെസിലിറ്റി ഡാഷ്ബോർഡ്' },
  select_patient: { en: 'Select patient', hi: 'रोगी चुनें', ta: 'நோயாளியைத் தேர்ந்தெடுக்கவும்', kn: 'ರೋಗಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ', ml: 'രോഗിയെ തിരഞ്ഞെടുക്കുക' },
  symptoms: { en: 'Symptoms', hi: 'लक्षण', ta: 'அறிகுறிகள்', kn: 'ಲಕ್ಷಣಗಳು', ml: 'ലക്ഷണങ്ങൾ' },
  vitals: { en: 'Vitals (optional)', hi: 'महत्वपूर्ण संकेत (वैकल्पिक)', ta: 'உயிர்ச்சான்றுகள் (விருப்பம்)', kn: 'ಜೀವಲಕ್ಷಣಗಳು (ಐಚ್ಛಿಕ)', ml: 'വൈറ്റൽസ് (ഓപ്ഷണൽ)' },
  run_triage: { en: 'Run digital triage', hi: 'डिजिटल जांच चलाएँ', ta: 'டிஜிட்டல் முன் பரிசோதனையை இயக்கவும்', kn: 'ಡಿಜಿಟಲ್ ಟ್ರಯಾಜ್ ಚಲಾಯಿಸಿ', ml: 'ഡിജിറ്റൽ ട്രയാജ് പ്രവർത്തിപ്പിക്കുക' },
  low_connectivity: { en: 'Working offline — will sync when connected', hi: 'ऑफ़लाइन काम कर रहा है — जुड़ने पर सिंक होगा', ta: 'ஆஃப்லைனில் வேலை செய்கிறது — இணைக்கும்போது ஒத்திசைக்கும்', kn: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ', ml: 'ഓഫ്‌ലൈനിൽ പ്രവർത്തിക്കുന്നു' },
};

export function t(key, lang) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}
