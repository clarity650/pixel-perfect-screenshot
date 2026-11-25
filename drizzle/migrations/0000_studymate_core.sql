CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Student',
  points integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  last_study_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  subject text NOT NULL DEFAULT 'General',
  topic text NOT NULL,
  score integer,
  total integer,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activities_user_idx ON public.activities(user_id, created_at DESC);
GRANT SELECT ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activities read" ON public.activities FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name',''), NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1), 'Student'));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.record_activity(_kind text, _subject text, _topic text, _score integer DEFAULT NULL, _total integer DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid := auth.uid(); pts integer; last date; today date := (now() AT TIME ZONE 'Asia/Manila')::date;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  IF _kind NOT IN ('flashcards','quiz','guide','tutor','teach','explain') THEN RAISE EXCEPTION 'bad kind'; END IF;
  pts := CASE _kind WHEN 'quiz' THEN 10 + 5 * LEAST(GREATEST(COALESCE(_score,0),0), 20)
    WHEN 'teach' THEN 25 WHEN 'flashcards' THEN 15 WHEN 'guide' THEN 10 ELSE 5 END;
  INSERT INTO public.activities(user_id, kind, subject, topic, score, total, points)
  VALUES (uid, _kind, left(COALESCE(_subject,'General'),60), left(_topic,200), _score, _total, pts);
  SELECT last_study_date INTO last FROM public.profiles WHERE id = uid;
  UPDATE public.profiles SET points = points + pts,
    streak = CASE WHEN last = today THEN streak WHEN last = today - 1 THEN streak + 1 ELSE 1 END,
    last_study_date = today
  WHERE id = uid;
  RETURN pts;
END $$;
REVOKE ALL ON FUNCTION public.record_activity(text,text,text,integer,integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.record_activity(text,text,text,integer,integer) TO authenticated;