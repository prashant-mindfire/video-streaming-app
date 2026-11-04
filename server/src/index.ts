import dotenv from 'dotenv';
import process from 'process';
import express from 'express';
import logger from './utils/logger.ts';
import { connectDB } from './config/db.ts';

dotenv.config({ path: '../.env' });

const app = express();

const PORT = process.env.PORT || 3500

app.use(express.json())

connectDB().then(() => {
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
});

export default app;
