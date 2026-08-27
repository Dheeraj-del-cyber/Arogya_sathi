import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/db.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

router.post('/', (req, res) => {
  const { name, age, gender, phone, village, preferred_language, home_facility_id, risk_flags } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const id = nanoid(10);
  db.prepare(`INSERT INTO patients (id,name,age,gender,phone,village,preferred_language,home_facility_id,risk_flags)
              VALUES (@id,@name,@age,@gender,@phone,@village,@preferred_language,@home_facility_id,@risk_flags)`)
    .run({ id, name, age: age ?? null, gender: gender ?? null, phone: phone ?? null, village: village ?? null,
           preferred_language: preferred_language || 'en', home_facility_id: home_facility_id ?? null,
           risk_flags: JSON.stringify(risk_flags || []) });
  res.status(201).json(db.prepare('SELECT * FROM patients WHERE id = ?').get(id));
});

// Full longitudinal journey for a patient: records, triage history, referrals, appointments, followups
router.get('/:id/journey', (req, res) => {
  const patientId = req.params.id;
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const health_records = db.prepare('SELECT * FROM health_records WHERE patient_id = ? ORDER BY visit_date').all(patientId);
  const triage_records = db.prepare('SELECT * FROM triage_records WHERE patient_id = ? ORDER BY created_at').all(patientId);
  const referrals = db.prepare('SELECT * FROM referrals WHERE patient_id = ? ORDER BY created_at').all(patientId);
  const appointments = db.prepare('SELECT * FROM appointments WHERE patient_id = ? ORDER BY slot_time').all(patientId);
  const followups = db.prepare('SELECT * FROM followups WHERE patient_id = ? ORDER BY due_date').all(patientId);

  res.json({ patient, health_records, triage_records, referrals, appointments, followups });
});

export default router;
