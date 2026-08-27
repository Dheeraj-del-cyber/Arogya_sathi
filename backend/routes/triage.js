import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/db.js';
import { runTriage } from '../services/triageEngine.js';

const router = Router();

router.post('/', (req, res) => {
  const { patient_id, facility_id, symptoms, vitals } = req.body;
  if (!patient_id || !Array.isArray(symptoms)) {
    return res.status(400).json({ error: 'patient_id and symptoms[] are required' });
  }
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient_id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const riskFlags = JSON.parse(patient.risk_flags || '[]');
  const result = runTriage({ symptoms, vitals: vitals || {}, riskFlags });

  const id = nanoid(10);
  db.prepare(`INSERT INTO triage_records (id,patient_id,facility_id,symptoms,vitals,urgency,score,reasoning,recommended_action)
              VALUES (@id,@patient_id,@facility_id,@symptoms,@vitals,@urgency,@score,@reasoning,@recommended_action)`)
    .run({ id, patient_id, facility_id: facility_id ?? null, symptoms: JSON.stringify(symptoms),
           vitals: JSON.stringify(vitals || {}), ...result });

  res.status(201).json({ id, patient_id, ...result });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM triage_records WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Triage record not found' });
  res.json(row);
});

export default router;
