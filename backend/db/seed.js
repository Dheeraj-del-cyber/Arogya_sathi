import db from './db.js';
import { nanoid } from 'nanoid';

const id = () => nanoid(10);

// wipe existing demo data (idempotent seeding)
const tables = ['referral_timeline','referrals','appointments','triage_records','health_records',
  'followups','medicines','diagnostic_tests','patients','staff','facilities'];
for (const t of tables) db.prepare(`DELETE FROM ${t}`).run();

const insertFacility = db.prepare(`INSERT INTO facilities (id,name,type,village,taluk,district,lat,lng,parent_facility_id,languages) VALUES (@id,@name,@type,@village,@taluk,@district,@lat,@lng,@parent_facility_id,@languages)`);

const district = { id: id(), name: 'Thiruvallur District Hospital', type: 'district_hospital', village: 'Thiruvallur', taluk: 'Thiruvallur', district: 'Thiruvallur', lat: 13.1425, lng: 79.9094, parent_facility_id: null, languages: 'en,ta,hi' };
insertFacility.run(district);

const chc = { id: id(), name: 'Poonamallee CHC', type: 'chc', village: 'Poonamallee', taluk: 'Poonamallee', district: 'Thiruvallur', lat: 13.0500, lng: 80.0950, parent_facility_id: district.id, languages: 'en,ta' };
insertFacility.run(chc);

const phc1 = { id: id(), name: 'Kadambathur PHC', type: 'phc', village: 'Kadambathur', taluk: 'Poonamallee', district: 'Thiruvallur', lat: 13.1900, lng: 79.9700, parent_facility_id: chc.id, languages: 'en,ta' };
insertFacility.run(phc1);

const phc2 = { id: id(), name: 'Thiruvalangadu PHC', type: 'phc', village: 'Thiruvalangadu', taluk: 'Poonamallee', district: 'Thiruvallur', lat: 13.1700, lng: 79.8800, parent_facility_id: chc.id, languages: 'en,ta' };
insertFacility.run(phc2);

const subCentre = { id: id(), name: 'Perumalpattu Sub-Centre', type: 'sub_centre', village: 'Perumalpattu', taluk: 'Poonamallee', district: 'Thiruvallur', lat: 13.1600, lng: 79.9600, parent_facility_id: phc1.id, languages: 'en,ta' };
insertFacility.run(subCentre);

const diag = { id: id(), name: 'Thiruvallur Diagnostic Centre', type: 'diagnostic_centre', village: 'Thiruvallur', taluk: 'Thiruvallur', district: 'Thiruvallur', lat: 13.1430, lng: 79.9100, parent_facility_id: district.id, languages: 'en,ta' };
insertFacility.run(diag);

const insertStaff = db.prepare(`INSERT INTO staff (id,name,role,specialty,facility_id,phone) VALUES (@id,@name,@role,@specialty,@facility_id,@phone)`);
const staffRows = [
  { id: id(), name: 'Meena R', role: 'health_worker', specialty: null, facility_id: subCentre.id, phone: '9000000001' },
  { id: id(), name: 'Dr. Aravind S', role: 'doctor', specialty: 'General Medicine', facility_id: phc1.id, phone: '9000000002' },
  { id: id(), name: 'Dr. Kavitha N', role: 'specialist', specialty: 'Cardiology', facility_id: district.id, phone: '9000000003' },
  { id: id(), name: 'Dr. Suresh Babu', role: 'specialist', specialty: 'Obstetrics & Gynaecology', facility_id: chc.id, phone: '9000000004' },
  { id: id(), name: 'Priya Admin', role: 'admin', specialty: null, facility_id: district.id, phone: '9000000005' },
];
for (const s of staffRows) insertStaff.run(s);

const insertPatient = db.prepare(`INSERT INTO patients (id,name,age,gender,phone,village,preferred_language,abha_id,home_facility_id,risk_flags) VALUES (@id,@name,@age,@gender,@phone,@village,@preferred_language,@abha_id,@home_facility_id,@risk_flags)`);
const ravi = { id: id(), name: 'Ravi Kumar', age: 46, gender: 'M', phone: '9800000001', village: 'Perumalpattu', preferred_language: 'ta', abha_id: null, home_facility_id: subCentre.id, risk_flags: '["hypertension"]' };
insertPatient.run(ravi);
const lakshmi = { id: id(), name: 'Lakshmi S', age: 28, gender: 'F', phone: '9800000002', village: 'Kadambathur', preferred_language: 'ta', abha_id: null, home_facility_id: phc1.id, risk_flags: '["pregnant"]' };
insertPatient.run(lakshmi);
const muthu = { id: id(), name: 'Muthu Selvam', age: 62, gender: 'M', phone: '9800000003', village: 'Thiruvalangadu', preferred_language: 'ta', abha_id: null, home_facility_id: phc2.id, risk_flags: '["diabetes","elderly"]' };
insertPatient.run(muthu);

const insertDiag = db.prepare(`INSERT INTO diagnostic_tests (id,facility_id,test_name,available,next_slot) VALUES (@id,@facility_id,@test_name,@available,@next_slot)`);
const diagRows = [
  { id: id(), facility_id: phc1.id, test_name: 'Blood Sugar (RBS)', available: 1, next_slot: 'Today, 4:00 PM' },
  { id: id(), facility_id: phc1.id, test_name: 'ECG', available: 0, next_slot: null },
  { id: id(), facility_id: diag.id, test_name: 'ECG', available: 1, next_slot: 'Today, 5:30 PM' },
  { id: id(), facility_id: diag.id, test_name: 'HbA1c', available: 1, next_slot: 'Tomorrow, 9:00 AM' },
  { id: id(), facility_id: chc.id, test_name: 'Ultrasound (Obstetric)', available: 1, next_slot: 'Tomorrow, 11:00 AM' },
  { id: id(), facility_id: district.id, test_name: 'X-Ray', available: 1, next_slot: 'Today, 3:00 PM' },
];
for (const d of diagRows) insertDiag.run(d);

const insertMed = db.prepare(`INSERT INTO medicines (id,facility_id,medicine_name,stock_status,quantity) VALUES (@id,@facility_id,@medicine_name,@stock_status,@quantity)`);
const medRows = [
  { id: id(), facility_id: phc1.id, medicine_name: 'Amlodipine 5mg', stock_status: 'available', quantity: 320 },
  { id: id(), facility_id: phc1.id, medicine_name: 'Metformin 500mg', stock_status: 'low', quantity: 40 },
  { id: id(), facility_id: phc2.id, medicine_name: 'Metformin 500mg', stock_status: 'available', quantity: 500 },
  { id: id(), facility_id: phc2.id, medicine_name: 'Iron Folic Acid tablets', stock_status: 'out_of_stock', quantity: 0 },
  { id: id(), facility_id: chc.id, medicine_name: 'Iron Folic Acid tablets', stock_status: 'available', quantity: 900 },
  { id: id(), facility_id: subCentre.id, medicine_name: 'ORS packets', stock_status: 'available', quantity: 150 },
];
for (const m of medRows) insertMed.run(m);

const insertFollowup = db.prepare(`INSERT INTO followups (id,patient_id,condition_type,due_date,status,notes,facility_id) VALUES (@id,@patient_id,@condition_type,@due_date,@status,@notes,@facility_id)`);
const today = new Date();
const inDays = (n) => new Date(today.getTime() + n*86400000).toISOString().slice(0,10);
insertFollowup.run({ id: id(), patient_id: ravi.id, condition_type: 'hypertension', due_date: inDays(2), status: 'pending', notes: 'BP recheck', facility_id: subCentre.id });
insertFollowup.run({ id: id(), patient_id: lakshmi.id, condition_type: 'pregnancy', due_date: inDays(5), status: 'pending', notes: 'Antenatal checkup - 2nd trimester', facility_id: phc1.id });
insertFollowup.run({ id: id(), patient_id: muthu.id, condition_type: 'diabetes', due_date: inDays(-1), status: 'missed', notes: 'HbA1c review overdue', facility_id: phc2.id });

console.log('Seed complete:');
console.log({ district: district.id, chc: chc.id, phc1: phc1.id, phc2: phc2.id, subCentre: subCentre.id, diag: diag.id });
console.log({ ravi: ravi.id, lakshmi: lakshmi.id, muthu: muthu.id });
