-- Up Migration
CREATE TABLE IF NOT EXISTS public.video_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_id uuid NOT NULL,
    user_id uuid,
    event_type character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_events_pkey PRIMARY KEY (id),
    CONSTRAINT video_events_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['view'::character varying, 'download'::character varying])::text[]))),
    CONSTRAINT video_events_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE,
    CONSTRAINT video_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_video_events_created_at ON public.video_events USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_events_event_type ON public.video_events USING btree (event_type);
CREATE INDEX IF NOT EXISTS idx_video_events_video_id ON public.video_events USING btree (video_id);

-- Down Migration
DROP TABLE IF EXISTS public.video_events;
