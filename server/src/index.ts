import dotenv from 'dotenv';
import process from 'process';
import express from 'express';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500

app.use(express.json())

app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`))

export default app;
