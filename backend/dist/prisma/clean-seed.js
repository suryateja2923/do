"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- ENTERPRISE CLEAN DATABASE SEEDING START ---');
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
    console.log('Seeding locations (India -> Karnataka -> Bengaluru)...');
    const country = await prisma.country.create({
        data: { id: (0, crypto_1.randomUUID)(), name: 'India', code: 'IN' }
    });
    const stateKA = await prisma.state.create({
        data: { id: (0, crypto_1.randomUUID)(), country_id: country.id, name: 'Karnataka', code: 'KA' }
    });
    const cityBLR = await prisma.city.create({
        data: { id: (0, crypto_1.randomUUID)(), state_id: stateKA.id, name: 'Bengaluru' }
    });
    const areas = ['HSR Layout', 'Koramangala', 'Indiranagar'];
    for (const name of areas) {
        await prisma.area.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                city_id: cityBLR.id,
                name,
                zip_code: Math.floor(560000 + Math.random() * 100).toString()
            }
        });
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
    console.log('Seeding amenities lookup...');
    const amenityList = ['WiFi', 'AC', 'Gym', 'Laundry', 'CCTV', 'Parking', 'Food', 'Power Backup'];
    for (const name of amenityList) {
        await prisma.amenity.create({
            data: { name, icon: `${name.toLowerCase().replace(' ', '-')}-icon` }
        });
    }
    // 4. Users Generation (2 Admins, 5 Managers, 2 Owners, 2 Tenants)
    console.log('Generating essential clean system users...');
    const adminUsers = [];
    for (let i = 1; i <= 2; i++) {
        const admin = await prisma.user.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                email: `admin${i}@homiepg.com`,
                phone: `+91900000000${i}`,
                first_name: `Admin`,
                last_name: `${i}`,
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
                password_hash: '$2b$04$FrzavrDi84XluwuBK9T52.kmSloli7oAlfYshApAiRRGCo1vDIseC', // password123
            }
        });
        adminUsers.push(admin);
    }
    const ownerUsers = [];
    for (let i = 1; i <= 2; i++) {
        const owner = await prisma.user.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                email: `owner${i}@gmail.com`,
                phone: `+91922222220${i}`,
                first_name: `Owner`,
                last_name: `${i}`,
                role: client_1.UserRole.OWNER,
                status: client_1.UserStatus.ACTIVE,
                password_hash: '$2b$04$FrzavrDi84XluwuBK9T52.kmSloli7oAlfYshApAiRRGCo1vDIseC', // password123
            }
        });
        ownerUsers.push(owner);
    }
    // Create Owner Profiles & Active Subscriptions
    console.log('Creating owner profiles and subscriptions...');
    const ownerProfiles = [];
    for (const user of ownerUsers) {
        const profile = await prisma.ownerProfile.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                user_id: user.id,
                business_name: `${user.first_name} ${user.last_name} PG Accommodations`,
                verification_status: client_1.VerificationStatus.VERIFIED,
                approved_by: adminUsers[0].id,
                approved_at: new Date(),
                approval_notes: 'KYC verified.',
                verification_attempts: 1
            }
        });
        ownerProfiles.push(profile);
        // Active subscription
        await prisma.ownerSubscription.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                owner_profile_id: profile.id,
                plan_id: businessPlan.id,
                status: client_1.SubscriptionStatus.ACTIVE,
                start_date: new Date()
            }
        });
    }
    // Managers
    console.log('Creating manager profiles...');
    const managerUsers = [];
    for (let i = 1; i <= 5; i++) {
        const manager = await prisma.user.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                email: `manager${i}@homiepg.com`,
                phone: `+91911111111${i}`,
                first_name: `Manager`,
                last_name: `${i}`,
                role: client_1.UserRole.MANAGER,
                status: client_1.UserStatus.ACTIVE,
                password_hash: '$2b$04$FrzavrDi84XluwuBK9T52.kmSloli7oAlfYshApAiRRGCo1vDIseC', // password123
            }
        });
        managerUsers.push(manager);
        await prisma.managerProfile.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                user_id: manager.id,
                owner_id: ownerProfiles[i % ownerProfiles.length].id
            }
        });
    }
    // Tenants
    console.log('Creating tenant profiles...');
    for (let i = 1; i <= 2; i++) {
        const tenant = await prisma.user.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                email: `tenant${i}@gmail.com`,
                phone: `+91800000000${i}`,
                first_name: `Tenant`,
                last_name: `${i}`,
                role: client_1.UserRole.USER,
                status: client_1.UserStatus.ACTIVE,
                password_hash: '$2b$04$FrzavrDi84XluwuBK9T52.kmSloli7oAlfYshApAiRRGCo1vDIseC', // password123
            }
        });
        await prisma.tenantProfile.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                user_id: tenant.id,
                emergency_contact_name: 'Emergency Contact',
                emergency_contact_phone: '+919999999999',
                permanent_address: 'Clean Seed Resident Address, India'
            }
        });
    }
    console.log('--- ENTERPRISE CLEAN DATABASE SEEDING COMPLETED ---');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
