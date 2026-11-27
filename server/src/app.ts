import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import corsOrigins from './config/corsOrigins';
import helmetOptions from './config/helmet';
import { swaggerDocs, swaggerUi } from './config/swagger';
import { csrfProtection } from './middlewares/csrf.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundErrorHandler } from './middlewares/notFound.middleware';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';
import router from './routes/router';

const app = express();

const apiPrefix = `/api/${process.env.API_VERSION}`;

app.use(helmet(helmetOptions));

app.use(cors(corsOrigins));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiPrefix, globalRateLimiter);
app.use(apiPrefix, csrfProtection);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(apiPrefix, router);

app.use(notFoundErrorHandler);

app.use(errorHandler);

export default app;
