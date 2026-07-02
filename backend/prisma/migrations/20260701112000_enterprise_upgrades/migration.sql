-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('HOUSEKEEPER', 'COOK', 'SECURITY_GUARD', 'MAINTENANCE_TECH', 'WASH_STAFF', 'OTHER');

-- AlterTable
ALTER TABLE "PropertyImage" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "interval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
    "max_properties" INTEGER NOT NULL DEFAULT 1,
    "max_rooms" INTEGER NOT NULL DEFAULT 10,
    "max_beds" INTEGER NOT NULL DEFAULT 20,
    "max_managers" INTEGER NOT NULL DEFAULT 1,
    "features" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerSubscription" (
    "id" UUID NOT NULL,
    "owner_profile_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "OwnerSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "transaction_id" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "property_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "tenant_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("tenant_id","property_id")
);

-- CreateTable
CREATE TABLE "VisitorLog" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "visitor_name" TEXT NOT NULL,
    "visitor_phone" TEXT,
    "relationship" TEXT,
    "entry_time" TIMESTAMP(3) NOT NULL,
    "exit_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "VisitorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "StaffRole" NOT NULL DEFAULT 'HOUSEKEEPER',
    "salary" DECIMAL(10,2),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "staff_id" UUID,
    "complaint_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimated_cost" DECIMAL(10,2),
    "actual_cost" DECIMAL(10,2),
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "ComplaintPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_name_idx" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE INDEX "OwnerSubscription_owner_profile_id_idx" ON "OwnerSubscription"("owner_profile_id");

-- CreateIndex
CREATE INDEX "OwnerSubscription_plan_id_idx" ON "OwnerSubscription"("plan_id");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_subscription_id_idx" ON "SubscriptionPayment"("subscription_id");

-- CreateIndex
CREATE INDEX "Announcement_property_id_idx" ON "Announcement"("property_id");

-- CreateIndex
CREATE INDEX "Announcement_created_by_id_idx" ON "Announcement"("created_by_id");

-- CreateIndex
CREATE INDEX "Review_tenant_id_idx" ON "Review"("tenant_id");

-- CreateIndex
CREATE INDEX "Review_property_id_idx" ON "Review"("property_id");

-- CreateIndex
CREATE INDEX "Favorite_property_id_idx" ON "Favorite"("property_id");

-- CreateIndex
CREATE INDEX "VisitorLog_tenant_id_idx" ON "VisitorLog"("tenant_id");

-- CreateIndex
CREATE INDEX "VisitorLog_property_id_idx" ON "VisitorLog"("property_id");

-- CreateIndex
CREATE INDEX "Staff_property_id_idx" ON "Staff"("property_id");

-- CreateIndex
CREATE INDEX "Staff_role_idx" ON "Staff"("role");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_property_id_idx" ON "MaintenanceRequest"("property_id");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_staff_id_idx" ON "MaintenanceRequest"("staff_id");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_complaint_id_idx" ON "MaintenanceRequest"("complaint_id");

-- CreateIndex
CREATE INDEX "SupportTicket_user_id_idx" ON "SupportTicket"("user_id");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SearchHistory_user_id_idx" ON "SearchHistory"("user_id");

-- CreateIndex
CREATE INDEX "ActivityLog_user_id_idx" ON "ActivityLog"("user_id");

-- CreateIndex
CREATE INDEX "ActivityLog_created_at_idx" ON "ActivityLog"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_tenant_id_key" ON "Bed"("tenant_id");

-- CreateIndex
CREATE INDEX "TenantProfile_user_id_idx" ON "TenantProfile"("user_id");

-- AddForeignKey
ALTER TABLE "OwnerSubscription" ADD CONSTRAINT "OwnerSubscription_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "OwnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerSubscription" ADD CONSTRAINT "OwnerSubscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "OwnerSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorLog" ADD CONSTRAINT "VisitorLog_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorLog" ADD CONSTRAINT "VisitorLog_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ==================================================
-- ENTERPRISE SQL FUNCTIONS DEFINITIONS
-- ==================================================

-- Resolves the current user's role from public schema
CREATE OR REPLACE FUNCTION public.get_current_user_role(p_user_id uuid)
RETURNS public."UserRole" AS $$
  SELECT role FROM public."User" WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Returns true if user is owner of property
CREATE OR REPLACE FUNCTION public.is_owner_of_property(owner_user_id uuid, property_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."Property" p
    JOIN public."OwnerProfile" o ON p.owner_id = o.id
    WHERE o.user_id = is_owner_of_property.owner_user_id AND p.id = is_owner_of_property.property_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Returns true if user is manager of property
CREATE OR REPLACE FUNCTION public.is_manager_of_property(manager_user_id uuid, property_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."ManagerProperty" mp
    JOIN public."ManagerProfile" m ON mp.manager_id = m.id
    WHERE m.user_id = is_manager_of_property.manager_user_id AND mp.property_id = is_manager_of_property.property_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Returns true if user is admin, owner, or manager of property
CREATE OR REPLACE FUNCTION public.can_manage_property(user_id uuid, property_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    public.get_current_user_role(user_id) = 'ADMIN'::public."UserRole"
    OR public.is_owner_of_property(user_id, property_id)
    OR public.is_manager_of_property(user_id, property_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Returns true if user can access booking
CREATE OR REPLACE FUNCTION public.can_access_booking(user_id uuid, booking_id uuid)
RETURNS boolean AS $$
DECLARE
  v_role public."UserRole";
  v_tenant_user_id uuid;
  v_property_id uuid;
BEGIN
  v_role := public.get_current_user_role(user_id);
  IF v_role = 'ADMIN'::public."UserRole" THEN
    RETURN true;
  END IF;

  -- Get tenant's user_id and property_id
  SELECT tp.user_id, f.property_id INTO v_tenant_user_id, v_property_id
  FROM public."Booking" b
  JOIN public."TenantProfile" tp ON b.tenant_id = tp.id
  JOIN public."Bed" bd ON b.bed_id = bd.id
  JOIN public."Room" r ON bd.room_id = r.id
  JOIN public."Floor" f ON r.floor_id = f.id
  WHERE b.id = booking_id;

  IF v_tenant_user_id = user_id THEN
    RETURN true;
  END IF;

  IF public.is_owner_of_property(user_id, v_property_id) OR public.is_manager_of_property(user_id, v_property_id) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Returns true if user can access payment
CREATE OR REPLACE FUNCTION public.can_access_payment(user_id uuid, payment_id uuid)
RETURNS boolean AS $$
DECLARE
  v_role public."UserRole";
  v_tenant_user_id uuid;
  v_invoice_id uuid;
  v_property_id uuid;
BEGIN
  v_role := public.get_current_user_role(user_id);
  IF v_role = 'ADMIN'::public."UserRole" THEN
    RETURN true;
  END IF;

  SELECT tp.user_id, p.invoice_id INTO v_tenant_user_id, v_invoice_id
  FROM public."Payment" p
  JOIN public."TenantProfile" tp ON p.tenant_id = tp.id
  WHERE p.id = payment_id;

  IF v_tenant_user_id = user_id THEN
    RETURN true;
  END IF;

  IF v_invoice_id IS NOT NULL THEN
    SELECT f.property_id INTO v_property_id
    FROM public."Invoice" i
    JOIN public."Booking" b ON i.booking_id = b.id
    JOIN public."Bed" bd ON b.bed_id = bd.id
    JOIN public."Room" r ON bd.room_id = r.id
    JOIN public."Floor" f ON r.floor_id = f.id
    WHERE i.id = v_invoice_id;

    IF public.is_owner_of_property(user_id, v_property_id) OR public.is_manager_of_property(user_id, v_property_id) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Returns property IDs owned by owner
CREATE OR REPLACE FUNCTION public.get_owner_properties(p_owner_user_id uuid)
RETURNS TABLE (property_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id 
  FROM public."Property" p
  JOIN public."OwnerProfile" o ON p.owner_id = o.id
  WHERE o.user_id = p_owner_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Returns manager details for property
CREATE OR REPLACE FUNCTION public.get_property_manager(p_property_id uuid)
RETURNS TABLE (manager_id uuid, user_id uuid, first_name text, last_name text, email text) AS $$
BEGIN
  RETURN QUERY
  SELECT mp.manager_id, u.id, u.first_name::text, u.last_name::text, u.email::text
  FROM public."ManagerProperty" mp
  JOIN public."ManagerProfile" m ON mp.manager_id = m.id
  JOIN public."User" u ON m.user_id = u.id
  WHERE mp.property_id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Gets aggregated dashboard summary
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_property_id uuid)
RETURNS TABLE (
  occupied_beds integer,
  vacant_beds integer,
  monthly_revenue numeric,
  pending_rent numeric,
  total_tenants integer,
  average_occupancy double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.occupied_beds,
    d.vacant_beds,
    d.monthly_revenue::numeric,
    d.pending_rent::numeric,
    d.total_tenants,
    d.average_occupancy
  FROM public."DashboardSummary" d
  WHERE d.property_id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ==================================================
-- ENTERPRISE SQL TRIGGERS DEFINITIONS
-- ==================================================

-- Re-usable set_updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Bind updated_at trigger to new MVP tables
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

-- Supabase auth sync function (re-registration support / schema definer bypass)
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

-- Reusable Soft Delete Metadata Automator Trigger Function
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
-- STRICT BUSINESS RULES VALIDATIONS (Phase 7)
-- ==================================================

-- 1. Room capacity limits trigger
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

-- 2. Payment caps against invoice balance trigger
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

-- 3. Refund caps against security deposit amount trigger
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


-- ==================================================
-- ENTERPRISE ROW LEVEL SECURITY POLICIES (Phase 5)
-- ==================================================

ALTER TABLE public."SubscriptionPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OwnerSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SubscriptionPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VisitorLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MaintenanceRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SupportTicket" ENABLE ROW LEVEL SECURITY;

-- 1. SubscriptionPlan Policies
CREATE POLICY "Anyone authenticated can read subscription plans" ON public."SubscriptionPlan" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage subscription plans" ON public."SubscriptionPlan" FOR ALL TO authenticated USING (public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole");

-- 2. OwnerSubscription Policies
CREATE POLICY "Owners can view their own subscriptions" ON public."OwnerSubscription" FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public."OwnerProfile" o
    WHERE o.id = owner_profile_id AND o.user_id = auth.uid()
  )
  OR public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole"
);
CREATE POLICY "Admins can manage owner subscriptions" ON public."OwnerSubscription" FOR ALL TO authenticated USING (public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole");

-- 3. SubscriptionPayment Policies
CREATE POLICY "Owners can view their own subscription payments" ON public."SubscriptionPayment" FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public."OwnerSubscription" os
    JOIN public."OwnerProfile" o ON os.owner_profile_id = o.id
    WHERE os.id = subscription_id AND o.user_id = auth.uid()
  )
  OR public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole"
);
CREATE POLICY "Admins can manage subscription payments" ON public."SubscriptionPayment" FOR ALL TO authenticated USING (public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole");

-- 4. Announcement Policies
CREATE POLICY "Users can view relevant announcements" ON public."Announcement" FOR SELECT TO authenticated USING (
  property_id IS NULL
  OR public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole"
  OR EXISTS (
    SELECT 1 FROM public."TenantProfile" tp
    JOIN public."Bed" b ON b.tenant_id = tp.id
    JOIN public."Room" r ON b.room_id = r.id
    JOIN public."Floor" f ON r.floor_id = f.id
    WHERE tp.user_id = auth.uid() AND f.property_id = "Announcement".property_id
  )
  OR public.can_manage_property(auth.uid(), property_id)
);
CREATE POLICY "Owners and managers can manage announcements" ON public."Announcement" FOR ALL TO authenticated USING (
  public.can_manage_property(auth.uid(), property_id)
);

-- 5. Review Policies
CREATE POLICY "Anyone authenticated can view reviews" ON public."Review" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tenants can manage their own reviews" ON public."Review" FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public."TenantProfile" tp
    WHERE tp.id = tenant_id AND tp.user_id = auth.uid()
  )
  OR public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole"
);

-- 6. Favorite Policies
CREATE POLICY "Tenants can manage their own favorites" ON public."Favorite" FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public."TenantProfile" tp
    WHERE tp.id = tenant_id AND tp.user_id = auth.uid()
  )
  OR public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole"
);

-- 7. VisitorLog Policies
CREATE POLICY "Relevant users can view visitor logs" ON public."VisitorLog" FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public."TenantProfile" tp
    WHERE tp.id = tenant_id AND tp.user_id = auth.uid()
  )
  OR public.can_manage_property(auth.uid(), property_id)
);
CREATE POLICY "Tenants and owners/managers can create visitor logs" ON public."VisitorLog" FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."TenantProfile" tp
    WHERE tp.id = tenant_id AND tp.user_id = auth.uid()
  )
  OR public.can_manage_property(auth.uid(), property_id)
);
CREATE POLICY "Owners and managers can update visitor logs" ON public."VisitorLog" FOR UPDATE TO authenticated USING (
  public.can_manage_property(auth.uid(), property_id)
);

-- 8. Staff Policies
CREATE POLICY "Owners and managers can view property staff" ON public."Staff" FOR SELECT TO authenticated USING (
  public.can_manage_property(auth.uid(), property_id)
);
CREATE POLICY "Owners can manage staff" ON public."Staff" FOR ALL TO authenticated USING (
  public.is_owner_of_property(auth.uid(), property_id)
  OR public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole"
);

-- 9. MaintenanceRequest Policies
CREATE POLICY "Relevant users can view maintenance requests" ON public."MaintenanceRequest" FOR SELECT TO authenticated USING (
  public.can_manage_property(auth.uid(), property_id)
  OR EXISTS (
    SELECT 1 FROM public."Staff" s
    JOIN public."User" u ON s.phone = u.phone
    WHERE s.id = staff_id AND u.id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public."Complaint" c
    JOIN public."TenantProfile" tp ON c.tenant_id = tp.id
    WHERE c.id = complaint_id AND tp.user_id = auth.uid()
  )
);
CREATE POLICY "Owners and managers can manage maintenance requests" ON public."MaintenanceRequest" FOR ALL TO authenticated USING (
  public.can_manage_property(auth.uid(), property_id)
);

-- 10. SupportTicket Policies
CREATE POLICY "Users can manage their own support tickets" ON public."SupportTicket" FOR ALL TO authenticated USING (
  user_id = auth.uid()
  OR public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole"
);


-- ==================================================
-- ENTERPRISE INDEX OPTIMIZATIONS (Phase 9)
-- ==================================================

-- 1. Partial Unique Index: Exclude duplicate active bookings per tenant
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_booking 
ON public."Booking" (tenant_id) 
WHERE status IN ('PENDING'::public."BookingStatus", 'APPROVED'::public."BookingStatus", 'MOVE_IN'::public."BookingStatus")
AND is_deleted = false;

-- 2. Partial Unique Index: Exclude duplicate active rental agreements per tenant
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_agreement 
ON public."RentalAgreement" (tenant_profile_id) 
WHERE status = 'ACTIVE'::public."AgreementStatus"
AND is_deleted = false;

-- 3. Composite Performance Indexes
CREATE INDEX IF NOT EXISTS idx_booking_tenant_status ON public."Booking" (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_owner_subscription_status ON public."OwnerSubscription" (status);
CREATE INDEX IF NOT EXISTS idx_subscription_payment_status ON public."SubscriptionPayment" (status);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_entry ON public."VisitorLog" (entry_time);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public."MaintenanceRequest" (status);
CREATE INDEX IF NOT EXISTS idx_staff_role_status ON public."Staff" (role, status);
CREATE INDEX IF NOT EXISTS idx_review_rating_property ON public."Review" (rating, property_id);
