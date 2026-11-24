--
-- PostgreSQL database dump
--

\restrict CcFS9B9OU3QZ2lQCNpgC9UH9hgXEyY8a9o5fVchKkqqaelfqBjxeRPnqyqrUGtH

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: outbox_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outbox_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    event_type character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    available_at timestamp with time zone DEFAULT now(),
    published_at timestamp with time zone,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: processing_job_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.processing_job_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    attempt_number integer NOT NULL,
    status character varying(20) NOT NULL,
    error_message text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT processing_job_attempts_status_check CHECK (((status)::text = ANY ((ARRAY['running'::character varying, 'succeeded'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: processing_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.processing_jobs (
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
    CONSTRAINT processing_jobs_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT processing_jobs_status_check CHECK (((status)::text = ANY ((ARRAY['queued'::character varying, 'running'::character varying, 'retry_scheduled'::character varying, 'completed'::character varying, 'failed'::character varying, 'dead_lettered'::character varying])::text[])))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: video_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_id uuid NOT NULL,
    user_id uuid,
    event_type character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_events_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['view'::character varying, 'download'::character varying])::text[])))
);


--
-- Name: video_uploads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_uploads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    original_filename character varying(500) NOT NULL,
    object_key text NOT NULL,
    multipart_upload_id text,
    file_size bigint NOT NULL,
    content_type character varying(150),
    total_parts integer NOT NULL,
    status character varying(30) DEFAULT 'initiated'::character varying NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    part_size bigint NOT NULL,
    CONSTRAINT video_uploads_file_size_check CHECK ((file_size > 0)),
    CONSTRAINT video_uploads_status_check CHECK (((status)::text = ANY ((ARRAY['initiated'::character varying, 'uploading'::character varying, 'completed'::character varying, 'aborted'::character varying, 'failed'::character varying, 'expired'::character varying])::text[]))),
    CONSTRAINT video_uploads_total_parts_check CHECK ((total_parts > 0))
);


--
-- Name: video_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_id uuid NOT NULL,
    resolution character varying(10) NOT NULL,
    width integer,
    height integer,
    codec character varying(100),
    bitrate bigint,
    file_size bigint,
    object_key text,
    playlist_object_key text,
    segments_prefix text,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_variants_resolution_check CHECK (((resolution)::text = ANY ((ARRAY['1080p'::character varying, '720p'::character varying, '480p'::character varying])::text[]))),
    CONSTRAINT video_variants_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    upload_id uuid,
    title character varying(255) NOT NULL,
    description text,
    original_object_key text NOT NULL,
    thumbnail_object_key text,
    hls_master_playlist_key text,
    file_size bigint NOT NULL,
    duration_seconds integer,
    width integer,
    height integer,
    codec character varying(100),
    status character varying(30) DEFAULT 'queued'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT videos_status_check CHECK (((status)::text = ANY ((ARRAY['queued'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying, 'deleting'::character varying])::text[])))
);


--
-- Name: auth_sessions auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (id);


--
-- Name: outbox_events outbox_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outbox_events
    ADD CONSTRAINT outbox_events_pkey PRIMARY KEY (id);


--
-- Name: processing_job_attempts processing_job_attempts_job_id_attempt_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processing_job_attempts
    ADD CONSTRAINT processing_job_attempts_job_id_attempt_number_key UNIQUE (job_id, attempt_number);


--
-- Name: processing_job_attempts processing_job_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processing_job_attempts
    ADD CONSTRAINT processing_job_attempts_pkey PRIMARY KEY (id);


--
-- Name: processing_jobs processing_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processing_jobs
    ADD CONSTRAINT processing_jobs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_events video_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_events
    ADD CONSTRAINT video_events_pkey PRIMARY KEY (id);


--
-- Name: video_uploads video_uploads_object_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_uploads
    ADD CONSTRAINT video_uploads_object_key_key UNIQUE (object_key);


--
-- Name: video_uploads video_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_uploads
    ADD CONSTRAINT video_uploads_pkey PRIMARY KEY (id);


--
-- Name: video_variants video_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_variants
    ADD CONSTRAINT video_variants_pkey PRIMARY KEY (id);


--
-- Name: video_variants video_variants_video_id_resolution_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_variants
    ADD CONSTRAINT video_variants_video_id_resolution_key UNIQUE (video_id, resolution);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: videos videos_upload_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_upload_id_key UNIQUE (upload_id);


--
-- Name: idx_auth_sessions_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_sessions_active ON public.auth_sessions USING btree (id, user_id, expires_at) WHERE (revoked_at IS NULL);


--
-- Name: idx_auth_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_sessions_user_id ON public.auth_sessions USING btree (user_id);


--
-- Name: idx_job_attempts_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_attempts_job_id ON public.processing_job_attempts USING btree (job_id);


--
-- Name: idx_outbox_events_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_outbox_events_pending ON public.outbox_events USING btree (available_at, created_at) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_processing_jobs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_processing_jobs_created_at ON public.processing_jobs USING btree (created_at DESC);


--
-- Name: idx_processing_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_processing_jobs_status ON public.processing_jobs USING btree (status);


--
-- Name: idx_processing_jobs_video_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_processing_jobs_video_id ON public.processing_jobs USING btree (video_id);


--
-- Name: idx_video_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_events_created_at ON public.video_events USING btree (created_at DESC);


--
-- Name: idx_video_events_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_events_event_type ON public.video_events USING btree (event_type);


--
-- Name: idx_video_events_video_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_events_video_id ON public.video_events USING btree (video_id);


--
-- Name: idx_video_uploads_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_uploads_status ON public.video_uploads USING btree (status);


--
-- Name: idx_video_uploads_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_uploads_user_id ON public.video_uploads USING btree (user_id);


--
-- Name: idx_video_variants_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_variants_status ON public.video_variants USING btree (status);


--
-- Name: idx_video_variants_video_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_variants_video_id ON public.video_variants USING btree (video_id);


--
-- Name: idx_videos_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_videos_created_at ON public.videos USING btree (created_at DESC);


--
-- Name: idx_videos_duration; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_videos_duration ON public.videos USING btree (duration_seconds);


--
-- Name: idx_videos_resolution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_videos_resolution ON public.videos USING btree (width, height);


--
-- Name: idx_videos_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_videos_status ON public.videos USING btree (status);


--
-- Name: idx_videos_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_videos_user_id ON public.videos USING btree (user_id);


--
-- Name: auth_sessions auth_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: outbox_events outbox_events_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outbox_events
    ADD CONSTRAINT outbox_events_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.processing_jobs(id) ON DELETE CASCADE;


--
-- Name: processing_job_attempts processing_job_attempts_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processing_job_attempts
    ADD CONSTRAINT processing_job_attempts_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.processing_jobs(id) ON DELETE CASCADE;


--
-- Name: processing_jobs processing_jobs_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processing_jobs
    ADD CONSTRAINT processing_jobs_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: video_events video_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_events
    ADD CONSTRAINT video_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: video_events video_events_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_events
    ADD CONSTRAINT video_events_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: video_uploads video_uploads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_uploads
    ADD CONSTRAINT video_uploads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: video_variants video_variants_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_variants
    ADD CONSTRAINT video_variants_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: videos videos_upload_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES public.video_uploads(id);


--
-- Name: videos videos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict CcFS9B9OU3QZ2lQCNpgC9UH9hgXEyY8a9o5fVchKkqqaelfqBjxeRPnqyqrUGtH

