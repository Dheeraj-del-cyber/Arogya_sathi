import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';
import UrgencyBadge from '../components/UrgencyBadge.jsx';

const STATUS_FLOW = ['created', 'patient_informed', 'appointment_booked', 'patient_reached', 'consultation_completed', 'followup_required', 'closed'];
const STATUS_LABEL = {
  created: 'Referral created', patient_informed: 'Patient informed', appointment_booked: 'Appointment booked',
  patient_reached: 'Patient reached facility', consultation_completed: 'Consultation completed',
  followup_required: 'Follow-up required', closed: 'Closed',
};

function facilityName(facilities, id) {
  return facilities.find((f) => f.id === id)?.name || id;
}

export default function Referrals() {
  const { facilities, patients, patientId, facilityId } = useApp();
  const [list, setList] = useState([]);
  const [toFacility, setToFacility] = useState('');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('yellow');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = () => api.referrals().then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!patientId || !facilityId || !toFacility) { setError('Select patient, from-facility and to-facility.'); return; }
    setError('');
    try {
      await api.createReferral({ patient_id: patientId, from_facility_id: facilityId, to_facility_id: toFacility, reason, urgency });
      setReason('');
      load();
    } catch (e) { setError(e.message); }
  };

  const advance = async (referral) => {
    const idx = STATUS_FLOW.indexOf(referral.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    await api.updateReferralStatus(referral.id, { status: next, note: `Marked ${STATUS_LABEL[next]}`, actor: 'health_worker' });
    load();
  };

  return (
    <div className="page">
      <section className="card">
        <span className="eyebrow">Referral tracking</span>
        <h1>A referral shouldn't disappear after it's created</h1>
        <p>Track every step from creation to the patient actually receiving care — and flag if a follow-up is still needed.</p>

        <label className="field">
          <span>Refer to facility</span>
          <select value={toFacility} onChange={(e) => setToFacility(e.target.value)}>
            <option value="">Select facility…</option>
            {facilities.filter((f) => f.id !== facilityId).map((f) => (
              <option key={f.id} value={f.id}>{f.name} · {f.type.replace('_', ' ')}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Reason</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Needs ECG and cardiology opinion" />
        </label>
        <label className="field">
          <span>Urgency</span>
          <div className="urgency-picker">
            {['green', 'yellow', 'red'].map((u) => (
              <button key={u} type="button" className={`urgency-option urgency-${u} ${urgency === u ? 'selected' : ''}`} onClick={() => setUrgency(u)}>
                <UrgencyBadge urgency={u} />
              </button>
            ))}
          </div>
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="btn-primary" onClick={create}>Create referral</button>
      </section>

      <section className="referral-list">
        {list.map((r) => {
          const patient = patients.find((p) => p.id === r.patient_id);
          const stageIndex = STATUS_FLOW.indexOf(r.status);
          return (
            <article className={`card referral-card urgency-border-${r.urgency}`} key={r.id}>
              <div className="referral-head">
                <div>
                  <h3>{patient?.name || r.patient_id}</h3>
                  <p className="muted">{facilityName(facilities, r.from_facility_id)} → {facilityName(facilities, r.to_facility_id)}</p>
                </div>
                <UrgencyBadge urgency={r.urgency} />
              </div>
              {r.reason && <p className="referral-reason">"{r.reason}"</p>}

              <div className="status-track">
                {STATUS_FLOW.map((s, i) => (
                  <div key={s} className={`status-step ${i <= stageIndex ? 'done' : ''} ${i === stageIndex ? 'current' : ''}`}>
                    <span className="status-dot" />
                    <span className="status-label">{STATUS_LABEL[s]}</span>
                  </div>
                ))}
              </div>

              <div className="referral-actions">
                {stageIndex < STATUS_FLOW.length - 1 && (
                  <button className="btn-secondary" onClick={() => advance(r)}>Mark: {STATUS_LABEL[STATUS_FLOW[stageIndex + 1]]}</button>
                )}
                <button className="btn-link" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                  {expanded === r.id ? 'Hide timeline' : 'View timeline'}
                </button>
              </div>

              {expanded === r.id && (
                <ReferralTimeline id={r.id} />
              )}
            </article>
          );
        })}
        {list.length === 0 && <p className="muted">No referrals yet.</p>}
      </section>
    </div>
  );
}

function ReferralTimeline({ id }) {
  const [detail, setDetail] = useState(null);
  useEffect(() => { api.referral(id).then(setDetail); }, [id]);
  if (!detail) return <p className="muted">Loading…</p>;
  return (
    <ul className="timeline">
      {detail.timeline.map((ev) => (
        <li key={ev.id}>
          <strong>{STATUS_LABEL[ev.status] || ev.status}</strong>
          <span className="muted"> · {new Date(ev.at).toLocaleString()} · {ev.actor}</span>
          {ev.note && <div className="muted">{ev.note}</div>}
        </li>
      ))}
    </ul>
  );
}
