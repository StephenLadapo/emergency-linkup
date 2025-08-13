-- 1) Ensure trigger to create profile rows on new auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- 2) Create a table to store project/system information
CREATE TABLE IF NOT EXISTS public.system_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'University of Limpopo Emergency System',
  description TEXT,
  emergency_phone TEXT,
  support_email TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and policies for system_info
ALTER TABLE public.system_info ENABLE ROW LEVEL SECURITY;

-- Everyone can read system info (public landing page)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='system_info' AND policyname='System info readable by everyone'
  ) THEN
    CREATE POLICY "System info readable by everyone"
    ON public.system_info
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Only admins can insert/update/delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='system_info' AND policyname='Only admins can modify system info'
  ) THEN
    CREATE POLICY "Only admins can modify system info"
    ON public.system_info
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_system_info_updated_at'
  ) THEN
    CREATE TRIGGER trg_system_info_updated_at
    BEFORE UPDATE ON public.system_info
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();
  END IF;
END $$;

-- 3) Create a table for configurable emergency trigger phrases
CREATE TABLE IF NOT EXISTS public.trigger_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- e.g., 'medical','security','fire','general'
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trigger_phrases ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active phrases
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='trigger_phrases' AND policyname='Authenticated users can read phrases'
  ) THEN
    CREATE POLICY "Authenticated users can read phrases"
    ON public.trigger_phrases
    FOR SELECT
    TO authenticated
    USING (active = true);
  END IF;
END $$;

-- Only admins can manage phrases
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='trigger_phrases' AND policyname='Only admins can manage phrases'
  ) THEN
    CREATE POLICY "Only admins can manage phrases"
    ON public.trigger_phrases
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Updated_at trigger for trigger_phrases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trigger_phrases_updated_at'
  ) THEN
    CREATE TRIGGER trg_trigger_phrases_updated_at
    BEFORE UPDATE ON public.trigger_phrases
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();
  END IF;
END $$;

-- 4) Seed a default system info row if none exists
INSERT INTO public.system_info (name, description, emergency_phone, support_email)
SELECT 'University of Limpopo Emergency System',
       'Emergency assistance platform for students and staff at University of Limpopo. Provides security and medical emergency workflows, location sharing, and alerts.',
       '+27 15 268 9111',
       'emergency@ul.ac.za'
WHERE NOT EXISTS (SELECT 1 FROM public.system_info);

-- 5) Seed some default trigger phrases if none exist
INSERT INTO public.trigger_phrases (phrase, category)
SELECT p.phrase, p.category
FROM (
  VALUES
    ('help', 'general'),
    ('please help me', 'general'),
    ("I am hurt", 'medical'),
    ('I''m hurt', 'medical'),
    ('I am injured', 'medical'),
    ('I can''t breathe', 'medical'),
    ('call security', 'security'),
    ('there is a fight', 'security'),
    ('someone is attacking me', 'security'),
    ('fire', 'fire'),
    ('there is a fire', 'fire'),
    ('I smell smoke', 'fire')
) AS p(phrase, category)
WHERE NOT EXISTS (SELECT 1 FROM public.trigger_phrases);
