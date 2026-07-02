-- ==================================================
-- INDEX AND CONSTRAINT OPTIMIZATIONS (Phase 7 & 9)
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
