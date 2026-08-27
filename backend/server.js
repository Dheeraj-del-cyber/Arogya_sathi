import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import facilitiesRouter from './routes/facilities.js';
import patientsRouter from './routes/patients.js';
import triageRouter from './routes/triage.js';
import appointmentsRouter from './routes/appointments.js';
import referralsRouter from './routes/referrals.js';
import followupsRouter from './routes/followups.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'arogya-sathi-backend' }));

app.use('/api/facilities', facilitiesRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/triage', triageRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/followups', followupsRouter);
app.use('/api/dashboard', dashboardRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Arogya Sathi backend running on http://localhost:${PORT}`));
