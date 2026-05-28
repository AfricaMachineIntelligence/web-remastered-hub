
-- 1. event_log: restrict INSERT
DROP POLICY IF EXISTS "System can insert events" ON public.event_log;
CREATE POLICY "Authenticated users can insert their own events"
ON public.event_log
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2. loyalty_accounts: remove user update privilege
DROP POLICY IF EXISTS "Users can update their own loyalty account" ON public.loyalty_accounts;

-- 3. staff: hide financial columns from clients
REVOKE SELECT (commission_rate, rental_fee_cents) ON public.staff FROM anon, authenticated;

-- 4. staff_time_off: authenticated-only and hide notes
DROP POLICY IF EXISTS "Public can view staff time-off for booking" ON public.staff_time_off;
CREATE POLICY "Authenticated can view staff time-off for booking"
ON public.staff_time_off
FOR SELECT
TO authenticated
USING (true);
REVOKE SELECT (notes) ON public.staff_time_off FROM anon, authenticated;

-- 5. Remove sensitive tables from realtime publication (not used by app code)
ALTER PUBLICATION supabase_realtime DROP TABLE public.staff_availability;
ALTER PUBLICATION supabase_realtime DROP TABLE public.staff_time_off;

-- 6. user_roles: prevent admins from minting admin role; only owner can
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage non-admin roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'admin'::app_role
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'admin'::app_role
);
CREATE POLICY "Owners can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));

-- 7. Revoke EXECUTE on internal SECURITY DEFINER helpers from public clients
REVOKE EXECUTE ON FUNCTION public.generate_voucher_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_booking_number() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_default_staff_availability() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_loyalty_account() FROM anon, authenticated, PUBLIC;
-- Keep has_role / redeem_voucher / set_demo_role callable by authenticated users.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.redeem_voucher(text, integer, uuid, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_demo_role(app_role) FROM anon, PUBLIC;
