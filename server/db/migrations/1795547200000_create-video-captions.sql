-- Up Migration
CREATE TABLE IF NOT EXISTS public.video_captions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_id uuid NOT NULL,
    language character varying(35) NOT NULL,
    label character varying(100) NOT NULL,
    object_key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_captions_pkey PRIMARY KEY (id),
    CONSTRAINT video_captions_video_language_key UNIQUE (video_id, language),
    CONSTRAINT video_captions_object_key_key UNIQUE (object_key),
    CONSTRAINT video_captions_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_video_captions_video_id ON public.video_captions USING btree (video_id);

-- Down Migration
DROP TABLE IF EXISTS public.video_captions;
