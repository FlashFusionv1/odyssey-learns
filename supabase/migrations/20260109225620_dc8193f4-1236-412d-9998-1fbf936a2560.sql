-- Fix search_path for new functions
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.set_class_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.class_code IS NULL THEN
    NEW.class_code := public.generate_class_code();
    WHILE EXISTS (SELECT 1 FROM public.classes WHERE class_code = NEW.class_code) LOOP
      NEW.class_code := public.generate_class_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_video_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.video_lessons 
  SET view_count = view_count + 1 
  WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;