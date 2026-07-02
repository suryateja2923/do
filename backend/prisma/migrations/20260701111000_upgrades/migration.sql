-- CreateEnum
CREATE TYPE "SecurityDepositStatus" AS ENUM ('HELD', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FORFEITED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationQueueStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- DropIndex
DROP INDEX "Property_city_idx";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Bed" ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ComplaintComment" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ComplaintImage" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Floor" ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ManagerProfile" ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ManagerProperty" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OccupancyHistory" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OwnerDocument" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OwnerProfile" ADD COLUMN     "approval_notes" TEXT,
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" UUID,
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejected_by" UUID,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "verification_attempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PaymentReceipt" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProfileImage" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "approval_notes" TEXT,
ADD COLUMN     "approval_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" UUID,
ADD COLUMN     "area_id" UUID,
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejected_by" UUID,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PropertyImage" ADD COLUMN     "alt_text" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uploaded_by_id" UUID;

-- AlterTable
ALTER TABLE "RentalAgreement" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TenantDocument" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TenantProfile" ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Country" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" UUID NOT NULL,
    "state_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "zip_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyAmenity" (
    "property_id" UUID NOT NULL,
    "amenity_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "PropertyAmenity_pkey" PRIMARY KEY ("property_id","amenity_id")
);

-- CreateTable
CREATE TABLE "BedTransferHistory" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "old_bed_id" UUID,
    "old_room_id" UUID,
    "new_bed_id" UUID NOT NULL,
    "new_room_id" UUID NOT NULL,
    "transfer_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transfer_reason" TEXT,
    "transferred_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "BedTransferHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityDeposit" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "SecurityDepositStatus" NOT NULL DEFAULT 'HELD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "SecurityDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositRefund" (
    "id" UUID NOT NULL,
    "security_deposit_id" UUID NOT NULL,
    "refund_amount" DECIMAL(10,2) NOT NULL,
    "damage_deduction" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cleaning_charges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "refund_status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "refund_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "DepositRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationQueue" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationQueueStatus" NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "failure_reason" TEXT,
    "delivery_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "NotificationQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardSummary" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "occupied_beds" INTEGER NOT NULL DEFAULT 0,
    "vacant_beds" INTEGER NOT NULL DEFAULT 0,
    "monthly_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pending_rent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_tenants" INTEGER NOT NULL DEFAULT 0,
    "average_occupancy" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,

    CONSTRAINT "DashboardSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE INDEX "State_country_id_idx" ON "State"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "State_country_id_name_key" ON "State"("country_id", "name");

-- CreateIndex
CREATE INDEX "City_state_id_idx" ON "City"("state_id");

-- CreateIndex
CREATE UNIQUE INDEX "City_state_id_name_key" ON "City"("state_id", "name");

-- CreateIndex
CREATE INDEX "Area_city_id_idx" ON "Area"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "Area_city_id_name_key" ON "Area"("city_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");

-- CreateIndex
CREATE INDEX "Amenity_name_idx" ON "Amenity"("name");

-- CreateIndex
CREATE INDEX "PropertyAmenity_amenity_id_idx" ON "PropertyAmenity"("amenity_id");

-- CreateIndex
CREATE INDEX "BedTransferHistory_tenant_id_idx" ON "BedTransferHistory"("tenant_id");

-- CreateIndex
CREATE INDEX "BedTransferHistory_transfer_date_idx" ON "BedTransferHistory"("transfer_date");

-- CreateIndex
CREATE INDEX "SecurityDeposit_booking_id_idx" ON "SecurityDeposit"("booking_id");

-- CreateIndex
CREATE INDEX "SecurityDeposit_tenant_id_idx" ON "SecurityDeposit"("tenant_id");

-- CreateIndex
CREATE INDEX "DepositRefund_security_deposit_id_idx" ON "DepositRefund"("security_deposit_id");

-- CreateIndex
CREATE INDEX "NotificationQueue_user_id_idx" ON "NotificationQueue"("user_id");

-- CreateIndex
CREATE INDEX "NotificationQueue_status_idx" ON "NotificationQueue"("status");

-- CreateIndex
CREATE INDEX "NotificationQueue_created_at_idx" ON "NotificationQueue"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardSummary_property_id_key" ON "DashboardSummary"("property_id");

-- CreateIndex
CREATE INDEX "DashboardSummary_property_id_idx" ON "DashboardSummary"("property_id");

-- CreateIndex
CREATE INDEX "Property_area_id_idx" ON "Property"("area_id");

-- AddForeignKey
ALTER TABLE "OwnerProfile" ADD CONSTRAINT "OwnerProfile_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerProfile" ADD CONSTRAINT "OwnerProfile_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyAmenity" ADD CONSTRAINT "PropertyAmenity_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyAmenity" ADD CONSTRAINT "PropertyAmenity_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedTransferHistory" ADD CONSTRAINT "BedTransferHistory_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedTransferHistory" ADD CONSTRAINT "BedTransferHistory_old_bed_id_fkey" FOREIGN KEY ("old_bed_id") REFERENCES "Bed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedTransferHistory" ADD CONSTRAINT "BedTransferHistory_old_room_id_fkey" FOREIGN KEY ("old_room_id") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedTransferHistory" ADD CONSTRAINT "BedTransferHistory_new_bed_id_fkey" FOREIGN KEY ("new_bed_id") REFERENCES "Bed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedTransferHistory" ADD CONSTRAINT "BedTransferHistory_new_room_id_fkey" FOREIGN KEY ("new_room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedTransferHistory" ADD CONSTRAINT "BedTransferHistory_transferred_by_id_fkey" FOREIGN KEY ("transferred_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositRefund" ADD CONSTRAINT "DepositRefund_security_deposit_id_fkey" FOREIGN KEY ("security_deposit_id") REFERENCES "SecurityDeposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationQueue" ADD CONSTRAINT "NotificationQueue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardSummary" ADD CONSTRAINT "DashboardSummary_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ==================================================
-- UPGRADE RLS POLICIES FOR LOOKUPS AND NEW TABLES
-- ==================================================

ALTER TABLE public."Country" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."State" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."City" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Area" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Amenity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PropertyAmenity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BedTransferHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SecurityDeposit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DepositRefund" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."NotificationQueue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DashboardSummary" ENABLE ROW LEVEL SECURITY;

-- Select policies for lookup tables
CREATE POLICY "Anyone authenticated can read countries" ON public."Country" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can read states" ON public."State" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can read cities" ON public."City" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can read areas" ON public."Area" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can read amenities" ON public."Amenity" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can read property amenities" ON public."PropertyAmenity" FOR SELECT TO authenticated USING (true);

-- Admin manage policies for lookup tables
CREATE POLICY "Admins can manage countries" ON public."Country" FOR ALL TO authenticated USING (public.current_user_is_admin());
CREATE POLICY "Admins can manage states" ON public."State" FOR ALL TO authenticated USING (public.current_user_is_admin());
CREATE POLICY "Admins can manage cities" ON public."City" FOR ALL TO authenticated USING (public.current_user_is_admin());
CREATE POLICY "Admins can manage areas" ON public."Area" FOR ALL TO authenticated USING (public.current_user_is_admin());
CREATE POLICY "Admins can manage amenities" ON public."Amenity" FOR ALL TO authenticated USING (public.current_user_is_admin());
CREATE POLICY "Owners and admins can manage property amenities" ON public."PropertyAmenity" FOR ALL TO authenticated USING (
  public.owner_owns_property(auth.uid(), property_id) OR public.current_user_is_admin()
);

-- BedTransferHistory policies
CREATE POLICY "Relevant users can view bed transfers" ON public."BedTransferHistory" FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public."Bed" b
    JOIN public."Room" r ON b.room_id = r.id
    JOIN public."Floor" f ON r.floor_id = f.id
    WHERE b.id = new_bed_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
  )
  OR public.current_user_is_admin()
);

CREATE POLICY "Owners and managers can log bed transfers" ON public."BedTransferHistory" FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Bed" b
    JOIN public."Room" r ON b.room_id = r.id
    JOIN public."Floor" f ON r.floor_id = f.id
    WHERE b.id = new_bed_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
  )
  OR public.current_user_is_admin()
);

-- Security deposits and refunds policies
CREATE POLICY "Tenants and owners/managers can view security deposits" ON public."SecurityDeposit" FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public."Booking" bk
    JOIN public."Bed" b ON bk.bed_id = b.id
    JOIN public."Room" r ON b.room_id = r.id
    JOIN public."Floor" f ON r.floor_id = f.id
    WHERE bk.id = booking_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
  )
  OR public.current_user_is_admin()
);

CREATE POLICY "Owners and admins can manage security deposits" ON public."SecurityDeposit" FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public."Booking" bk
    JOIN public."Bed" b ON bk.bed_id = b.id
    JOIN public."Room" r ON b.room_id = r.id
    JOIN public."Floor" f ON r.floor_id = f.id
    WHERE bk.id = booking_id AND public.owner_owns_property(auth.uid(), f.property_id)
  )
  OR public.current_user_is_admin()
);

CREATE POLICY "Tenants and owners/managers can view refunds" ON public."DepositRefund" FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public."SecurityDeposit" sd
    WHERE sd.id = security_deposit_id AND (
      EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = sd.tenant_id AND t.user_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public."Booking" bk
        JOIN public."Bed" b ON bk.bed_id = b.id
        JOIN public."Room" r ON b.room_id = r.id
        JOIN public."Floor" f ON r.floor_id = f.id
        WHERE bk.id = sd.booking_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
      )
    )
  )
  OR public.current_user_is_admin()
);

CREATE POLICY "Owners and admins can manage deposit refunds" ON public."DepositRefund" FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public."SecurityDeposit" sd
    JOIN public."Booking" bk ON sd.booking_id = bk.id
    JOIN public."Bed" b ON bk.bed_id = b.id
    JOIN public."Room" r ON b.room_id = r.id
    JOIN public."Floor" f ON r.floor_id = f.id
    WHERE sd.id = security_deposit_id AND public.owner_owns_property(auth.uid(), f.property_id)
  )
  OR public.current_user_is_admin()
);

-- NotificationQueue policies
CREATE POLICY "Users can view their own notification queue" ON public."NotificationQueue" FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR public.current_user_is_admin()
);

CREATE POLICY "Admins can manage notification queue" ON public."NotificationQueue" FOR ALL TO authenticated USING (
  public.current_user_is_admin()
);

-- DashboardSummary policies
CREATE POLICY "Owners, managers, and admins can view dashboard summary" ON public."DashboardSummary" FOR SELECT TO authenticated USING (
  public.owner_owns_property(auth.uid(), property_id)
  OR public.manager_manages_property(auth.uid(), property_id)
  OR public.current_user_is_admin()
);

CREATE POLICY "Admins can manage dashboard summary" ON public."DashboardSummary" FOR ALL TO authenticated USING (
  public.current_user_is_admin()
);


-- ==================================================
-- UPGRADE SQL FUNCTIONS
-- ==================================================

-- Resolves the current user's role from public schema
CREATE OR REPLACE FUNCTION public.get_current_user_role(p_user_id uuid)
RETURNS public."UserRole" AS $$
  SELECT role FROM public."User" WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==================================================
-- UPGRADE TRIGGERS DEFINITIONS
-- ==================================================

-- Re-usable set_updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Bind set_updated_at to new lookup and cache tables
CREATE OR REPLACE TRIGGER set_updated_at_countries BEFORE UPDATE ON public."Country" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_states BEFORE UPDATE ON public."State" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_cities BEFORE UPDATE ON public."City" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_areas BEFORE UPDATE ON public."Area" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_amenities BEFORE UPDATE ON public."Amenity" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_property_amenities BEFORE UPDATE ON public."PropertyAmenity" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_bed_transfers BEFORE UPDATE ON public."BedTransferHistory" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_security_deposits BEFORE UPDATE ON public."SecurityDeposit" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_deposit_refunds BEFORE UPDATE ON public."DepositRefund" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_notification_queue BEFORE UPDATE ON public."NotificationQueue" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_dashboard_summaries BEFORE UPDATE ON public."DashboardSummary" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ==================================================
-- CENTRALIZED AUDIT LOGGING DATABASE TRIGGER
-- ==================================================

-- Process and insert mutation logs into AuditLog table automatically
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind audit logs to primary business tables
CREATE OR REPLACE TRIGGER audit_log_property AFTER INSERT OR UPDATE OR DELETE ON public."Property" FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE OR REPLACE TRIGGER audit_log_booking AFTER INSERT OR UPDATE OR DELETE ON public."Booking" FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE OR REPLACE TRIGGER audit_log_invoice AFTER INSERT OR UPDATE OR DELETE ON public."Invoice" FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE OR REPLACE TRIGGER audit_log_payment AFTER INSERT OR UPDATE OR DELETE ON public."Payment" FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE OR REPLACE TRIGGER audit_log_complaint AFTER INSERT OR UPDATE OR DELETE ON public."Complaint" FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
