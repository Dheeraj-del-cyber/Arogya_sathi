import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { api } from '../api.js';
import UrgencyBadge from '../components/UrgencyBadge.jsx';
import JourneyPath from '../components/JourneyPath.jsx';

const SYMPTOM_OPTIONS = [
  { code: 'fever', label: 'Fever' },
  { code: 'persistent_cough', label: 'Persistent cough' },
  { code: 'chest_pain', label: 'Chest pain' },
  { code: 'severe_breathlessness', label: 'Severe breathlessness' },
  { code: 'mild_breathlessness', label: 'Mild breathlessness' },
  { code: 'vomiting', label: 'Vomiting' },
  { code: 'diarrhea', label: 'Diarrhea' },
  { code: 'headache', label: 'Headache' },
  { code: 'dizziness', label: 'Dizziness' },
  { code: 'body_ache', label: 'Body ache' },
  { code: 'joint_pain', label: 'Joint pain' },
  { code: 'skin_rash', label: 'Skin rash' },
  { code: 'severe_abdominal_pain_pregnancy', label: 'Severe abdominal pain (pregnancy)' },
  { code: 'heavy_bleeding', label: 'Heavy bleeding' },
  { code: 'unconsciousness', label: 'Unconsciousness' },
  { code: 'seizure', label: 'Seizure' },
  { code: 'stroke_signs', label: 'Sudden weakness / stroke signs' },
  { code: 'snake_bite', label: 'Snake bite' },
];

export default function Home() {
  const { patients, patientId, setPatientId, facilityId } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [vitals, setVitals] = useState({ temp: '', spo2: '', systolic: '', diastolic: '', pulse: '' });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const patient = patients.find((p) => p.id === patientId);

  const toggleSymptom = (code) => {
    setSelected((s) => (s.includes(code) ? s.filter((c) => c !== code) : [...s, code]));
  };

  const runTriage = async () => {
    if (!patientId) { setError('Select a patient first.'); return; }
    if (selected.length === 0) { setError('Select at least one symptom.'); return; }
    setError(''); setBusy(true); setResult(null);
    const numericVitals = {};
    for (const [k, v] of Object.entries(vitals)) if (v !== '') numericVitals[k] = Number(v);
    try {
      const r = await api.runTriage({ patient_id: patientId, facility_id: facilityId, symptoms: selected, vitals: numericVitals });
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const journeyStops = [
    { label: 'Village', sublabel: 'Health worker' },
    { label: 'Sub-centre / PHC', sublabel: 'Local care' },
    { label: 'CHC', sublabel: 'Teleconsult' },
    { label: 'District Hospital', sublabel: 'Specialist' },
  ];

  return (
    <div className="page">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Digital triage · decision support</span>
          <h1>Where does this patient need to go next?</h1>
          <p>Answer a few questions and Arogya Sathi suggests the right level of care — local rest and advice, a same-day teleconsultation, or immediate escalation. This is a support tool for the health worker; it never replaces a doctor's judgement.</p>
        </div>
        <JourneyPath stops={journeyStops} activeIndex={result ? (result.urgency === 'red' ? 3 : result.urgency === 'yellow' ? 2 : 1) : -1} />
      </section>

      <section className="card">
        <label className="field">
          <span>{t('select_patient')}</span>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.age ? `${p.age}y` : ''} {p.village ? `· ${p.village}` : ''}</option>
            ))}
          </select>
        </label>
        {patient?.risk_flags && JSON.parse(patient.risk_flags).length > 0 && (
          <div className="risk-chips">
            {JSON.parse(patient.risk_flags).map((f) => <span key={f} className="chip chip-risk">{f.replaceAll('_', ' ')}</span>)}
          </div>
        )}

        <div className="field">
          <span>{t('symptoms')}</span>
          <div className="symptom-grid">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                type="button"
                key={s.code}
                className={`symptom-pill ${selected.includes(s.code) ? 'selected' : ''} ${s.code.includes('chest') || s.code.includes('unconscious') || s.code.includes('seizure') || s.code.includes('stroke') || s.code.includes('heavy_bleeding') || s.code.includes('snake') || s.code.includes('severe') ? 'flag' : ''}`}
                onClick={() => toggleSymptom(s.code)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>{t('vitals')}</span>
          <div className="vitals-grid">
            <label>Temp (°F)<input inputMode="decimal" value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} placeholder="98.6" /></label>
            <label>SpO2 (%)<input inputMode="decimal" value={vitals.spo2} onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })} placeholder="98" /></label>
            <label>Systolic BP<input inputMode="decimal" value={vitals.systolic} onChange={(e) => setVitals({ ...vitals, systolic: e.target.value })} placeholder="120" /></label>
            <label>Diastolic BP<input inputMode="decimal" value={vitals.diastolic} onChange={(e) => setVitals({ ...vitals, diastolic: e.target.value })} placeholder="80" /></label>
            <label>Pulse (bpm)<input inputMode="decimal" value={vitals.pulse} onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })} placeholder="72" /></label>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
        <button className="btn-primary" onClick={runTriage} disabled={busy}>{busy ? 'Assessing…' : t('run_triage')}</button>
      </section>

      {result && (
        <section className={`card result-card urgency-border-${result.urgency}`}>
          <div className="result-head">
            <UrgencyBadge urgency={result.urgency} size="lg" />
            <span className="result-score">Score {result.score}</span>
          </div>
          <p className="result-action">{result.recommended_action}</p>
          <details>
            <summary>Why this result?</summary>
            <p className="result-reasoning">{result.reasoning}</p>
          </details>
          <div className="result-actions">
            {result.urgency !== 'green' && (
              <button className="btn-secondary" onClick={() => navigate('/teleconsult')}>Book teleconsultation</button>
            )}
            <button className="btn-secondary" onClick={() => navigate('/referrals')}>Create referral</button>
          </div>
        </section>
      )}
    </div>
  );
}
