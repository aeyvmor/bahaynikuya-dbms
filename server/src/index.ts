import express from 'express';
import cors from 'cors';

import tenants from './routes/tenants';
import rooms from './routes/rooms';
import leases from './routes/leases';
import payments from './routes/payments';
import maintenance from './routes/maintenance';
import dashboard from './routes/dashboard';
import backup from './routes/backup';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'bahay-ni-kuya-api' }));

app.use('/api/tenants', tenants);
app.use('/api/rooms', rooms);
app.use('/api/leases', leases);
app.use('/api/payments', payments);
app.use('/api/maintenance', maintenance);
app.use('/api/dashboard', dashboard);
app.use('/api', backup); // GET /api/backup, POST /api/restore

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Bahay ni Kuya API running on http://localhost:${PORT}`);
});
