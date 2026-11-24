-- Up Migration
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
    CONSTRAINT video_uploads_pkey PRIMARY KEY (id),
    CONSTRAINT video_uploads_object_key_key UNIQUE (object_key),
    CONSTRAINT video_uploads_file_size_check CHECK ((file_size > 0)),
    CONSTRAINT video_uploads_total_parts_check CHECK ((total_parts > 0)),
    CONSTRAINT video_uploads_status_check CHECK (((status)::text = ANY ((ARRAY['initiated'::character varying, 'uploading'::character varying, 'completed'::character varying, 'aborted'::character varying, 'failed'::character varying, 'expired'::character varying])::text[]))),
    CONSTRAINT video_uploads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

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
    CONSTRAINT videos_pkey PRIMARY KEY (id),
    CONSTRAINT videos_upload_id_key UNIQUE (upload_id),
    CONSTRAINT videos_status_check CHECK (((status)::text = ANY ((ARRAY['queued'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying, 'deleting'::character varying])::text[]))),
    CONSTRAINT videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT videos_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES public.video_uploads(id) ON DELETE SET NULL
);

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
    CONSTRAINT video_variants_pkey PRIMARY KEY (id),
    CONSTRAINT video_variants_video_id_resolution_key UNIQUE (video_id, resolution),
    CONSTRAINT video_variants_resolution_check CHECK (((resolution)::text = ANY ((ARRAY['1080p'::character varying, '720p'::character varying, '480p'::character varying])::text[]))),
    CONSTRAINT video_variants_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT video_variants_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE
);

CREATE INDEX idx_video_uploads_status ON public.video_uploads USING btree (status);
CREATE INDEX idx_video_uploads_user_id ON public.video_uploads USING btree (user_id);

CREATE INDEX idx_videos_created_at ON public.videos USING btree (created_at DESC);
CREATE INDEX idx_videos_duration ON public.videos USING btree (duration_seconds);
CREATE INDEX idx_videos_resolution ON public.videos USING btree (width, height);
CREATE INDEX idx_videos_status ON public.videos USING btree (status);
CREATE INDEX idx_videos_user_id ON public.videos USING btree (user_id);

CREATE INDEX idx_video_variants_status ON public.video_variants USING btree (status);
CREATE INDEX idx_video_variants_video_id ON public.video_variants USING btree (video_id);

-- Down Migration
DROP TABLE IF EXISTS public.video_variants;
DROP TABLE IF EXISTS public.videos;
DROP TABLE IF EXISTS public.video_uploads;
