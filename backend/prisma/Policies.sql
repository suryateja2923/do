-- ==================================================
-- ROW LEVEL SECURITY POLICIES (Phase 5)
-- ==================================================

-- Enable RLS on new models
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
  property_id IS NULL -- Global notices
  OR public.get_current_user_role(auth.uid()) = 'ADMIN'::public."UserRole"
  -- If Tenant is checked into a room/bed in this property
  OR EXISTS (
    SELECT 1 FROM public."TenantProfile" tp
    JOIN public."Bed" b ON b.tenant_id = tp.id
    JOIN public."Room" r ON b.room_id = r.id
    JOIN public."Floor" f ON r.floor_id = f.id
    WHERE tp.user_id = auth.uid() AND f.property_id = "Announcement".property_id
  )
  -- If Owner or Manager of property
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
  -- Or if assigned to this staff member
  OR EXISTS (
    SELECT 1 FROM public."Staff" s
    JOIN public."User" u ON s.phone = u.phone
    WHERE s.id = staff_id AND u.id = auth.uid()
  )
  -- Or if linked to a complaint filed by this tenant
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
