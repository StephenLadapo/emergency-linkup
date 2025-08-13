-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('student', 'medical_staff', 'security_staff', 'admin');

-- Create emergency types enum
CREATE TYPE public.emergency_type AS ENUM ('medical', 'security', 'fire', 'both');

-- Create emergency status enum
CREATE TYPE public.emergency_status AS ENUM ('pending', 'in_progress', 'resolved', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  student_id TEXT,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create emergency_requests table
CREATE TABLE public.emergency_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emergency_type emergency_type NOT NULL,
  status emergency_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  audio_url TEXT,
  audio_transcription TEXT,
  priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create emergency_responses table for staff responses
CREATE TABLE public.emergency_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emergency_id UUID NOT NULL REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response_type TEXT DEFAULT 'message',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_responses ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = required_role
  );
$$;

-- Create function to check if user can access emergency type
CREATE OR REPLACE FUNCTION public.can_access_emergency_type(user_uuid UUID, req_type emergency_type)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN public.has_role(user_uuid, 'admin') THEN true
      WHEN req_type = 'medical' AND public.has_role(user_uuid, 'medical_staff') THEN true
      WHEN req_type = 'security' AND public.has_role(user_uuid, 'security_staff') THEN true
      WHEN req_type = 'fire' AND (public.has_role(user_uuid, 'medical_staff') OR public.has_role(user_uuid, 'security_staff')) THEN true
      WHEN req_type = 'both' AND (public.has_role(user_uuid, 'medical_staff') OR public.has_role(user_uuid, 'security_staff')) THEN true
      ELSE false
    END;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'medical_staff') OR 
  public.has_role(auth.uid(), 'security_staff') OR 
  public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for emergency_requests
CREATE POLICY "Students can view their own emergency requests"
ON public.emergency_requests FOR SELECT
TO authenticated
USING (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Students can create emergency requests"
ON public.emergency_requests FOR INSERT
TO authenticated
WITH CHECK (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'student')
);

CREATE POLICY "Staff can view emergency requests based on type"
ON public.emergency_requests FOR SELECT
TO authenticated
USING (
  public.can_access_emergency_type(auth.uid(), emergency_type)
);

CREATE POLICY "Staff can update emergency requests"
ON public.emergency_requests FOR UPDATE
TO authenticated
USING (
  public.can_access_emergency_type(auth.uid(), emergency_type)
);

-- RLS Policies for emergency_responses
CREATE POLICY "Students can view responses to their emergencies"
ON public.emergency_responses FOR SELECT
TO authenticated
USING (
  emergency_id IN (
    SELECT id FROM public.emergency_requests 
    WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Staff can view and create responses"
ON public.emergency_responses FOR ALL
TO authenticated
USING (
  emergency_id IN (
    SELECT id FROM public.emergency_requests 
    WHERE public.can_access_emergency_type(auth.uid(), emergency_type)
  )
)
WITH CHECK (
  emergency_id IN (
    SELECT id FROM public.emergency_requests 
    WHERE public.can_access_emergency_type(auth.uid(), emergency_type)
  ) AND
  responder_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    'student'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_requests_updated_at
  BEFORE UPDATE ON public.emergency_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for emergency_requests
ALTER TABLE public.emergency_requests REPLICA IDENTITY FULL;
ALTER TABLE public.emergency_responses REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_responses;