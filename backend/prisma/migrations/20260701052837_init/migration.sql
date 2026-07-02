-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'OWNER', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('AC', 'NON_AC');

-- CreateEnum
CREATE TYPE "SharingType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING', 'OTHER');

-- CreateEnum
CREATE TYPE "BedOccupancyStatus" AS ENUM ('VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'MOVE_IN', 'MOVE_OUT');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "InvoiceItemType" AS ENUM ('RENT', 'SECURITY_DEPOSIT', 'BOOKING_AMOUNT', 'LATE_FEE', 'UTILITY', 'DAMAGE_CHARGE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'NET_BANKING', 'CASH', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('PLUMBING', 'ELECTRICAL', 'CLEANLINESS', 'INTERNET', 'FURNITURE', 'NOISE', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplaintPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_STATUS', 'PAYMENT_DUE', 'PAYMENT_SUCCESS', 'COMPLAINT_UPDATE', 'ANNOUNCEMENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "OwnerDocumentType" AS ENUM ('PAN_CARD', 'GSTIN', 'AADHAR_CARD', 'BUSINESS_LICENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "TenantDocumentType" AS ENUM ('AADHAR_CARD', 'PAN_CARD', 'VOTER_ID', 'PASSPORT', 'DRIVING_LICENSE', 'EMPLOYEE_ID', 'STUDENT_ID', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileImage" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerProfile" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" TEXT,
    "gst_number" TEXT,
    "pan_number" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "OwnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerDocument" (
    "id" UUID NOT NULL,
    "owner_profile_id" UUID NOT NULL,
    "type" "OwnerDocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerProfile" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "owner_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ManagerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantProfile" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "permanent_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "TenantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantDocument" (
    "id" UUID NOT NULL,
    "tenant_profile_id" UUID NOT NULL,
    "type" "TenantDocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "rules" TEXT,
    "amenities" TEXT[],
    "status" "PropertyStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerProperty" (
    "manager_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagerProperty_pkey" PRIMARY KEY ("manager_id","property_id")
);

-- CreateTable
CREATE TABLE "Floor" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "floor_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" UUID NOT NULL,
    "floor_id" UUID NOT NULL,
    "room_number" TEXT NOT NULL,
    "room_type" "RoomType" NOT NULL DEFAULT 'NON_AC',
    "sharing_type" "SharingType" NOT NULL DEFAULT 'SINGLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "bed_number" TEXT NOT NULL,
    "rent" DECIMAL(10,2) NOT NULL,
    "security_deposit" DECIMAL(10,2) NOT NULL,
    "occupancy_status" "BedOccupancyStatus" NOT NULL DEFAULT 'VACANT',
    "tenant_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "bed_id" UUID NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_move_in" TIMESTAMP(3) NOT NULL,
    "expected_move_out" TIMESTAMP(3),
    "actual_move_in" TIMESTAMP(3),
    "actual_move_out" TIMESTAMP(3),
    "booking_amount" DECIMAL(10,2) NOT NULL,
    "security_deposit" DECIMAL(10,2) NOT NULL,
    "rent" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalAgreement" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "tenant_profile_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "signed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "billing_period_start" TIMESTAMP(3),
    "billing_period_end" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "type" "InvoiceItemType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "invoice_id" UUID,
    "tenant_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "transaction_id" TEXT,
    "gateway_name" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceipt" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "room_id" UUID,
    "category" "ComplaintCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "ComplaintPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "assigned_to_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintComment" (
    "id" UUID NOT NULL,
    "complaint_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplaintComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintImage" (
    "id" UUID NOT NULL,
    "complaint_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplaintImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupancyHistory" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "bed_id" UUID NOT NULL,
    "move_in_date" TIMESTAMP(3) NOT NULL,
    "move_out_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OccupancyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileImage_user_id_key" ON "ProfileImage"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "OwnerProfile_user_id_key" ON "OwnerProfile"("user_id");

-- CreateIndex
CREATE INDEX "OwnerProfile_verification_status_idx" ON "OwnerProfile"("verification_status");

-- CreateIndex
CREATE INDEX "OwnerDocument_owner_profile_id_idx" ON "OwnerDocument"("owner_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerProfile_user_id_key" ON "ManagerProfile"("user_id");

-- CreateIndex
CREATE INDEX "ManagerProfile_owner_id_idx" ON "ManagerProfile"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "TenantProfile_user_id_key" ON "TenantProfile"("user_id");

-- CreateIndex
CREATE INDEX "TenantDocument_tenant_profile_id_idx" ON "TenantDocument"("tenant_profile_id");

-- CreateIndex
CREATE INDEX "Property_owner_id_idx" ON "Property"("owner_id");

-- CreateIndex
CREATE INDEX "Property_city_idx" ON "Property"("city");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "PropertyImage_property_id_idx" ON "PropertyImage"("property_id");

-- CreateIndex
CREATE INDEX "ManagerProperty_property_id_idx" ON "ManagerProperty"("property_id");

-- CreateIndex
CREATE INDEX "Floor_property_id_idx" ON "Floor"("property_id");

-- CreateIndex
CREATE INDEX "Floor_floor_number_idx" ON "Floor"("floor_number");

-- CreateIndex
CREATE INDEX "Room_floor_id_idx" ON "Room"("floor_id");

-- CreateIndex
CREATE INDEX "Room_room_type_idx" ON "Room"("room_type");

-- CreateIndex
CREATE INDEX "Room_sharing_type_idx" ON "Room"("sharing_type");

-- CreateIndex
CREATE INDEX "Bed_room_id_idx" ON "Bed"("room_id");

-- CreateIndex
CREATE INDEX "Bed_tenant_id_idx" ON "Bed"("tenant_id");

-- CreateIndex
CREATE INDEX "Bed_occupancy_status_idx" ON "Bed"("occupancy_status");

-- CreateIndex
CREATE INDEX "Booking_tenant_id_idx" ON "Booking"("tenant_id");

-- CreateIndex
CREATE INDEX "Booking_bed_id_idx" ON "Booking"("bed_id");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RentalAgreement_booking_id_key" ON "RentalAgreement"("booking_id");

-- CreateIndex
CREATE INDEX "RentalAgreement_tenant_profile_id_idx" ON "RentalAgreement"("tenant_profile_id");

-- CreateIndex
CREATE INDEX "Invoice_tenant_id_idx" ON "Invoice"("tenant_id");

-- CreateIndex
CREATE INDEX "Invoice_booking_id_idx" ON "Invoice"("booking_id");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_due_date_idx" ON "Invoice"("due_date");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoice_id_idx" ON "InvoiceItem"("invoice_id");

-- CreateIndex
CREATE INDEX "Payment_invoice_id_idx" ON "Payment"("invoice_id");

-- CreateIndex
CREATE INDEX "Payment_tenant_id_idx" ON "Payment"("tenant_id");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_payment_date_idx" ON "Payment"("payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceipt_payment_id_key" ON "PaymentReceipt"("payment_id");

-- CreateIndex
CREATE INDEX "Complaint_tenant_id_idx" ON "Complaint"("tenant_id");

-- CreateIndex
CREATE INDEX "Complaint_property_id_idx" ON "Complaint"("property_id");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_priority_idx" ON "Complaint"("priority");

-- CreateIndex
CREATE INDEX "ComplaintComment_complaint_id_idx" ON "ComplaintComment"("complaint_id");

-- CreateIndex
CREATE INDEX "ComplaintImage_complaint_id_idx" ON "ComplaintImage"("complaint_id");

-- CreateIndex
CREATE INDEX "Notification_user_id_idx" ON "Notification"("user_id");

-- CreateIndex
CREATE INDEX "Notification_is_read_idx" ON "Notification"("is_read");

-- CreateIndex
CREATE INDEX "OccupancyHistory_tenant_id_idx" ON "OccupancyHistory"("tenant_id");

-- CreateIndex
CREATE INDEX "OccupancyHistory_bed_id_idx" ON "OccupancyHistory"("bed_id");

-- CreateIndex
CREATE INDEX "AuditLog_entity_name_entity_id_idx" ON "AuditLog"("entity_name", "entity_id");

-- CreateIndex
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");

-- AddForeignKey
ALTER TABLE "ProfileImage" ADD CONSTRAINT "ProfileImage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerProfile" ADD CONSTRAINT "OwnerProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerDocument" ADD CONSTRAINT "OwnerDocument_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "OwnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagerProfile" ADD CONSTRAINT "ManagerProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagerProfile" ADD CONSTRAINT "ManagerProfile_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "OwnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantProfile" ADD CONSTRAINT "TenantProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantDocument" ADD CONSTRAINT "TenantDocument_tenant_profile_id_fkey" FOREIGN KEY ("tenant_profile_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "OwnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagerProperty" ADD CONSTRAINT "ManagerProperty_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "ManagerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagerProperty" ADD CONSTRAINT "ManagerProperty_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Floor" ADD CONSTRAINT "Floor_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "Floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "Bed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalAgreement" ADD CONSTRAINT "RentalAgreement_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalAgreement" ADD CONSTRAINT "RentalAgreement_tenant_profile_id_fkey" FOREIGN KEY ("tenant_profile_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "ManagerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintComment" ADD CONSTRAINT "ComplaintComment_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintComment" ADD CONSTRAINT "ComplaintComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintImage" ADD CONSTRAINT "ComplaintImage_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupancyHistory" ADD CONSTRAINT "OccupancyHistory_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "TenantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupancyHistory" ADD CONSTRAINT "OccupancyHistory_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "Bed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- ==========================================
-- CUSTOM SUPABASE AUTH SYNCRONIZATION TRIGGER
-- ==========================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function to automatically clean up public.User on auth.users deletion
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public."User" WHERE id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_user();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ==========================================

-- Check if authenticated user is Admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = auth.uid() AND role = 'ADMIN'::public."UserRole" AND status = 'ACTIVE'::public."UserStatus"
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if authenticated user is Owner
CREATE OR REPLACE FUNCTION public.current_user_is_owner()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = auth.uid() AND role = 'OWNER'::public."UserRole" AND status = 'ACTIVE'::public."UserStatus"
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if authenticated user is Manager
CREATE OR REPLACE FUNCTION public.current_user_is_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = auth.uid() AND role = 'MANAGER'::public."UserRole" AND status = 'ACTIVE'::public."UserStatus"
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if owner owns specific property
CREATE OR REPLACE FUNCTION public.owner_owns_property(owner_user_id uuid, property_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."Property" p
    JOIN public."OwnerProfile" o ON p.owner_id = o.id
    WHERE o.user_id = owner_owns_property.owner_user_id AND p.id = owner_owns_property.property_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if manager manages specific property
CREATE OR REPLACE FUNCTION public.manager_manages_property(manager_user_id uuid, property_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."ManagerProperty" mp
    JOIN public."ManagerProfile" m ON mp.manager_id = m.id
    WHERE m.user_id = manager_manages_property.manager_user_id AND mp.property_id = manager_manages_property.property_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==========================================

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProfileImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OwnerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OwnerDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ManagerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TenantProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TenantDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PropertyImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ManagerProperty" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Floor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Bed" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RentalAgreement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InvoiceItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PaymentReceipt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Complaint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ComplaintComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ComplaintImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OccupancyHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- ROW LEVEL SECURITY POLICIES DEFINITIONS
-- ==========================================

-- --- USER POLICIES ---
CREATE POLICY "Users can read own record or admin"
  ON public."User" FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.current_user_is_admin());

CREATE POLICY "Users can update own record or admin"
  ON public."User" FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.current_user_is_admin());

-- --- PROFILE IMAGE POLICIES ---
CREATE POLICY "Users can manage own profile image"
  ON public."ProfileImage" FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.current_user_is_admin());

-- --- OWNER PROFILE POLICIES ---
CREATE POLICY "Owners can manage own profile"
  ON public."OwnerProfile" FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.current_user_is_admin());

-- --- OWNER DOCUMENTS POLICIES ---
CREATE POLICY "Owners can manage own documents"
  ON public."OwnerDocument" FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."OwnerProfile" o WHERE o.id = owner_profile_id AND o.user_id = auth.uid())
    OR public.current_user_is_admin()
  );

-- --- MANAGER PROFILE POLICIES ---
CREATE POLICY "Managers can read own profile"
  ON public."ManagerProfile" FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR (public.current_user_is_owner() AND EXISTS (SELECT 1 FROM public."OwnerProfile" o WHERE o.id = owner_id AND o.user_id = auth.uid()))
    OR public.current_user_is_admin()
  );

-- --- TENANT PROFILE POLICIES ---
CREATE POLICY "Tenants can manage own profile"
  ON public."TenantProfile" FOR ALL TO authenticated
  USING (
    auth.uid() = user_id
    OR public.current_user_is_owner()
    OR public.current_user_is_manager()
    OR public.current_user_is_admin()
  );

-- --- TENANT DOCUMENTS POLICIES ---
CREATE POLICY "Tenants can manage own documents"
  ON public."TenantDocument" FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_profile_id AND t.user_id = auth.uid())
    OR public.current_user_is_admin()
  );

-- --- PROPERTY POLICIES ---
CREATE POLICY "Anyone authenticated can view properties"
  ON public."Property" FOR SELECT TO authenticated
  USING (status = 'ACTIVE'::public."PropertyStatus" OR public.current_user_is_owner() OR public.current_user_is_manager() OR public.current_user_is_admin());

CREATE POLICY "Owners can manage properties"
  ON public."Property" FOR ALL TO authenticated
  USING (
    (public.current_user_is_owner() AND EXISTS (SELECT 1 FROM public."OwnerProfile" o WHERE o.id = owner_id AND o.user_id = auth.uid()))
    OR public.current_user_is_admin()
  );

-- --- PROPERTY IMAGE POLICIES ---
CREATE POLICY "Anyone authenticated can view property images"
  ON public."PropertyImage" FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owners can manage property images"
  ON public."PropertyImage" FOR ALL TO authenticated
  USING (
    public.owner_owns_property(auth.uid(), property_id)
    OR public.current_user_is_admin()
  );

-- --- MANAGER PROPERTY POLICIES ---
CREATE POLICY "Managers and Owners can view property assignments"
  ON public."ManagerProperty" FOR SELECT TO authenticated
  USING (
    public.owner_owns_property(auth.uid(), property_id)
    OR public.manager_manages_property(auth.uid(), property_id)
    OR public.current_user_is_admin()
  );

CREATE POLICY "Owners can manage property assignments"
  ON public."ManagerProperty" FOR ALL TO authenticated
  USING (
    public.owner_owns_property(auth.uid(), property_id)
    OR public.current_user_is_admin()
  );

-- --- FLOOR POLICIES ---
CREATE POLICY "Anyone authenticated can view floors"
  ON public."Floor" FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owners can manage floors"
  ON public."Floor" FOR ALL TO authenticated
  USING (
    public.owner_owns_property(auth.uid(), property_id)
    OR public.current_user_is_admin()
  );

-- --- ROOM POLICIES ---
CREATE POLICY "Anyone authenticated can view rooms"
  ON public."Room" FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owners can manage rooms"
  ON public."Room" FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."Floor" f WHERE f.id = floor_id AND public.owner_owns_property(auth.uid(), f.property_id))
    OR public.current_user_is_admin()
  );

-- --- BED POLICIES ---
CREATE POLICY "Anyone authenticated can view beds"
  ON public."Bed" FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owners and managers can manage beds"
  ON public."Bed" FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Room" r 
      JOIN public."Floor" f ON r.floor_id = f.id 
      WHERE r.id = room_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
    )
    OR public.current_user_is_admin()
  );

-- --- BOOKING POLICIES ---
CREATE POLICY "Tenants and managers can view bookings"
  ON public."Booking" FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public."Bed" b
      JOIN public."Room" r ON b.room_id = r.id
      JOIN public."Floor" f ON r.floor_id = f.id
      WHERE b.id = bed_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
    )
    OR public.current_user_is_admin()
  );

CREATE POLICY "Tenants can request bookings"
  ON public."Booking" FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
    OR public.current_user_is_admin()
  );

CREATE POLICY "Tenants and owners/managers can update bookings"
  ON public."Booking" FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public."Bed" b
      JOIN public."Room" r ON b.room_id = r.id
      JOIN public."Floor" f ON r.floor_id = f.id
      WHERE b.id = bed_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
    )
    OR public.current_user_is_admin()
  );

-- --- RENTAL AGREEMENT POLICIES ---
CREATE POLICY "Tenants and owners can view rental agreements"
  ON public."RentalAgreement" FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_profile_id AND t.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public."Booking" bk
      JOIN public."Bed" b ON bk.bed_id = b.id
      JOIN public."Room" r ON b.room_id = r.id
      JOIN public."Floor" f ON r.floor_id = f.id
      WHERE bk.id = booking_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
    )
    OR public.current_user_is_admin()
  );

CREATE POLICY "Owners can manage rental agreements"
  ON public."RentalAgreement" FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Booking" bk
      JOIN public."Bed" b ON bk.bed_id = b.id
      JOIN public."Room" r ON b.room_id = r.id
      JOIN public."Floor" f ON r.floor_id = f.id
      WHERE bk.id = booking_id AND public.owner_owns_property(auth.uid(), f.property_id)
    )
    OR public.current_user_is_admin()
  );

-- --- INVOICE POLICIES ---
CREATE POLICY "Tenants and owners/managers can view invoices"
  ON public."Invoice" FOR SELECT TO authenticated
  USING (
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

CREATE POLICY "Owners can manage invoices"
  ON public."Invoice" FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Booking" bk
      JOIN public."Bed" b ON bk.bed_id = b.id
      JOIN public."Room" r ON b.room_id = r.id
      JOIN public."Floor" f ON r.floor_id = f.id
      WHERE bk.id = booking_id AND public.owner_owns_property(auth.uid(), f.property_id)
    )
    OR public.current_user_is_admin()
  );

-- --- INVOICE ITEM POLICIES ---
CREATE POLICY "Tenants and owners can read invoice items"
  ON public."InvoiceItem" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Invoice" inv
      WHERE inv.id = invoice_id AND (
        EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = inv.tenant_id AND t.user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM public."Booking" bk
          JOIN public."Bed" b ON bk.bed_id = b.id
          JOIN public."Room" r ON b.room_id = r.id
          JOIN public."Floor" f ON r.floor_id = f.id
          WHERE bk.id = inv.booking_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
        )
      )
    )
    OR public.current_user_is_admin()
  );

CREATE POLICY "Owners can manage invoice items"
  ON public."InvoiceItem" FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Invoice" inv
      JOIN public."Booking" bk ON inv.booking_id = bk.id
      JOIN public."Bed" b ON bk.bed_id = b.id
      JOIN public."Room" r ON b.room_id = r.id
      JOIN public."Floor" f ON r.floor_id = f.id
      WHERE inv.id = invoice_id AND public.owner_owns_property(auth.uid(), f.property_id)
    )
    OR public.current_user_is_admin()
  );

-- --- PAYMENT POLICIES ---
CREATE POLICY "Tenants and owners can view payments"
  ON public."Payment" FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public."Invoice" inv
      JOIN public."Booking" bk ON inv.booking_id = bk.id
      JOIN public."Bed" b ON bk.bed_id = b.id
      JOIN public."Room" r ON b.room_id = r.id
      JOIN public."Floor" f ON r.floor_id = f.id
      WHERE inv.id = invoice_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
    )
    OR public.current_user_is_admin()
  );

CREATE POLICY "Tenants can submit payments"
  ON public."Payment" FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
    OR public.current_user_is_admin()
  );

CREATE POLICY "Owners can update/confirm payments"
  ON public."Payment" FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Invoice" inv
      JOIN public."Booking" bk ON inv.booking_id = bk.id
      JOIN public."Bed" b ON bk.bed_id = b.id
      JOIN public."Room" r ON b.room_id = r.id
      JOIN public."Floor" f ON r.floor_id = f.id
      WHERE inv.id = invoice_id AND public.owner_owns_property(auth.uid(), f.property_id)
    )
    OR public.current_user_is_admin()
  );

-- --- PAYMENT RECEIPT POLICIES ---
CREATE POLICY "Tenants and owners can view payment receipts"
  ON public."PaymentReceipt" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Payment" p
      WHERE p.id = payment_id AND (
        EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = p.tenant_id AND t.user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM public."Invoice" inv
          JOIN public."Booking" bk ON inv.booking_id = bk.id
          JOIN public."Bed" b ON bk.bed_id = b.id
          JOIN public."Room" r ON b.room_id = r.id
          JOIN public."Floor" f ON r.floor_id = f.id
          WHERE inv.id = p.invoice_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
        )
      )
    )
    OR public.current_user_is_admin()
  );

-- --- COMPLAINT POLICIES ---
CREATE POLICY "Tenants, managers, owners can view complaints"
  ON public."Complaint" FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
    OR public.owner_owns_property(auth.uid(), property_id)
    OR public.manager_manages_property(auth.uid(), property_id)
    OR public.current_user_is_admin()
  );

CREATE POLICY "Tenants can file complaints"
  ON public."Complaint" FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
    OR public.current_user_is_admin()
  );

CREATE POLICY "Tenants and managers/owners can update complaints"
  ON public."Complaint" FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
    OR public.owner_owns_property(auth.uid(), property_id)
    OR public.manager_manages_property(auth.uid(), property_id)
    OR public.current_user_is_admin()
  );

-- --- COMPLAINT COMMENT POLICIES ---
CREATE POLICY "Relevant users can manage comments"
  ON public."ComplaintComment" FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Complaint" c
      WHERE c.id = complaint_id AND (
        EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = c.tenant_id AND t.user_id = auth.uid())
        OR public.owner_owns_property(auth.uid(), c.property_id)
        OR public.manager_manages_property(auth.uid(), c.property_id)
      )
    )
    OR public.current_user_is_admin()
  );

-- --- COMPLAINT IMAGE POLICIES ---
CREATE POLICY "Relevant users can view complaint images"
  ON public."ComplaintImage" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Complaint" c
      WHERE c.id = complaint_id AND (
        EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = c.tenant_id AND t.user_id = auth.uid())
        OR public.owner_owns_property(auth.uid(), c.property_id)
        OR public.manager_manages_property(auth.uid(), c.property_id)
      )
    )
    OR public.current_user_is_admin()
  );

CREATE POLICY "Tenants can upload complaint images"
  ON public."ComplaintImage" FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Complaint" c
      WHERE c.id = complaint_id AND EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = c.tenant_id AND t.user_id = auth.uid())
    )
    OR public.current_user_is_admin()
  );

-- --- NOTIFICATION POLICIES ---
CREATE POLICY "Users can manage own notifications"
  ON public."Notification" FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.current_user_is_admin());

-- --- OCCUPANCY HISTORY POLICIES ---
CREATE POLICY "Tenants, managers, owners can view occupancy history"
  ON public."OccupancyHistory" FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."TenantProfile" t WHERE t.id = tenant_id AND t.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public."Bed" b
      JOIN public."Room" r ON b.room_id = r.id
      JOIN public."Floor" f ON r.floor_id = f.id
      WHERE b.id = bed_id AND (public.owner_owns_property(auth.uid(), f.property_id) OR public.manager_manages_property(auth.uid(), f.property_id))
    )
    OR public.current_user_is_admin()
  );

-- --- AUDIT LOG POLICIES ---
CREATE POLICY "Admins can view audit logs"
  ON public."AuditLog" FOR SELECT TO authenticated
  USING (public.current_user_is_admin());
