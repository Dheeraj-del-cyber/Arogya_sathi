import { Router } from 'express';
import db from '../db/db.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM facilities ORDER BY type, name').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM facilities WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Facility not found' });
  res.json(row);
});

// Diagnostic + medicine availability for a facility, plus its children (referral network)
router.get('/:id/availability', (req, res) => {
  const diagnostics = db.prepare('SELECT * FROM diagnostic_tests WHERE facility_id = ?').all(req.params.id);
  const medicines = db.prepare('SELECT * FROM medicines WHERE facility_id = ?').all(req.params.id);
  res.json({ diagnostics, medicines });
});

// Search across all facilities for a given test/medicine (used to redirect the patient
// to the nearest facility that actually has what they need)
router.get('/search/availability', (req, res) => {
  const { test, medicine } = req.query;
  let rows = [];
  if (test) {
    rows = db.prepare(`
      SELECT f.id as facility_id, f.name as facility_name, f.type, d.test_name, d.available, d.next_slot
      FROM diagnostic_tests d JOIN facilities f ON f.id = d.facility_id
      WHERE d.test_name LIKE ?
      ORDER BY d.available DESC
    `).all(`%${test}%`);
  } else if (medicine) {
    rows = db.prepare(`
      SELECT f.id as facility_id, f.name as facility_name, f.type, m.medicine_name, m.stock_status, m.quantity
      FROM medicines m JOIN facilities f ON f.id = m.facility_id
      WHERE m.medicine_name LIKE ?
      ORDER BY (m.stock_status = 'available') DESC
    `).all(`%${medicine}%`);
  }
  res.json(rows);
});

export default router;
