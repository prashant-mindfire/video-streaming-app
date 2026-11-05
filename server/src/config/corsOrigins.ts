import type { CorsOptions } from 'cors';

const allowedOrigins: string[] = [
    ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
    ...(process.env.API_VERSION ? [`/api/${process.env.API_VERSION}`] : []),
]

const corsOrigins: CorsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ): void => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS error'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
}

export default corsOrigins;
