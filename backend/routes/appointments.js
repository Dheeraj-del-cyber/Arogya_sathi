import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/db.js';

const router = Router();

// List specialists/doctors available at a facility, with next few open slots (mocked schedule)
router.get('/availability/:facilityId', (req, res) => {
  const staff = db.prepare(`SELECT * FROM staff WHERE facility_id = ? AND role IN ('doctor','specialist')`).all(req.params.facilityId);
  const now = new Date();
  const slotsFor = (staffId) => {
    const booked = new Set(
      db.prepare(`SELECT slot_time FROM appointments WHERE staff_id = ? AND status = 'booked'`).all(staffId).map(r => r.slot_time)
    );
    const slots = [];
    for (let i = 1; i <= 6 && slots.length < 3; i++) {
      const t = new Date(now.getTime() + i * 30 * 60000);
      const iso = t.toISOString();
      if (!booked.has(iso)) slots.push(iso);
    }
    return slots;
  };
  res.json(staff.map(s => ({ ...s, next_slots: slotsFor(s.id) })));
});

router.post('/', (req, res) => {
  const { patient_id, facility_id, staff_id, mode, slot_time } = req.body;
  if (!patient_id || !facility_id || !slot_time) {
    return res.status(400).json({ error: 'patient_id, facility_id and slot_time are required' });
  }
  const conflict = staff_id && db.prepare(`SELECT 1 FROM appointments WHERE staff_id = ? AND slot_time = ? AND status = 'booked'`).get(staff_id, slot_time);
  if (conflict) return res.status(409).json({ error: 'That slot was just taken. Please pick another.' });

  const id = nanoid(10);
  db.prepare(`INSERT INTO appointments (id,patient_id,facility_id,staff_id,mode,slot_time)
              VALUES (@id,@patient_id,@facility_id,@staff_id,@mode,@slot_time)`)
    .run({ id, patient_id, facility_id, staff_id: staff_id ?? null, mode: mode || 'teleconsultation', slot_time });
  res.status(201).json(db.prepare('SELECT * FROM appointments WHERE id = ?').get(id));
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['booked', 'completed', 'missed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Appointment not found' });
  res.json(row);
});

router.get('/patient/:patientId', (req, res) => {
  res.json(db.prepare('SELECT * FROM appointments WHERE patient_id = ? ORDER BY slot_time').all(req.params.patientId));
});

export default router;
