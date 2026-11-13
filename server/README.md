# Server

The server is a TypeScript/Express API for authentication, video uploads, video management, and admin dashboard metrics. It uses PostgreSQL for application data, RustFS for S3-compatible object storage, Redis for playback/progress state, and RabbitMQ to dispatch video-processing jobs.

## Requirements

- Node.js 20 or later and npm.
- PostgreSQL, Redis, RabbitMQ, and an S3-compatible RustFS instance.
- FFmpeg and ffprobe on `PATH` for the video worker.
- The database schema must be initialized before the API starts. This repository does not currently include schema migrations.

## Install and run

From the repository root, configure the root `.env` file using the variables below. Then:

```powershell
cd server
npm install
npm run dev
```

Run the asynchronous workers in separate terminals from the `server` directory:

```powershell
npm run dev:outbox
npm run dev:worker
```

The API listens on `PORT` (default `3500`) and mounts versioned routes under `/api/{API_VERSION}`. Swagger UI is at `/api-docs`; for example, `http://localhost:5000/api-docs` when `PORT=5000`.

The worker requires FFmpeg/ffprobe and access to PostgreSQL, RabbitMQ, Redis, and RustFS. Create the bucket named by `RUSTFS_BUCKET_NAME` before uploading or processing videos.

## Configuration

The server scripts load the repository-root `.env` file when run from this directory. Required infrastructure variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; the client defaults to `5000`. |
| `API_VERSION` | API route prefix, for example `v1`. |
| `JWT_SECRET` | Secret used to sign session tokens. Use a strong private value. |
| `DATABASE_URL` | PostgreSQL connection URL. |
| `REDIS_URL` | Redis connection URL. |
| `RABBITMQ_URL` | RabbitMQ AMQP connection URL. |
| `RUSTFS_STORAGE_ENDPOINT` | RustFS S3 API endpoint, such as `http://localhost:9000`. |
| `RUSTFS_ACCESS_KEY`, `RUSTFS_SECRET_KEY` | RustFS credentials. |
| `RUSTFS_REGION` | S3 client region value. |
| `RUSTFS_BUCKET_NAME` | Existing bucket used to store source videos and processed assets. |
| `ALLOWED_ORIGINS` | Comma-separated browser origins allowed by CORS, such as `http://localhost:3000`. |

When using `docker-compose.dev.yml`, also configure `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS`, `RUSTFS_ACCESS_KEY`, and `RUSTFS_SECRET_KEY`; these configure the local containers. The `DATABASE_URL`/`RABBITMQ_URL` values used by applications running on the host should connect through `localhost`.

Optional upload settings (defaults shown):

| Variable | Default | Purpose |
| --- | --- | --- |
| `UPLOAD_PART_SIZE_MB` | `10` | Multipart upload part size in MiB. |
| `MAX_VIDEO_SIZE_MB` | `5120` | Maximum source video size in MiB. |
| `UPLOAD_URL_EXPIRY_SECONDS` | `900` | Lifetime of presigned upload/download URLs where applicable. |
| `UPLOAD_INITIAL_BATCH_SIZE` | `5` | Number of part URLs returned when an upload is initiated. |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with watch mode. |
| `npm run dev:outbox` | Run the outbox publisher with watch mode. |
| `npm run dev:worker` | Run the video-processing worker with watch mode. |
| `npm run build` | Compile TypeScript and resolve aliases. |
| `npm run prod` | Run the compiled API. |
| `npm test` | Run the test suite. |
| `npm run lint` | Lint server source. |

The `start:outbox` and `start:worker` scripts run the corresponding compiled workers in production.