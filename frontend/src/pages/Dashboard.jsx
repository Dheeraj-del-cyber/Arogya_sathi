import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';

function Stat({ label, value, tone }) {
  return (
    <div className={`stat-tile ${tone ? `tone-${tone}` : ''}`}>
      <div className="stat-value">{value == null ? '—' : value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function pctTone(pct) {
  if (pct == null) return '';
  if (pct >= 80) return 'good';
  if (pct >= 50) return 'warn';
  return 'bad';
}

export default function Dashboard() {
  const { facilities, facilityId } = useApp();
  const [target, setTarget] = useState(facilityId);
  const [summary, setSummary] = useState(null);
  const [overview, setOverview] = useState([]);

  useEffect(() => { setTarget(facilityId); }, [facilityId]);
  useEffect(() => { if (target) api.facilityDashboard(target).then(setSummary); }, [target]);
  useEffect(() => { api.districtOverview().then(setOverview); }, []);

  return (
    <div className="page">
      <section className="card">
        <span className="eyebrow">For facility administrators</span>
        <h1>See where the system is under strain</h1>
        <label className="field">
          <span>Facility</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </label>
      </section>

      {summary && (
        <section className="stat-grid">
          <Stat label="Doctors / specialists posted" value={summary.doctors_available} />
          <Stat label="Medicine availability" value={summary.medicine_availability_pct != null ? `${summary.medicine_availability_pct}%` : null} tone={pctTone(summary.medicine_availability_pct)} />
          <Stat label="Diagnostic availability" value={summary.diagnostic_availability_pct != null ? `${summary.diagnostic_availability_pct}%` : null} tone={pctTone(summary.diagnostic_availability_pct)} />
          <Stat label="Pending referrals" value={summary.pending_referrals} tone={summary.pending_referrals > 3 ? 'bad' : ''} />
          <Stat label="High-risk follow-ups pending" value={summary.high_risk_followups_pending} tone={summary.high_risk_followups_pending > 3 ? 'warn' : ''} />
          <Stat label="Follow-ups overdue" value={summary.followups_overdue} tone={summary.followups_overdue > 0 ? 'bad' : 'good'} />
        </section>
      )}

      <section className="card">
        <h3>District-wide overview</h3>
        <table className="mini-table">
          <thead>
            <tr><th>Facility</th><th>Medicines</th><th>Diagnostics</th><th>Pending referrals</th></tr>
          </thead>
          <tbody>
            {overview.map((f) => (
              <tr key={f.facility_id}>
                <td>{f.name} <span className="muted">({f.type.replace('_', ' ')})</span></td>
                <td><span className={`chip chip-pct-${pctTone(f.medicine_availability_pct)}`}>{f.medicine_availability_pct != null ? `${f.medicine_availability_pct}%` : '—'}</span></td>
                <td><span className={`chip chip-pct-${pctTone(f.diagnostic_availability_pct)}`}>{f.diagnostic_availability_pct != null ? `${f.diagnostic_availability_pct}%` : '—'}</span></td>
                <td>{f.pending_referrals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
