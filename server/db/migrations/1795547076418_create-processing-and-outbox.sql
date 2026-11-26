-- Up Migration
CREATE TABLE IF NOT EXISTS public.processing_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_id uuid NOT NULL,
    job_type character varying(50) DEFAULT 'video_processing'::character varying NOT NULL,
    status character varying(30) DEFAULT 'queued'::character varying NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    last_error text,
    next_retry_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    dead_lettered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT processing_jobs_pkey PRIMARY KEY (id),
    CONSTRAINT processing_jobs_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT processing_jobs_status_check CHECK (((status)::text = ANY ((ARRAY['queued'::character varying, 'running'::character varying, 'retry_scheduled'::character varying, 'completed'::character varying, 'failed'::character varying, 'dead_lettered'::character varying])::text[]))),
    CONSTRAINT processing_jobs_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.processing_job_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    attempt_number integer NOT NULL,
    status character varying(20) NOT NULL,
    error_message text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT processing_job_attempts_pkey PRIMARY KEY (id),
    CONSTRAINT processing_job_attempts_job_id_attempt_number_key UNIQUE (job_id, attempt_number),
    CONSTRAINT processing_job_attempts_status_check CHECK (((status)::text = ANY ((ARRAY['running'::character varying, 'succeeded'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT processing_job_attempts_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.processing_jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.outbox_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    event_type character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    available_at timestamp with time zone DEFAULT now(),
    published_at timestamp with time zone,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT outbox_events_pkey PRIMARY KEY (id),
    CONSTRAINT outbox_events_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.processing_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_processing_jobs_created_at ON public.processing_jobs USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON public.processing_jobs USING btree (status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_video_id ON public.processing_jobs USING btree (video_id);
CREATE INDEX IF NOT EXISTS idx_job_attempts_job_id ON public.processing_job_attempts USING btree (job_id);
CREATE INDEX IF NOT EXISTS idx_outbox_events_pending ON public.outbox_events USING btree (available_at, created_at) WHERE ((status)::text = 'pending'::text);

-- Down Migration
DROP TABLE IF EXISTS public.outbox_events;
DROP TABLE IF EXISTS public.processing_job_attempts;
DROP TABLE IF EXISTS public.processing_jobs;
