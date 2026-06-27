import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import tenants from './routes/tenants';
import rooms from './routes/rooms';
import leases from './routes/leases';
import payments from './routes/payments';
import maintenance from './routes/maintenance';
import dashboard from './routes/dashboard';
import backup from './routes/backup';
import auth from './routes/auth';
import contact from './routes/contact';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/requireAuth';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'bahay-ni-kuya-api' }));

app.use('/api/auth', auth);
app.use('/api/contact', contact);

app.use('/api/tenants', requireAuth, tenants);
app.use('/api/rooms', requireAuth, rooms);
app.use('/api/leases', requireAuth, leases);
app.use('/api/payments', requireAuth, payments);
app.use('/api/maintenance', requireAuth, maintenance);
app.use('/api/dashboard', requireAuth, dashboard);
app.use('/api', requireAuth, backup); // GET /api/backup, POST /api/restore

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Bahay ni Kuya API running on http://localhost:${PORT}`);
});
