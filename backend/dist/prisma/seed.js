"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- ENTERPRISE DATABASE SEEDING START ---');
    console.log('Clearing existing database tables...');
    // Clear tables in reverse dependency order
    await prisma.activityLog.deleteMany({});
    await prisma.searchHistory.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.maintenanceRequest.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.visitorLog.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.announcement.deleteMany({});
    await prisma.subscriptionPayment.deleteMany({});
    await prisma.ownerSubscription.deleteMany({});
    await prisma.subscriptionPlan.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.occupancyHistory.deleteMany({});
    await prisma.notificationQueue.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.complaintImage.deleteMany({});
    await prisma.complaintComment.deleteMany({});
    await prisma.complaint.deleteMany({});
    await prisma.paymentReceipt.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.depositRefund.deleteMany({});
    await prisma.securityDeposit.deleteMany({});
    await prisma.rentalAgreement.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.bedTransferHistory.deleteMany({});
    // Detach tenants to avoid cyclic constraints before deleting beds
    await prisma.bed.updateMany({ data: { tenant_id: null } });
    await prisma.bed.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.floor.deleteMany({});
    await prisma.managerProperty.deleteMany({});
    await prisma.propertyImage.deleteMany({});
    await prisma.dashboardSummary.deleteMany({});
    await prisma.propertyAmenity.deleteMany({});
    await prisma.amenity.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.area.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.state.deleteMany({});
    await prisma.country.deleteMany({});
    await prisma.tenantDocument.deleteMany({});
    await prisma.tenantProfile.deleteMany({});
    await prisma.managerProfile.deleteMany({});
    await prisma.ownerDocument.deleteMany({});
    await prisma.ownerProfile.deleteMany({});
    await prisma.profileImage.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✔ Existing data cleared.');
    // 1. Locations Seed
    console.log('Seeding countries, states, cities, and areas...');
    const country = await prisma.country.create({
        data: { id: (0, crypto_1.randomUUID)(), name: 'India', code: 'IN' }
    });
    const stateKA = await prisma.state.create({
        data: { id: (0, crypto_1.randomUUID)(), country_id: country.id, name: 'Karnataka', code: 'KA' }
    });
    const stateMH = await prisma.state.create({
        data: { id: (0, crypto_1.randomUUID)(), country_id: country.id, name: 'Maharashtra', code: 'MH' }
    });
    const cityBLR = await prisma.city.create({
        data: { id: (0, crypto_1.randomUUID)(), state_id: stateKA.id, name: 'Bengaluru' }
    });
    const cityMUM = await prisma.city.create({
        data: { id: (0, crypto_1.randomUUID)(), state_id: stateMH.id, name: 'Mumbai' }
    });
    const areas = [];
    const areaNames = ['HSR Layout', 'Koramangala', 'Indiranagar', 'Andheri West', 'Bandra West'];
    for (const name of areaNames) {
        const area = await prisma.area.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                city_id: name.includes('West') ? cityMUM.id : cityBLR.id,
                name,
                zip_code: Math.floor(100000 + Math.random() * 900000).toString()
            }
        });
        areas.push(area);
    }
    // 2. Subscription Plans
    console.log('Seeding subscription plans...');
    const freePlan = await prisma.subscriptionPlan.create({
        data: {
            name: 'Free Starter',
            description: 'Perfect for small single property PG owners',
            price: 0.00,
            interval: client_1.BillingInterval.MONTHLY,
            max_properties: 1,
            max_rooms: 10,
            max_beds: 30,
            max_managers: 1,
        }
    });
    const businessPlan = await prisma.subscriptionPlan.create({
        data: {
            name: 'Professional Business',
            description: 'Ideal for growing regional PG chains',
            price: 1999.00,
            interval: client_1.BillingInterval.MONTHLY,
            max_properties: 10,
            max_rooms: 150,
            max_beds: 500,
            max_managers: 5,
        }
    });
    const enterprisePlan = await prisma.subscriptionPlan.create({
        data: {
            name: 'Enterprise Pro',
            description: 'Uncapped access for national coliving chains',
            price: 9999.00,
            interval: client_1.BillingInterval.MONTHLY,
            max_properties: 100,
            max_rooms: 2000,
            max_beds: 8000,
            max_managers: 50,
        }
    });
    // 3. Amenities Seed
    console.log('Seeding standard amenities lookup...');
    const amenityList = ['WiFi', 'AC', 'Gym', 'Laundry', 'CCTV', 'Parking', 'Food', 'Power Backup'];
    const amenities = [];
    for (const name of amenityList) {
        const a = await prisma.amenity.create({
            data: { name, icon: `${name.toLowerCase().replace(' ', '-')}-icon` }
        });
        amenities.push(a);
    }
    // 4. Users Generation (2 Admins, 5 Managers, 50 Owners, 3000 Tenants)
    console.log('Generating users dataset in memory...');
    const adminUsers = [];
    const managerUsers = [];
    const ownerUsers = [];
    const tenantUsers = [];
    // Admins (2)
    for (let i = 1; i <= 2; i++) {
        adminUsers.push({
            id: (0, crypto_1.randomUUID)(),
            email: `admin${i}@homiepg.com`,
            phone: `+91900000000${i}`,
            first_name: `Admin`,
            last_name: `${i}`,
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
            password_hash: '$2b$04$FrzavrDi84XluwuBK9T52.kmSloli7oAlfYshApAiRRGCo1vDIseC', // password123
        });
    }
    // Managers (5)
    for (let i = 1; i <= 5; i++) {
        managerUsers.push({
            id: (0, crypto_1.randomUUID)(),
            email: `manager${i}@homiepg.com`,
            phone: `+91911111111${i}`,
            first_name: `Manager`,
            last_name: `${i}`,
            role: client_1.UserRole.MANAGER,
            status: client_1.UserStatus.ACTIVE,
            password_hash: '$2b$04$FrzavrDi84XluwuBK9T52.kmSloli7oAlfYshApAiRRGCo1vDIseC', // password123
        });
    }
    // Owners (50)
    for (let i = 1; i <= 50; i++) {
        ownerUsers.push({
            id: (0, crypto_1.randomUUID)(),
            email: `owner${i}@gmail.com`,
            phone: `+9192222222${i.toString().padStart(2, '0')}`,
            first_name: `Owner`,
            last_name: `${i}`,
            role: client_1.UserRole.OWNER,
            status: client_1.UserStatus.ACTIVE,
            password_hash: '$2b$04$FrzavrDi84XluwuBK9T52.kmSloli7oAlfYshApAiRRGCo1vDIseC', // password123
        });
    }
    // Tenants (3000)
    for (let i = 1; i <= 3000; i++) {
        tenantUsers.push({
            id: (0, crypto_1.randomUUID)(),
            email: `tenant${i}@gmail.com`,
            phone: `+91800000${i.toString().padStart(4, '0')}`,
            first_name: `Tenant`,
            last_name: `${i}`,
            role: client_1.UserRole.USER,
            status: client_1.UserStatus.ACTIVE,
            password_hash: '$2b$04$FrzavrDi84XluwuBK9T52.kmSloli7oAlfYshApAiRRGCo1vDIseC', // password123
        });
    }
    // Insert Users in batches to prevent query size issues
    console.log('Inserting users in batches...');
    const allUsers = [...adminUsers, ...managerUsers, ...ownerUsers, ...tenantUsers];
    const userBatchSize = 1000;
    for (let i = 0; i < allUsers.length; i += userBatchSize) {
        const batch = allUsers.slice(i, i + userBatchSize);
        await prisma.user.createMany({ data: batch });
    }
    // 5. Creating Profiles
    console.log('Seeding profiles...');
    // Owner Profiles
    const ownerProfiles = [];
    for (const user of ownerUsers) {
        ownerProfiles.push({
            id: (0, crypto_1.randomUUID)(),
            user_id: user.id,
            business_name: `${user.first_name} ${user.last_name} PG Accommodations`,
            verification_status: client_1.VerificationStatus.VERIFIED,
            approved_by: adminUsers[0].id,
            approved_at: new Date(),
            approval_notes: 'KYC verified automatically.',
            verification_attempts: 1
        });
    }
    await prisma.ownerProfile.createMany({ data: ownerProfiles });
    // Add subscriptions for owners
    console.log('Assigning subscriptions to owners...');
    const ownerSubscriptions = [];
    const fetchedOwnerProfiles = await prisma.ownerProfile.findMany({});
    for (const profile of fetchedOwnerProfiles) {
        ownerSubscriptions.push({
            id: (0, crypto_1.randomUUID)(),
            owner_profile_id: profile.id,
            plan_id: businessPlan.id,
            status: client_1.SubscriptionStatus.ACTIVE,
            start_date: new Date()
        });
    }
    await prisma.ownerSubscription.createMany({ data: ownerSubscriptions });
    // Manager Profiles
    const managerProfiles = [];
    for (let i = 0; i < managerUsers.length; i++) {
        managerProfiles.push({
            id: (0, crypto_1.randomUUID)(),
            user_id: managerUsers[i].id,
            owner_id: fetchedOwnerProfiles[i % fetchedOwnerProfiles.length].id
        });
    }
    await prisma.managerProfile.createMany({ data: managerProfiles });
    const fetchedManagerProfiles = await prisma.managerProfile.findMany({});
    // Tenant Profiles
    const tenantProfiles = [];
    for (const user of tenantUsers) {
        tenantProfiles.push({
            id: (0, crypto_1.randomUUID)(),
            user_id: user.id,
            emergency_contact_name: 'Emergency Guardian',
            emergency_contact_phone: '+919999999999',
            permanent_address: '123 Resident Road, India'
        });
    }
    const tenantBatchSize = 1000;
    for (let i = 0; i < tenantProfiles.length; i += tenantBatchSize) {
        const batch = tenantProfiles.slice(i, i + tenantBatchSize);
        await prisma.tenantProfile.createMany({ data: batch });
    }
    const fetchedTenantProfiles = await prisma.tenantProfile.findMany({});
    // 6. Seeding Properties (300)
    console.log('Generating 300 properties...');
    const properties = [];
    for (let i = 1; i <= 300; i++) {
        const ownerProfile = fetchedOwnerProfiles[i % fetchedOwnerProfiles.length];
        const area = areas[i % areas.length];
        properties.push({
            id: (0, crypto_1.randomUUID)(),
            owner_id: ownerProfile.id,
            name: `Homie PG Unit - ${i}`,
            address: `Street ${i}, Near Metro, ${area.name}`,
            zip_code: area.zip_code,
            status: client_1.PropertyStatus.ACTIVE,
            area_id: area.id,
            approval_status: client_1.VerificationStatus.VERIFIED,
            approved_by: adminUsers[0].id,
            approved_at: new Date()
        });
    }
    await prisma.property.createMany({ data: properties });
    const fetchedProperties = await prisma.property.findMany({});
    // Connect manager to properties
    const managerPropertyMappings = [];
    for (let i = 0; i < fetchedProperties.length; i++) {
        const manager = fetchedManagerProfiles[i % fetchedManagerProfiles.length];
        managerPropertyMappings.push({
            manager_id: manager.id,
            property_id: fetchedProperties[i].id
        });
    }
    await prisma.managerProperty.createMany({ data: managerPropertyMappings });
    // Map amenities to properties
    const propertyAmenityMappings = [];
    for (const prop of fetchedProperties) {
        propertyAmenityMappings.push({
            property_id: prop.id,
            amenity_id: amenities[0].id // Wifi
        });
        propertyAmenityMappings.push({
            property_id: prop.id,
            amenity_id: amenities[1].id // AC
        });
    }
    await prisma.propertyAmenity.createMany({ data: propertyAmenityMappings });
    // 7. Floor Layout & Rooms (1500 Rooms total, 5 rooms per property)
    console.log('Generating floors and 1500 rooms...');
    const floors = [];
    for (const prop of fetchedProperties) {
        floors.push({
            id: (0, crypto_1.randomUUID)(),
            property_id: prop.id,
            name: 'Ground Floor',
            floor_number: 0
        });
        floors.push({
            id: (0, crypto_1.randomUUID)(),
            property_id: prop.id,
            name: 'First Floor',
            floor_number: 1
        });
    }
    await prisma.floor.createMany({ data: floors });
    const fetchedFloors = await prisma.floor.findMany({});
    const rooms = [];
    let floorIndex = 0;
    for (const prop of fetchedProperties) {
        const propFloors = fetchedFloors.filter(f => f.property_id === prop.id);
        for (let r = 1; r <= 5; r++) {
            const targetFloor = propFloors[r % propFloors.length];
            rooms.push({
                id: (0, crypto_1.randomUUID)(),
                floor_id: targetFloor.id,
                room_number: `R-${100 + r}`,
                room_type: r % 2 === 0 ? client_1.RoomType.AC : client_1.RoomType.NON_AC,
                sharing_type: client_1.SharingType.FOUR_SHARING // 4 beds per room capacity
            });
        }
    }
    await prisma.room.createMany({ data: rooms });
    const fetchedRooms = await prisma.room.findMany({});
    // 8. Seeding Beds (6000 Beds total, 4 beds per room)
    console.log('Generating 6000 beds...');
    const beds = [];
    for (const room of fetchedRooms) {
        for (let b = 1; b <= 4; b++) {
            beds.push({
                id: (0, crypto_1.randomUUID)(),
                room_id: room.id,
                bed_number: `${room.room_number}-B${b}`,
                rent: 6000.00 + (b * 500),
                security_deposit: 6000.00 + (b * 500),
                occupancy_status: client_1.BedOccupancyStatus.VACANT
            });
        }
    }
    const bedBatchSize = 1000;
    for (let i = 0; i < beds.length; i += bedBatchSize) {
        const batch = beds.slice(i, i + bedBatchSize);
        await prisma.bed.createMany({ data: batch });
    }
    const fetchedBeds = await prisma.bed.findMany({});
    // 9. Bookings & Occupancy Allocation (5000 Bookings, occupying 3000 beds)
    console.log('Allocating check-ins & creating 5000 bookings...');
    const bookings = [];
    // 3000 active bookings (one per tenant, occupying 3000 beds)
    for (let i = 0; i < fetchedTenantProfiles.length; i++) {
        const tenant = fetchedTenantProfiles[i];
        const bed = fetchedBeds[i]; // Assign Bed 0 to 2999
        bookings.push({
            id: (0, crypto_1.randomUUID)(),
            tenant_id: tenant.id,
            bed_id: bed.id,
            booking_date: new Date('2026-01-01T00:00:00Z'),
            expected_move_in: new Date('2026-01-05T00:00:00Z'),
            actual_move_in: new Date('2026-01-05T12:00:00Z'),
            booking_amount: 1000.00,
            security_deposit: bed.security_deposit,
            rent: bed.rent,
            status: client_1.BookingStatus.MOVE_IN
        });
    }
    // 2000 historical completed bookings (for index testing)
    for (let i = 0; i < 2000; i++) {
        const tenant = fetchedTenantProfiles[i % fetchedTenantProfiles.length];
        const bed = fetchedBeds[3000 + i]; // Beds 3000 to 4999
        bookings.push({
            id: (0, crypto_1.randomUUID)(),
            tenant_id: tenant.id,
            bed_id: bed.id,
            booking_date: new Date('2025-06-01T00:00:00Z'),
            expected_move_in: new Date('2025-06-05T00:00:00Z'),
            actual_move_in: new Date('2025-06-05T12:00:00Z'),
            actual_move_out: new Date('2025-12-31T12:00:00Z'),
            booking_amount: 1000.00,
            security_deposit: bed.security_deposit,
            rent: bed.rent,
            status: client_1.BookingStatus.COMPLETED
        });
    }
    const bookingBatchSize = 1000;
    for (let i = 0; i < bookings.length; i += bookingBatchSize) {
        const batch = bookings.slice(i, i + bookingBatchSize);
        await prisma.booking.createMany({ data: batch });
    }
    const fetchedBookings = await prisma.booking.findMany({});
    // Associate occupied beds to their active tenant in the database to satisfy unique bed occupancy
    console.log('Updating bed active check-in mappings...');
    for (let i = 0; i < fetchedTenantProfiles.length; i++) {
        const tenant = fetchedTenantProfiles[i];
        const bed = fetchedBeds[i];
        await prisma.bed.update({
            where: { id: bed.id },
            data: {
                occupancy_status: client_1.BedOccupancyStatus.OCCUPIED,
                tenant_id: tenant.id
            }
        });
    }
    // 10. Rental Agreements
    console.log('Seeding rental agreements...');
    const agreements = [];
    const activeBookings = fetchedBookings.filter(b => b.status === client_1.BookingStatus.MOVE_IN);
    for (const b of activeBookings) {
        agreements.push({
            id: (0, crypto_1.randomUUID)(),
            booking_id: b.id,
            tenant_profile_id: b.tenant_id,
            url: `https://supabase.storage/documents/agreements/ag_${b.id}.pdf`,
            path: `agreements/ag_${b.id}.pdf`,
            status: client_1.AgreementStatus.ACTIVE,
            expires_at: new Date('2027-01-05T00:00:00Z')
        });
    }
    const agreementBatchSize = 1000;
    for (let i = 0; i < agreements.length; i += agreementBatchSize) {
        const batch = agreements.slice(i, i + agreementBatchSize);
        await prisma.rentalAgreement.createMany({ data: batch });
    }
    // 11. Security Deposits Ledger
    console.log('Seeding security deposits...');
    const securityDeposits = [];
    for (const b of activeBookings) {
        securityDeposits.push({
            id: (0, crypto_1.randomUUID)(),
            booking_id: b.id,
            tenant_id: b.tenant_id,
            amount: b.security_deposit,
            status: client_1.SecurityDepositStatus.HELD
        });
    }
    for (let i = 0; i < securityDeposits.length; i += bookingBatchSize) {
        const batch = securityDeposits.slice(i, i + bookingBatchSize);
        await prisma.securityDeposit.createMany({ data: batch });
    }
    const fetchedDeposits = await prisma.securityDeposit.findMany({});
    // 12. Invoices & 10000 Payments
    console.log('Generating 5000 invoices and 10000 payments...');
    const invoices = [];
    const payments = [];
    // 5000 Invoices total
    for (let i = 0; i < activeBookings.length; i++) {
        const b = activeBookings[i];
        invoices.push({
            id: (0, crypto_1.randomUUID)(),
            tenant_id: b.tenant_id,
            booking_id: b.id,
            title: 'Monthly Room Rent Invoice',
            amount: b.rent,
            due_date: new Date('2026-02-01T00:00:00Z'),
            status: client_1.InvoiceStatus.PAID
        });
    }
    // Add 2000 pro-rated invoices for completed bookings
    const completedBookings = fetchedBookings.filter(b => b.status === client_1.BookingStatus.COMPLETED);
    for (let i = 0; i < 2000; i++) {
        const b = completedBookings[i];
        invoices.push({
            id: (0, crypto_1.randomUUID)(),
            tenant_id: b.tenant_id,
            booking_id: b.id,
            title: 'Historical Rent Invoice',
            amount: b.rent,
            due_date: new Date('2025-07-01T00:00:00Z'),
            status: client_1.InvoiceStatus.PAID
        });
    }
    const invoiceBatchSize = 1000;
    for (let i = 0; i < invoices.length; i += invoiceBatchSize) {
        const batch = invoices.slice(i, i + invoiceBatchSize);
        await prisma.invoice.createMany({ data: batch });
    }
    const fetchedInvoices = await prisma.invoice.findMany({});
    // Generate 10000 Payments (2 payments per invoice to fully settle or pay double installments)
    for (let i = 0; i < fetchedInvoices.length; i++) {
        const inv = fetchedInvoices[i];
        const halfAmount = Number(inv.amount) / 2;
        payments.push({
            id: (0, crypto_1.randomUUID)(),
            invoice_id: inv.id,
            tenant_id: inv.tenant_id,
            amount: halfAmount,
            payment_method: client_1.PaymentMethod.UPI,
            transaction_id: `txn_${inv.id}_p1`,
            status: client_1.PaymentStatus.SUCCESS,
            payment_date: new Date()
        });
        payments.push({
            id: (0, crypto_1.randomUUID)(),
            invoice_id: inv.id,
            tenant_id: inv.tenant_id,
            amount: halfAmount,
            payment_method: client_1.PaymentMethod.CARD,
            transaction_id: `txn_${inv.id}_p2`,
            status: client_1.PaymentStatus.SUCCESS,
            payment_date: new Date()
        });
    }
    // Add 3000 custom security deposit payments (not tied to monthly invoices)
    for (let i = 0; i < fetchedDeposits.length; i++) {
        const dep = fetchedDeposits[i];
        payments.push({
            id: (0, crypto_1.randomUUID)(),
            tenant_id: dep.tenant_id,
            amount: dep.amount,
            payment_method: client_1.PaymentMethod.BANK_TRANSFER,
            transaction_id: `txn_dep_${dep.id}`,
            status: client_1.PaymentStatus.SUCCESS,
            payment_date: new Date()
        });
    }
    const paymentBatchSize = 1000;
    for (let i = 0; i < payments.length; i += paymentBatchSize) {
        const batch = payments.slice(i, i + paymentBatchSize);
        await prisma.payment.createMany({ data: batch });
    }
    // 13. Create Dashboard Summaries Caches
    console.log('Seeding DashboardSummary cache stats...');
    const summaries = [];
    for (const prop of fetchedProperties) {
        summaries.push({
            id: (0, crypto_1.randomUUID)(),
            property_id: prop.id,
            occupied_beds: 10,
            vacant_beds: 10,
            monthly_revenue: 75000.00,
            pending_rent: 0.00,
            total_tenants: 10,
            average_occupancy: 50.0
        });
    }
    await prisma.dashboardSummary.createMany({ data: summaries });
    console.log('--- ENTERPRISE DATABASE SEEDING COMPLETED ---');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
