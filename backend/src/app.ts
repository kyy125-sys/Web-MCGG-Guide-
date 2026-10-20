import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { heroRoutes } from './routes/heroes';
import { commanderRoutes } from './routes/commanders';
import { synergyRoutes } from './routes/synergies';
import { lineupRoutes } from './routes/lineups';
import { patchRoutes } from './routes/patches';
import { tierRoutes } from './routes/tiers';
import { authRoutes } from './routes/auth';
import { uploadRoutes } from './routes/uploads';
import { recommendationRoutes } from './routes/recommendations';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/heroes', heroRoutes);
app.use('/api/commanders', commanderRoutes);
app.use('/api/synergies', synergyRoutes);
app.use('/api/lineups', lineupRoutes);
app.use('/api/patches', patchRoutes);
app.use('/api/tiers', tierRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
