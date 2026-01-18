import express, { type Request, type Response } from 'express';
import cors from 'cors';
import 'dotenv/config';

import studentRoutes from './features/student/routes/index.js';
import teacherRoutes from './features/teacher/routes/index.js';
import adminApiRoutes, { legacyRoutes as adminLegacyRoutes } from './features/admin/routes/index.js';
import imagekitRoutes from './features/admin/routes/imagekitRoutes.js';
import vuRoutes from './routes/vu.routes.js';
import aiRoutes from './routes/ai.routes.js';
import connectDB from './shared/lib/mongodb.js';

const app = express();
const parsedPort = Number.parseInt(process.env.PORT ?? '', 10);
const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 4000;

connectDB();

import rateLimit from 'express-rate-limit';

// Global Rate Limiter: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminApiRoutes);
app.use('/api/imagekit', imagekitRoutes);
app.use('/api/vu', vuRoutes);
app.use('/api/ai', aiRoutes);

app.use('/', adminLegacyRoutes);

app.get('/', (_req: Request, res: Response): void => {
  res.json({
    message: 'VOIS Hackathon API',
    modules: ['student', 'teacher', 'admin']
  });
});

import { fileURLToPath } from 'url';

// Only listen if run directly (not imported)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

// Force restart for env vars
export default app;
