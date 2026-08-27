import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/db.js';

const router = Router();

function addTimelineEntry(referralId, status, note, actor) {
  db.prepare(`INSERT INTO referral_timeline (id, referral_id, status, note, actor) VALUES (?,?,?,?,?)`)
    .run(nanoid(10), referralId, status, note ?? null, actor ?? 'system');
}

router.get('/', (req, res) => {
  const { status, facility_id } = req.query;
  let q = 'SELECT * FROM referrals WHERE 1=1';
  const params = [];
  if (status) { q += ' AND status = ?'; params.push(status); }
  if (facility_id) { q += ' AND (from_facility_id = ? OR to_facility_id = ?)'; params.push(facility_id, facility_id); }
  q += ' ORDER BY created_at DESC';
  res.json(db.prepare(q).all(...params));
});

router.post('/', (req, res) => {
  const { patient_id, from_facility_id, to_facility_id, reason, urgency } = req.body;
  if (!patient_id || !from_facility_id || !to_facility_id) {
    return res.status(400).json({ error: 'patient_id, from_facility_id and to_facility_id are required' });
  }
  const id = nanoid(10);
  db.prepare(`INSERT INTO referrals (id,patient_id,from_facility_id,to_facility_id,reason,urgency)
              VALUES (@id,@patient_id,@from_facility_id,@to_facility_id,@reason,@urgency)`)
    .run({ id, patient_id, from_facility_id, to_facility_id, reason: reason ?? null, urgency: urgency || 'yellow' });
  addTimelineEntry(id, 'created', reason, 'health_worker');
  res.status(201).json(db.prepare('SELECT * FROM referrals WHERE id = ?').get(id));
});

router.get('/:id', (req, res) => {
  const referral = db.prepare('SELECT * FROM referrals WHERE id = ?').get(req.params.id);
  if (!referral) return res.status(404).json({ error: 'Referral not found' });
  const timeline = db.prepare('SELECT * FROM referral_timeline WHERE referral_id = ? ORDER BY at').all(req.params.id);
  res.json({ ...referral, timeline });
});

const STATUS_FLOW = ['created', 'patient_informed', 'appointment_booked', 'patient_reached', 'consultation_completed', 'followup_required', 'closed'];

router.patch('/:id/status', (req, res) => {
  const { status, note, actor } = req.body;
  if (!STATUS_FLOW.includes(status)) return res.status(400).json({ error: `status must be one of ${STATUS_FLOW.join(', ')}` });
  const referral = db.prepare('SELECT * FROM referrals WHERE id = ?').get(req.params.id);
  if (!referral) return res.status(404).json({ error: 'Referral not found' });

  db.prepare('UPDATE referrals SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, req.params.id);
  addTimelineEntry(req.params.id, status, note, actor);
  const updated = db.prepare('SELECT * FROM referrals WHERE id = ?').get(req.params.id);
  const timeline = db.prepare('SELECT * FROM referral_timeline WHERE referral_id = ? ORDER BY at').all(req.params.id);
  res.json({ ...updated, timeline });
});

export default router;
