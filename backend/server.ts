import express, { type Request, type Response } from 'express';
import cors from 'cors';
import 'dotenv/config';

import studentRoutes from './student/routes/index.js';
import teacherRoutes from './teacher/routes/index.js';
import adminApiRoutes, { legacyRoutes as adminLegacyRoutes } from './admin/routes/index.js';
import imagekitRoutes from './admin/routes/imagekitRoutes.js';
import vuRoutes from './routes/vuRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import connectDB from './lib/mongodb.js';

const app = express();
const parsedPort = Number.parseInt(process.env.PORT ?? '', 10);
const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 4000;

connectDB();

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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// Force restart for env vars
export default app;
