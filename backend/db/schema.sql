-- Arogya Sathi core schema
-- Design notes:
--  * facility hierarchy models the real referral chain: sub_centre -> phc -> chc -> district_hospital
--  * every table that a health worker fills offline carries a `synced` flag so the
--    frontend can queue writes locally and push them when connectivity returns
--  * referrals and followups are event-sourced via a timeline table so nothing about
--    "what happened to the patient" is ever silently lost

CREATE TABLE IF NOT EXISTS facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sub_centre','phc','chc','district_hospital','diagnostic_centre')),
  village TEXT,
  taluk TEXT,
  district TEXT NOT NULL,
  lat REAL,
  lng REAL,
  parent_facility_id TEXT REFERENCES facilities(id),
  languages TEXT DEFAULT 'en,hi,ta,kn,ml'
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('health_worker','doctor','specialist','admin')),
  specialty TEXT,
  facility_id TEXT REFERENCES facilities(id),
  phone TEXT
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  village TEXT,
  preferred_language TEXT DEFAULT 'en',
  abha_id TEXT,                       -- Ayushman Bharat Health Account id, if the patient has one (optional link, not required)
  home_facility_id TEXT REFERENCES facilities(id),
  risk_flags TEXT DEFAULT '[]',       -- json array e.g. ["pregnant","diabetes","hypertension","elderly"]
  created_at TEXT DEFAULT (datetime('now'))
);

-- Longitudinal health record: one row per visit/event, so a patient's journey
-- can be reconstructed regardless of which facility saw them.
CREATE TABLE IF NOT EXISTS health_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  facility_id TEXT REFERENCES facilities(id),
  visit_date TEXT DEFAULT (datetime('now')),
  record_type TEXT CHECK (record_type IN ('triage','consultation','diagnostic','prescription','referral_note','followup')),
  diagnosis TEXT,
  notes TEXT,
  prescription TEXT,
  synced INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS triage_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  facility_id TEXT REFERENCES facilities(id),
  symptoms TEXT NOT NULL,             -- json array of symptom codes
  vitals TEXT,                        -- json: {temp, systolic, diastolic, spo2, pulse}
  urgency TEXT CHECK (urgency IN ('green','yellow','red')),
  score INTEGER,
  reasoning TEXT,                     -- human-readable explanation of which rules fired
  recommended_action TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  synced INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  facility_id TEXT NOT NULL REFERENCES facilities(id),
  staff_id TEXT REFERENCES staff(id),
  mode TEXT CHECK (mode IN ('teleconsultation','in_person')) DEFAULT 'teleconsultation',
  slot_time TEXT NOT NULL,
  status TEXT CHECK (status IN ('booked','completed','missed','cancelled')) DEFAULT 'booked',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  from_facility_id TEXT NOT NULL REFERENCES facilities(id),
  to_facility_id TEXT NOT NULL REFERENCES facilities(id),
  reason TEXT,
  urgency TEXT CHECK (urgency IN ('green','yellow','red')) DEFAULT 'yellow',
  status TEXT CHECK (status IN ('created','patient_informed','appointment_booked','patient_reached','consultation_completed','followup_required','closed')) DEFAULT 'created',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS referral_timeline (
  id TEXT PRIMARY KEY,
  referral_id TEXT NOT NULL REFERENCES referrals(id),
  status TEXT NOT NULL,
  note TEXT,
  actor TEXT,                          -- who recorded this step
  at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS diagnostic_tests (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL REFERENCES facilities(id),
  test_name TEXT NOT NULL,
  available INTEGER DEFAULT 1,
  next_slot TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL REFERENCES facilities(id),
  medicine_name TEXT NOT NULL,
  stock_status TEXT CHECK (stock_status IN ('available','low','out_of_stock')) DEFAULT 'available',
  quantity INTEGER,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS followups (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  condition_type TEXT,                 -- e.g. pregnancy, diabetes, hypertension, child_immunisation
  due_date TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','reminded','completed','missed')) DEFAULT 'pending',
  notes TEXT,
  facility_id TEXT REFERENCES facilities(id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(due_date);
CREATE INDEX IF NOT EXISTS idx_appointments_facility ON appointments(facility_id, slot_time);
