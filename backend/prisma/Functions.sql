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
