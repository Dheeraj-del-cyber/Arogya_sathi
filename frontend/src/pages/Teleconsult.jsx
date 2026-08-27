import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';

function fmtSlot(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Teleconsult() {
  const { facilities, patientId, facilityId } = useApp();
  const [targetFacility, setTargetFacility] = useState(facilityId);
  const [staff, setStaff] = useState([]);
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTargetFacility(facilityId); }, [facilityId]);

  useEffect(() => {
    if (!targetFacility) return;
    setLoading(true);
    api.appointmentAvailability(targetFacility).then(setStaff).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [targetFacility]);

  const book = async (staffMember, slot) => {
    setError(''); setBooked(null);
    try {
      const appt = await api.bookAppointment({
        patient_id: patientId, facility_id: targetFacility, staff_id: staffMember.id, mode: 'teleconsultation', slot_time: slot,
      });
      setBooked({ appt, staffMember });
      const refreshed = await api.appointmentAvailability(targetFacility);
      setStaff(refreshed);
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="page">
      <section className="card">
        <span className="eyebrow">Assisted teleconsultation</span>
        <h1>Connect this patient to a doctor without the journey</h1>
        <p>Choose a facility with an available specialist, and book the next open slot. The local health worker can sit with the patient during the call.</p>
        <label className="field">
          <span>Facility</span>
          <select value={targetFacility} onChange={(e) => setTargetFacility(e.target.value)}>
            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name} · {f.type.replace('_', ' ')}</option>)}
          </select>
        </label>
      </section>

      {error && <p className="error-text">{error}</p>}
      {booked && (
        <section className="card banner-success">
          Booked with <strong>{booked.staffMember.name}</strong> ({booked.staffMember.specialty || booked.staffMember.role}) at {fmtSlot(booked.appt.slot_time)}.
        </section>
      )}

      {loading && <p className="muted">Loading specialists…</p>}

      <div className="specialist-list">
        {staff.map((s) => (
          <section className="card specialist-card" key={s.id}>
            <div className="specialist-head">
              <div>
                <h3>{s.name}</h3>
                <p className="muted">{s.specialty || s.role.replace('_', ' ')}</p>
              </div>
            </div>
            {s.next_slots.length === 0 ? (
              <p className="muted">No open slots right now.</p>
            ) : (
              <div className="slot-row">
                {s.next_slots.map((slot) => (
                  <button key={slot} className="slot-chip" onClick={() => book(s, slot)} disabled={!patientId}>
                    {fmtSlot(slot)}
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}
        {!loading && staff.length === 0 && <p className="muted">No doctors or specialists are posted at this facility. Try a CHC or district hospital.</p>}
      </div>
    </div>
  );
}
