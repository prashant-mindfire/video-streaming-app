import express from 'express';
import logger from './utils/logger';
import { connectDB } from './config/db';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOrigins from './config/corsOrigins';
import router from './routes/router';
import { swaggerDocs, swaggerUi } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundErrorHandler } from './middlewares/notFound.middleware';

const app = express();

const PORT = process.env.PORT || 3500

app.use(cors(corsOrigins));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(`/api/${process.env.API_VERSION}`, router);

app.use(notFoundErrorHandler);

app.use(errorHandler);

connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`);
        logger.info(`Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
});

export default app;
