-- Trigger function to automatically set updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Bind updated_at trigger to new lookup and cache tables
CREATE OR REPLACE TRIGGER set_updated_at_subscription_plans BEFORE UPDATE ON public."SubscriptionPlan" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_owner_subscriptions BEFORE UPDATE ON public."OwnerSubscription" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_subscription_payments BEFORE UPDATE ON public."SubscriptionPayment" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_announcements BEFORE UPDATE ON public."Announcement" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_reviews BEFORE UPDATE ON public."Review" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_favorites BEFORE UPDATE ON public."Favorite" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_visitor_logs BEFORE UPDATE ON public."VisitorLog" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_staff BEFORE UPDATE ON public."Staff" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_maintenance_requests BEFORE UPDATE ON public."MaintenanceRequest" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_support_tickets BEFORE UPDATE ON public."SupportTicket" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ==================================================
-- SUPABASE AUTH SYNCHRONIZATION TRIGGER (Phase 2 & 4)
-- ==================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role public."UserRole";
BEGIN
  default_role := COALESCE(
    (new.raw_user_meta_data->>'role')::public."UserRole",
    'USER'::public."UserRole"
  );

  INSERT INTO public."User" (id, email, phone, role, status, first_name, last_name, updated_at)
  VALUES (
    new.id,
    new.email,
    new.phone,
    default_role,
    'ACTIVE'::public."UserStatus",
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    NOW()
  );

  IF default_role = 'OWNER'::public."UserRole" THEN
    INSERT INTO public."OwnerProfile" (id, user_id, verification_status, updated_at)
    VALUES (gen_random_uuid(), new.id, 'PENDING'::public."VerificationStatus", NOW());
  ELSIF default_role = 'MANAGER'::public."UserRole" THEN
    INSERT INTO public."ManagerProfile" (id, user_id, updated_at)
    VALUES (gen_random_uuid(), new.id, NOW());
  ELSIF default_role = 'USER'::public."UserRole" THEN
    INSERT INTO public."TenantProfile" (id, user_id, updated_at)
    VALUES (gen_random_uuid(), new.id, NOW());
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ==================================================
-- SOFT DELETE AUTOMATION TRIGGER (Phase 4 & 11)
-- ==================================================

CREATE OR REPLACE FUNCTION public.process_soft_delete()
RETURNS trigger AS $$
BEGIN
  IF new.is_deleted = true AND (old.is_deleted = false OR old.is_deleted IS NULL) THEN
    new.deleted_at := NOW();
    BEGIN
      new.deleted_by_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
      new.deleted_by_id := null;
    END;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Bind soft delete triggers to core tables
CREATE OR REPLACE TRIGGER soft_delete_user BEFORE UPDATE ON public."User" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_owner BEFORE UPDATE ON public."OwnerProfile" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_manager BEFORE UPDATE ON public."ManagerProfile" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_tenant BEFORE UPDATE ON public."TenantProfile" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_property BEFORE UPDATE ON public."Property" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_floor BEFORE UPDATE ON public."Floor" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_room BEFORE UPDATE ON public."Room" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_bed BEFORE UPDATE ON public."Bed" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_booking BEFORE UPDATE ON public."Booking" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_agreement BEFORE UPDATE ON public."RentalAgreement" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_invoice BEFORE UPDATE ON public."Invoice" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_payment BEFORE UPDATE ON public."Payment" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();
CREATE OR REPLACE TRIGGER soft_delete_complaint BEFORE UPDATE ON public."Complaint" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();


-- ==================================================
-- CENTRALIZED AUDIT LOGGING DATABASE TRIGGER (Phase 4)
-- ==================================================

CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS trigger AS $$
DECLARE
  v_action text;
  v_entity_id uuid;
  v_user_id uuid;
  v_old_json jsonb := null;
  v_new_json jsonb := null;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'INSERT';
    v_entity_id := new.id;
    v_new_json := to_jsonb(new);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_entity_id := new.id;
    v_old_json := to_jsonb(old);
    v_new_json := to_jsonb(new);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_entity_id := old.id;
    v_old_json := to_jsonb(old);
  END IF;

  -- Grab user uuid from Supabase jwt claim
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_user_id := null;
  END;

  INSERT INTO public."AuditLog" (
    id,
    user_id,
    action,
    entity_name,
    entity_id,
    old_values,
    new_values,
    ip_address,
    created_at,
    is_deleted
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_action,
    TG_TABLE_NAME,
    v_entity_id,
    v_old_json,
    v_new_json,
    inet_client_addr()::text,
    NOW(),
    false
  );

  IF TG_OP = 'DELETE' THEN
    RETURN old;
  ELSE
    RETURN new;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ==================================================
-- BUSINESS CONSTRAINT VALIDATIONS (Phase 7)
-- ==================================================

-- 1. Enforce Room capacity limits based on sharing type
CREATE OR REPLACE FUNCTION public.check_room_bed_capacity()
RETURNS trigger AS $$
DECLARE
  v_sharing_type public."SharingType";
  v_max_capacity integer;
  v_current_beds integer;
BEGIN
  SELECT r.sharing_type INTO v_sharing_type
  FROM public."Room" r
  WHERE r.id = new.room_id;

  CASE v_sharing_type
    WHEN 'SINGLE' THEN v_max_capacity := 1;
    WHEN 'DOUBLE' THEN v_max_capacity := 2;
    WHEN 'TRIPLE' THEN v_max_capacity := 3;
    WHEN 'FOUR_SHARING' THEN v_max_capacity := 4;
    ELSE v_max_capacity := 999;
  END CASE;

  SELECT COUNT(*) INTO v_current_beds
  FROM public."Bed" b
  WHERE b.room_id = new.room_id AND b.id <> COALESCE(new.id, '00000000-0000-0000-0000-000000000000'::uuid) AND b.is_deleted = false;

  IF v_current_beds >= v_max_capacity THEN
    RAISE EXCEPTION 'Room bed capacity limits reached for sharing type %', v_sharing_type;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER check_room_bed_capacity_trigger BEFORE INSERT OR UPDATE ON public."Bed" FOR EACH ROW EXECUTE FUNCTION public.check_room_bed_capacity();

-- 2. Enforce payment caps against invoice pending balance
CREATE OR REPLACE FUNCTION public.check_payment_invoice_balance()
RETURNS trigger AS $$
DECLARE
  v_invoice_amount numeric;
  v_paid_amount numeric;
  v_pending_balance numeric;
BEGIN
  IF new.invoice_id IS NULL THEN
    RETURN new;
  END IF;

  IF new.status <> 'SUCCESS'::public."PaymentStatus" THEN
    RETURN new;
  END IF;

  SELECT amount INTO v_invoice_amount
  FROM public."Invoice"
  WHERE id = new.invoice_id;

  SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount
  FROM public."Payment"
  WHERE invoice_id = new.invoice_id AND status = 'SUCCESS'::public."PaymentStatus" AND id <> COALESCE(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  v_pending_balance := v_invoice_amount - v_paid_amount;

  IF new.amount > v_pending_balance THEN
    RAISE EXCEPTION 'Payment amount % exceeds remaining invoice balance of %', new.amount, v_pending_balance;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER check_payment_invoice_balance_trigger BEFORE INSERT OR UPDATE ON public."Payment" FOR EACH ROW EXECUTE FUNCTION public.check_payment_invoice_balance();

-- 3. Enforce refund caps against security deposit amount
CREATE OR REPLACE FUNCTION public.check_refund_security_deposit_limit()
RETURNS trigger AS $$
DECLARE
  v_deposit_amount numeric;
  v_total_deductions_and_refund numeric;
BEGIN
  SELECT amount INTO v_deposit_amount
  FROM public."SecurityDeposit"
  WHERE id = new.security_deposit_id;

  v_total_deductions_and_refund := new.refund_amount + new.damage_deduction + new.cleaning_charges;

  IF v_total_deductions_and_refund > v_deposit_amount THEN
    RAISE EXCEPTION 'Total refund amount and charges % exceed original security deposit of %', v_total_deductions_and_refund, v_deposit_amount;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER check_refund_security_deposit_limit_trigger BEFORE INSERT OR UPDATE ON public."DepositRefund" FOR EACH ROW EXECUTE FUNCTION public.check_refund_security_deposit_limit();
