import express from 'express';
import logger from './utils/logger';
import { connectDB } from './config/db';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOrigins from './config/corsOrigins';
import router from './routes/router';
import { swaggerDocs, swaggerUi } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

const PORT = process.env.PORT || 3500

app.use(cors(corsOrigins));
app.use(cookieParser());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(`/api/${process.env.API_VERSION}`, router);

app.use(errorHandler);

connectDB().then(() => {
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
});

export default app;
