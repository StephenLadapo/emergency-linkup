-- Fix security definer functions by setting search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_emergency_type(user_uuid UUID, req_type emergency_type)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;