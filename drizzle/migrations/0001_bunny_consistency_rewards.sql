ALTER TABLE public.profiles ADD COLUMN study_days integer NOT NULL DEFAULT 0, ADD COLUMN bunny_fur text NOT NULL DEFAULT 'vanilla', ADD COLUMN bunny_outfit text NOT NULL DEFAULT 'classic';
UPDATE public.profiles p SET study_days = (SELECT count(DISTINCT (a.created_at AT TIME ZONE 'Asia/Manila')::date) FROM public.activities a WHERE a.user_id = p.id);
CREATE OR REPLACE FUNCTION public.study_consistency_bonus(_new_day boolean, _streak integer) RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = '' AS $$ SELECT CASE WHEN NOT _new_day THEN 0 ELSE 10 + CASE WHEN _streak = 3 THEN 25 WHEN _streak = 7 THEN 50 ELSE 0 END END $$;
REVOKE ALL ON FUNCTION public.study_consistency_bonus(boolean,integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.study_consistency_bonus(boolean,integer) TO authenticated;
CREATE OR REPLACE FUNCTION public.bunny_required_days(_outfit text) RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = '' AS $$ SELECT CASE _outfit WHEN 'classic' THEN 0 WHEN 'scarf' THEN 1 WHEN 'sweater' THEN 3 WHEN 'overalls' THEN 5 WHEN 'garden' THEN 7 WHEN 'starlight' THEN 14 ELSE NULL END $$;
REVOKE ALL ON FUNCTION public.bunny_required_days(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.bunny_required_days(text) TO authenticated;
CREATE OR REPLACE FUNCTION public.save_bunny(_fur text, _outfit text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid := auth.uid(); days integer; required integer;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Please sign in'; END IF;
 IF _fur IS NULL OR _fur NOT IN ('vanilla','blush','sky') THEN RAISE EXCEPTION 'Invalid fur color'; END IF;
 required := public.bunny_required_days(_outfit);
 IF required IS NULL THEN RAISE EXCEPTION 'Invalid outfit'; END IF;
 SELECT study_days INTO days FROM public.profiles WHERE id = uid FOR UPDATE;
 IF days IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
 IF days < required THEN RAISE EXCEPTION 'This outfit is still locked'; END IF;
 UPDATE public.profiles SET bunny_fur = _fur, bunny_outfit = _outfit WHERE id = uid;
END $$;
REVOKE ALL ON FUNCTION public.save_bunny(text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.save_bunny(text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.record_activity(_kind text, _subject text, _topic text, _score integer DEFAULT NULL, _total integer DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid := auth.uid(); pts integer; last date; today date := (now() AT TIME ZONE 'Asia/Manila')::date; next_streak integer; current_streak integer; new_day boolean;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
 IF _kind IS NULL OR _kind NOT IN ('flashcards','quiz','guide','tutor','teach','explain') THEN RAISE EXCEPTION 'bad kind'; END IF;
 SELECT last_study_date, streak INTO last, current_streak FROM public.profiles WHERE id = uid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
 new_day := last IS DISTINCT FROM today;
 next_streak := CASE WHEN last = today THEN current_streak WHEN last = today - 1 THEN current_streak + 1 ELSE 1 END;
 pts := CASE _kind WHEN 'quiz' THEN 10 + 5 * LEAST(GREATEST(COALESCE(_score,0),0),20) WHEN 'teach' THEN 25 WHEN 'flashcards' THEN 15 WHEN 'guide' THEN 10 ELSE 5 END;
 pts := pts + public.study_consistency_bonus(new_day, next_streak);
 INSERT INTO public.activities(user_id,kind,subject,topic,score,total,points) VALUES (uid,_kind,left(COALESCE(_subject,'General'),60),left(COALESCE(_topic,''),200),_score,_total,pts);
 UPDATE public.profiles SET points = points + pts, streak = next_streak, last_study_date = today, study_days = study_days + CASE WHEN new_day THEN 1 ELSE 0 END WHERE id = uid;
 RETURN pts;
END $$;
REVOKE ALL ON FUNCTION public.record_activity(text,text,text,integer,integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.record_activity(text,text,text,integer,integer) TO authenticated;