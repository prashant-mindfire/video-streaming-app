import logger from '@/utils/logger';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
    try {
        await pool.query('SELECT 1');
        logger.info('Postgres connected');
    } catch (error) {
        logger.error('Error connecting to Postgres:', error);
        process.exit(1);
    }
};

export { connectDB, pool };