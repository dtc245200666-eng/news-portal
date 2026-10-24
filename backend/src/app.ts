import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import swaggerDocument from './swagger/swagger.json';
import { getSitemapXml, getRobotsTxt, getRssFeed } from './controllers/feed.controller';
import { apiLimiter } from './middlewares/rate-limiter.middleware';

const app = express();

// Trust reverse proxy (Docker / Nginx)
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Let frontend handle client scripts
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost frontend and undefined origin (mobile/curl/server-to-server)
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads directory
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global API rate limit
app.use('/api/', apiLimiter);

// Root SEO routes
app.get('/sitemap.xml', getSitemapXml);
app.get('/robots.txt', getRobotsTxt);
app.get('/rss.xml', getRssFeed);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'NewsPortal API',
  });
});

// Mount API v1
app.use('/api/v1', apiRoutes);

// 404 Handler for undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống`,
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
