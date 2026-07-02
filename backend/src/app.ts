import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { contextMiddleware } from './middlewares/context.middleware';
import { swaggerSpec } from './config/swagger';
import { ApiResponse } from './utils/response.formatter';
import healthRouter from './routes/health.routes';
import authRouter from './modules/auth/auth.routes';
import adminRouter from './modules/admin/admin.routes';
import managerRouter from './modules/manager/manager.routes';
import ownerRouter from './modules/owner/owner.routes';
import userRouter from './modules/user/user.routes';

const app: Application = express();
app.disable('etag');

// 1. Basic Middlewares & Parsers
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Global Request Context (AsyncLocalStorage mapping)
app.use(contextMiddleware);

// 3. CORS setup
const corsOrigins = env.CORS_ORIGINS;
app.use(
  cors({
    origin: corsOrigins === '*' ? '*' : corsOrigins.split(','),
    credentials: true,
  })
);

// 4. Request Logger (Morgan + Winston stream)
app.use(loggerMiddleware);

// 5. Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ApiResponse.error(res, 'Too many requests from this IP, please try again later.', 429);
  },
});
app.use(limiter);

// 6. Documentation Router
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 7. Base routes mapping
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/manager', managerRouter);
app.use('/api/v1/owner', ownerRouter);
app.use('/api/v1/user', userRouter);

// 8. 404 Route handler
app.use((req, res, next) => {
  ApiResponse.error(res, `Cannot ${req.method} ${req.path}`, 404);
});

// 9. Centralized Error Handler (must be attached last!)
app.use(errorMiddleware);

export default app;
export { app };
