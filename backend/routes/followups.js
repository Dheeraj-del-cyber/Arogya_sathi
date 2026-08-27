import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/db.js';

const router = Router();

router.get('/', (req, res) => {
  const { status, facility_id, dueWithinDays } = req.query;
  let q = `SELECT f.*, p.name as patient_name, p.phone as patient_phone, p.preferred_language
           FROM followups f JOIN patients p ON p.id = f.patient_id WHERE 1=1`;
  const params = [];
  if (status) { q += ' AND f.status = ?'; params.push(status); }
  if (facility_id) { q += ' AND f.facility_id = ?'; params.push(facility_id); }
  if (dueWithinDays) {
    q += " AND date(f.due_date) <= date('now', ? )";
    params.push(`+${parseInt(dueWithinDays, 10)} days`);
  }
  q += ' ORDER BY f.due_date';
  res.json(db.prepare(q).all(...params));
});

router.post('/', (req, res) => {
  const { patient_id, condition_type, due_date, notes, facility_id } = req.body;
  if (!patient_id || !due_date) return res.status(400).json({ error: 'patient_id and due_date are required' });
  const id = nanoid(10);
  db.prepare(`INSERT INTO followups (id,patient_id,condition_type,due_date,notes,facility_id)
              VALUES (@id,@patient_id,@condition_type,@due_date,@notes,@facility_id)`)
    .run({ id, patient_id, condition_type: condition_type ?? null, due_date, notes: notes ?? null, facility_id: facility_id ?? null });
  res.status(201).json(db.prepare('SELECT * FROM followups WHERE id = ?').get(id));
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'reminded', 'completed', 'missed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });
  db.prepare('UPDATE followups SET status = ? WHERE id = ?').run(status, req.params.id);
  const row = db.prepare('SELECT * FROM followups WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Followup not found' });
  res.json(row);
});

export default router;
