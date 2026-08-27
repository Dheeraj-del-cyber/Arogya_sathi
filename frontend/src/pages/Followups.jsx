import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const STATUS_ORDER = ['pending', 'reminded', 'completed', 'missed'];

export default function Followups() {
  const [list, setList] = useState([]);
  const [days, setDays] = useState(14);

  const load = () => api.followups({ dueWithinDays: days }).then(setList);
  useEffect(() => { load(); }, [days]);

  const setStatus = async (id, status) => {
    await api.updateFollowupStatus(id, status);
    load();
  };

  const overdue = list.filter((f) => f.status === 'missed' || (new Date(f.due_date) < new Date() && f.status !== 'completed'));
  const upcoming = list.filter((f) => !overdue.includes(f));

  return (
    <div className="page">
      <section className="card">
        <span className="eyebrow">High-risk patient follow-up</span>
        <h1>Don't let patients disappear after the first visit</h1>
        <p>Pregnant women, children, and patients with chronic conditions like diabetes or hypertension need scheduled follow-up — this keeps that list visible instead of buried in a register.</p>
        <label className="field">
          <span>Show follow-ups due within</span>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </label>
      </section>

      {overdue.length > 0 && (
        <section>
          <h2 className="section-heading overdue">Overdue ({overdue.length})</h2>
          <FollowupTable rows={overdue} onStatus={setStatus} />
        </section>
      )}
      <section>
        <h2 className="section-heading">Upcoming</h2>
        <FollowupTable rows={upcoming} onStatus={setStatus} />
      </section>
    </div>
  );
}

function FollowupTable({ rows, onStatus }) {
  if (rows.length === 0) return <p className="muted">Nothing here.</p>;
  return (
    <div className="followup-list">
      {rows.map((f) => (
        <article key={f.id} className="card followup-card">
          <div>
            <h3>{f.patient_name}</h3>
            <p className="muted">{f.condition_type?.replace('_', ' ')} · due {f.due_date} · {f.patient_phone}</p>
            {f.notes && <p className="muted">{f.notes}</p>}
          </div>
          <select value={f.status} onChange={(e) => onStatus(f.id, e.target.value)} className={`status-select status-${f.status}`}>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </article>
      ))}
    </div>
  );
}
