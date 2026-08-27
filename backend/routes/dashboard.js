import { Router } from 'express';
import db from '../db/db.js';

const router = Router();

// Facility-level dashboard summary, as described in the problem statement:
// doctors available, medicine availability %, pending referrals, diagnostic availability %,
// high-risk patients requiring follow-up.
router.get('/facility/:id', (req, res) => {
  const facilityId = req.params.id;
  const facility = db.prepare('SELECT * FROM facilities WHERE id = ?').get(facilityId);
  if (!facility) return res.status(404).json({ error: 'Facility not found' });

  const doctors = db.prepare(`SELECT COUNT(*) as n FROM staff WHERE facility_id = ? AND role IN ('doctor','specialist')`).get(facilityId).n;

  const meds = db.prepare('SELECT stock_status FROM medicines WHERE facility_id = ?').all(facilityId);
  const medAvailabilityPct = meds.length ? Math.round(100 * meds.filter(m => m.stock_status === 'available').length / meds.length) : null;

  const diagnostics = db.prepare('SELECT available FROM diagnostic_tests WHERE facility_id = ?').all(facilityId);
  const diagAvailabilityPct = diagnostics.length ? Math.round(100 * diagnostics.filter(d => d.available).length / diagnostics.length) : null;

  const pendingReferrals = db.prepare(`
    SELECT COUNT(*) as n FROM referrals
    WHERE (from_facility_id = ? OR to_facility_id = ?) AND status NOT IN ('closed','consultation_completed')
  `).get(facilityId, facilityId).n;

  const highRiskFollowups = db.prepare(`
    SELECT COUNT(*) as n FROM followups WHERE facility_id = ? AND status IN ('pending','reminded')
  `).get(facilityId).n;

  const overdueFollowups = db.prepare(`
    SELECT COUNT(*) as n FROM followups WHERE facility_id = ? AND status = 'missed'
  `).get(facilityId).n;

  res.json({
    facility,
    doctors_available: doctors,
    medicine_availability_pct: medAvailabilityPct,
    diagnostic_availability_pct: diagAvailabilityPct,
    pending_referrals: pendingReferrals,
    high_risk_followups_pending: highRiskFollowups,
    followups_overdue: overdueFollowups,
  });
});

// District-wide rollup across every facility, for administrators
router.get('/district-overview', (req, res) => {
  const facilities = db.prepare('SELECT * FROM facilities').all();
  const overview = facilities.map(f => {
    const meds = db.prepare('SELECT stock_status FROM medicines WHERE facility_id = ?').all(f.id);
    const diagnostics = db.prepare('SELECT available FROM diagnostic_tests WHERE facility_id = ?').all(f.id);
    const pendingReferrals = db.prepare(`SELECT COUNT(*) as n FROM referrals WHERE (from_facility_id = ? OR to_facility_id = ?) AND status NOT IN ('closed','consultation_completed')`).get(f.id, f.id).n;
    return {
      facility_id: f.id,
      name: f.name,
      type: f.type,
      medicine_availability_pct: meds.length ? Math.round(100 * meds.filter(m => m.stock_status === 'available').length / meds.length) : null,
      diagnostic_availability_pct: diagnostics.length ? Math.round(100 * diagnostics.filter(d => d.available).length / diagnostics.length) : null,
      pending_referrals: pendingReferrals,
    };
  });
  res.json(overview);
});

export default router;
