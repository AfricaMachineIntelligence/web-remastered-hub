
DROP POLICY IF EXISTS "Anyone can view active staff" ON public.staff;
CREATE POLICY "Public can view active staff (safe cols)"
  ON public.staff FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

REVOKE SELECT ON public.staff FROM anon, authenticated;
GRANT SELECT (id, user_id, name, specialty, is_active, created_at) ON public.staff TO anon, authenticated;
GRANT SELECT ON public.staff TO service_role;

REVOKE SELECT ON public.staff_time_off FROM anon, authenticated;
GRANT SELECT (id, staff_id, date, start_time, end_time, all_day, created_at, updated_at) ON public.staff_time_off TO authenticated;
GRANT SELECT ON public.staff_time_off TO service_role;

DROP POLICY IF EXISTS "Admins can manage non-admin roles" ON public.user_roles;
CREATE POLICY "Admins can manage non-admin non-owner roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) AND role <> 'admin'::public.app_role AND role <> 'owner'::public.app_role)
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) AND role <> 'admin'::public.app_role AND role <> 'owner'::public.app_role);

REVOKE EXECUTE ON FUNCTION public.get_staff_financials() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_staff_financials() TO authenticated;
