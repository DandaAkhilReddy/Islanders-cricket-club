import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { env } from './env';
import { initializeDatabase } from './db';

import authRoutes from './routes/auth';
import playerRoutes from './routes/players';
import matchRoutes from './routes/matches';
import eventRoutes from './routes/events';
import blogRoutes from './routes/blog';
import highlightRoutes from './routes/highlights';
import sponsorRoutes from './routes/sponsors';
import leadershipRoutes from './routes/leadership';
import statsRoutes from './routes/stats';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP'
  }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(join(process.cwd(), env.UPLOAD_DIR)));

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/leadership', leadershipRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Islanders Cricket Club API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: `File too large. Maximum size: ${env.MAX_UPLOAD_MB}MB`
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field'
    });
  }

  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

const startServer = async () => {
  try {
    initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(env.PORT, () => {
      console.log(`🏏 Islanders Cricket Club server running on port ${env.PORT}`);
      console.log(`📊 Environment: ${env.NODE_ENV}`);
      console.log(`🔒 Allowed origins: ${allowedOrigins.join(', ')}`);
      console.log(`📁 Upload directory: ${env.UPLOAD_DIR}`);
      console.log(`💾 Database: ${env.SQLITE_PATH}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();