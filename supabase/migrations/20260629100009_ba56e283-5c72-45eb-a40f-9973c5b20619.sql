
-- 1. loyalty_accounts: remove client-facing INSERT policy
DROP POLICY IF EXISTS "System creates loyalty accounts" ON public.loyalty_accounts;

-- 2. profiles: allow staff roles to view profiles
CREATE POLICY "Staff can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'frontdesk'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  );

-- 3. staff: revoke read of financial columns from anon and authenticated
REVOKE SELECT (commission_rate, rental_fee_cents) ON public.staff FROM anon;
REVOKE SELECT (commission_rate, rental_fee_cents) ON public.staff FROM authenticated;

-- SECURITY DEFINER function so managers/admins/owners can still read financials
CREATE OR REPLACE FUNCTION public.get_staff_financials()
RETURNS TABLE (
  id uuid,
  name text,
  commission_rate numeric,
  rental_fee_cents integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.name, s.commission_rate, s.rental_fee_cents
  FROM public.staff s
  WHERE public.has_role(auth.uid(), 'manager'::public.app_role)
     OR public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'owner'::public.app_role);
$$;
REVOKE ALL ON FUNCTION public.get_staff_financials() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_staff_financials() TO authenticated;

-- 4. staff_time_off: hide notes column from anon and authenticated
REVOKE SELECT (notes) ON public.staff_time_off FROM anon;
REVOKE SELECT (notes) ON public.staff_time_off FROM authenticated;
