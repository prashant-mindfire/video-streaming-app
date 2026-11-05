import dotenv from 'dotenv';
import express from 'express';
import logger from './utils/logger.ts';
import { connectDB } from './config/db.ts';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOrigins from './config/corsOrigins.ts';
import router from './routes/router.ts';
import { swaggerDocs, swaggerUi } from './config/swagger.ts';

dotenv.config({ path: '../.env' });

const app = express();

const PORT = process.env.PORT || 3500

app.use(cors(corsOrigins));
app.use(cookieParser());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(`/api/${process.env.API_VERSION}`, router);

connectDB().then(() => {
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
});

export default app;
