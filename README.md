#Arogya Sathi (आरोग्य साथी)

**A digital coordination layer that strengthens — not replaces — the public rural
healthcare system.**

Arogya Sathi connects patients, frontline health workers, sub-centres, PHCs, CHCs,
diagnostic centres, specialists and district hospitals so that a rural patient gets
the right care, at the right facility, at the right time — with their journey
tracked end-to-end instead of disappearing between referrals.

Built as a focused hackathon MVP around the core loop from the problem statement:
**digital triage → assisted teleconsultation → referral tracking → high-risk
follow-up → facility/medicine/diagnostic availability → facility dashboard.**

---

## Tech stack

| Layer      | Choice                                   | Why |
|------------|-------------------------------------------|-----|
| Frontend   | React 18 + Vite + React Router            | Fast dev loop, small bundle for low-bandwidth rural networks, easy to later wrap as a PWA/APK |
| Backend    | Node.js + Express                         | Simple REST API, easy to extend with SMS/IVR gateways later |
| Database   | SQLite (via `better-sqlite3`)             | Zero-ops, file-based — mirrors how a facility-level or edge deployment would work in low-connectivity settings; swap for Postgres/MySQL in a multi-district production deployment without changing the API layer |
| AI / decision support | Rule-based digital triage engine (`backend/services/triageEngine.js`) | Transparent, explainable red-flag scoring — a health worker can see exactly which rule fired. Deliberately not a black-box model, since this assists a health worker's judgement rather than diagnosing. The function signature is designed as a drop-in swap point for a hosted clinical-decision-support model later |
| i18n       | Lightweight in-app dictionary (English, Hindi, Tamil, Kannada, Malayalam) | Works fully offline, no translation-service dependency |

## Project structure

```
arogya-sathi/
├── backend/
│   ├── db/
│   │   ├── schema.sql        # full relational schema + comments
│   │   ├── db.js             # sqlite connection
│   │   └── seed.js           # demo data: a real Tamil Nadu-style facility hierarchy
│   ├── routes/                # facilities, patients, triage, appointments, referrals, followups, dashboard
│   ├── services/
│   │   └── triageEngine.js    # rule-based digital triage / decision support
│   └── server.js
└── frontend/
    └── src/
        ├── pages/              # Triage, Teleconsult, Referrals, Availability, Follow-ups, Dashboard
        ├── components/         # Nav, JourneyPath (signature visual), UrgencyBadge, LanguageSwitch
        ├── i18n/                # multilingual dictionary + context
        └── AppContext.jsx       # shared facility/patient selection + online/offline state
```

## Core features implemented

- **Digital triage** — symptom + vitals form → green/yellow/red urgency with a
  plain-language explanation of every rule that fired, and a recommended action.
  High-risk patients (pregnant, elderly, diabetic, hypertensive) get a lower
  escalation threshold automatically.
- **Assisted teleconsultation** — pick a facility, see which doctors/specialists
  are posted there and their next open slots, book in two clicks.
- **Referral tracking** — every referral moves through
  `created → patient informed → appointment booked → patient reached →
  consultation completed → follow-up required → closed`, with a full
  timestamped timeline, not just a status field.
- **Diagnostic & medicine visibility** — see what's available at a facility
  before travelling, and search across every facility for a specific test or
  medicine.
- **High-risk follow-up tracking** — a dedicated worklist of upcoming and
  overdue follow-ups (antenatal,chronic disease, etc.) so patients aren't lost
  after their first visit.
- **Facility dashboard** — doctors posted, medicine availability %, diagnostic
  availability %, pending referrals, and overdue follow-ups per facility, plus
  a district-wide rollup for administrators.
- **Multilingual UI** — English, Hindi, Tamil, Kannada, Malayalam.
- **Low-connectivity awareness** — an offline banner when the browser loses
  connectivity, and every write-heavy table in the schema carries a `synced`
  flag so a future offline-first sync queue can be added without a schema
  change.

## What's a stub / what you'd add for production

- Auth & role-based access control (the demo lets you pick a facility/role from
  a dropdown instead of logging in).
- Real SMS/IVR gateway for reminders (schema and follow-up worklist are ready
  for it — `notifyService.js` is the intended integration point).
- Interoperability with a standards-based health-record system (e.g. ABDM/ABHA)
  — `patients.abha_id` is already modelled as an optional link.
- An actual offline-first client (service worker + local queue) — the `synced`
  flags in the schema are designed for this.
- Swapping the rule-based triage engine for a validated clinical model/API,
  keeping the same `{symptoms, vitals} -> {urgency, reasoning}` contract.

## Running it locally

Requires Node.js 18+.

### 1.Backend

```bash
cd backend
npm install
npm run seed      # creates + populates arogya_sathi.db with demo facilities/patients
npm start         # http://localhost:4000
```

### 2.Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 (proxies /api to :4000)
```

Open http://localhost:5173. The app comes pre-loaded with a demo facility
hierarchy (a sub-centre, two PHCs, a CHC, a district hospital and a diagnostic
centre in Thiruvallur district, Tamil Nadu) and three demo patients so every
page is populated immediately — pick a patient from the dropdown on the Triage
page to try the full flow: run triage → book a teleconsultation or create a
referral → advance the referral status → check the facility dashboard.

### API quick reference

All endpoints are under `http://localhost:4000/api`:

- `GET /facilities`, `GET /facilities/:id/availability`, `GET /facilities/search/availability?test=ECG`
- `GET /patients`, `POST /patients`, `GET /patients/:id/journey`
- `POST /triage` — `{ patient_id, facility_id, symptoms: [...], vitals: {...} }`
- `GET /appointments/availability/:facilityId`, `POST /appointments`
- `GET /referrals`, `POST /referrals`, `PATCH /referrals/:id/status`
- `GET /followups?dueWithinDays=14`, `PATCH /followups/:id/status`
- `GET /dashboard/facility/:id`, `GET /dashboard/district-overview`


Future Scope

• AI-powered clinical decision support–Replace the current rule-based triage engine with a validated AI model to analyse symptoms,vitals,medical history and risk factors.

• /ABHA integration – Connect with India's digital health ecosystem to securely exchange patient records, referrals and consultation information between healthcare facilities.

• Offline-first mobile application – Enable health workers to register patients, perform triage and update referrals without internet, with automatic syncing when connectivity returns.

• SMS, IVR and WhatsApp reminders – Send appointment, medicine, diagnostic and follow-up reminders through accessible communication channels.

• Predictive high-risk alerts – Identify patients who may miss follow-ups or require escalation and alert health workers before the situation becomes critical.

• Real-time facility capacity management – Show bed availability, doctors, medicines, diagnostic services and emergency capacity across facilities.

• Smart referral routing – Recommend the most suitable facility based on urgency, distance, specialist availability, diagnostics and facility workload.

• Multilingual voice assistant – Allow patients to interact through voice in regional languages,especially supporting elderly and low-literacy users.

• District and state-level analytics – Help health authorities identify referral bottlenecks, medicine shortages, overloaded facilities and emerging healthcare needs.

• Wearable and device integration – Enable automatic collection of BP ,glucose,SpO₂ and other vital signs for continuous monitoring..
