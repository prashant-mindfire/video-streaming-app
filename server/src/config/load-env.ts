import dotenv from 'dotenv';

// Use an absolute resolution hook to guarantee the path resolves accurately
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../../.env') });
