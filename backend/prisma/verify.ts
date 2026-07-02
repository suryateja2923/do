import { PrismaClient, BookingStatus, AgreementStatus, PaymentMethod, PaymentStatus, UserRole, UserStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function testRoomCapacityConstraint() {
  console.log('\n--- 1. Testing Room Capacity Limit Trigger ---');
  const room = await prisma.room.findFirst({
    where: { sharing_type: 'FOUR_SHARING' }
  });
  if (!room) {
    throw new Error('No FOUR_SHARING room found to test capacity trigger.');
  }

  // Count existing beds in the room (should be 4 from seeding)
  const bedCount = await prisma.bed.count({
    where: { room_id: room.id, is_deleted: false }
  });
  console.log(`Current beds in room ${room.room_number}: ${bedCount}`);

  try {
    console.log('Attempting to insert a 5th bed into a FOUR_SHARING room...');
    await prisma.bed.create({
      data: {
        id: randomUUID(),
        room_id: room.id,
        bed_number: `${room.room_number}-B5_TEST`,
        rent: 5000.00,
        security_deposit: 5000.00,
      }
    });
    throw new Error('❌ Constraint failure: Successfully inserted bed exceeding room capacity!');
  } catch (err: any) {
    if (err.message.includes('Room bed capacity limits reached')) {
      console.log('✔ Room capacity trigger blocked insertion as expected.');
    } else {
      console.error('Unexpected error on room capacity trigger:', err.message);
      throw err;
    }
  }
}

async function testPaymentBalanceConstraint() {
  console.log('\n--- 2. Testing Payment Cap Trigger ---');
  const invoice = await prisma.invoice.findFirst({
    where: { status: 'PAID' }
  });
  if (!invoice) {
    throw new Error('No PAID invoice found to test payment cap trigger.');
  }

  console.log(`Testing invoice: ${invoice.title} (Amount: ${invoice.amount})`);

  try {
    console.log('Attempting to post an extra payment exceeding invoice balance...');
    await prisma.payment.create({
      data: {
        id: randomUUID(),
        invoice_id: invoice.id,
        tenant_id: invoice.tenant_id,
        amount: 500.00, // Excess payment
        payment_method: PaymentMethod.UPI,
        status: PaymentStatus.SUCCESS,
      }
    });
    throw new Error('❌ Constraint failure: Excess payment was allowed!');
  } catch (err: any) {
    if (err.message.includes('exceeds remaining invoice balance')) {
      console.log('✔ Payment trigger blocked excess payment as expected.');
    } else {
      console.error('Unexpected error on payment cap trigger:', err.message);
      throw err;
    }
  }
}

async function testRefundDepositConstraint() {
  console.log('\n--- 3. Testing Refund Cap Trigger ---');
  const deposit = await prisma.securityDeposit.findFirst();
  if (!deposit) {
    throw new Error('No security deposit found to test refund cap trigger.');
  }

  console.log(`Testing deposit: ID: ${deposit.id} (Amount: ${deposit.amount})`);

  try {
    console.log('Attempting to create a refund exceeding security deposit...');
    await prisma.depositRefund.create({
      data: {
        id: randomUUID(),
        security_deposit_id: deposit.id,
        refund_amount: Number(deposit.amount) + 1000.00, // Exceeds deposit
        damage_deduction: 0.00,
        cleaning_charges: 0.00,
        refund_status: 'PENDING',
      }
    });
    throw new Error('❌ Constraint failure: Excess deposit refund was allowed!');
  } catch (err: any) {
    if (err.message.includes('exceed original security deposit')) {
      console.log('✔ Refund trigger blocked excess refund amount as expected.');
    } else {
      console.error('Unexpected error on refund cap trigger:', err.message);
      throw err;
    }
  }
}

async function testActiveBookingConstraint() {
  console.log('\n--- 4. Testing Duplicate Active Bookings Index Constraint ---');
  const activeBooking = await prisma.booking.findFirst({
    where: { status: BookingStatus.MOVE_IN }
  });
  if (!activeBooking) {
    throw new Error('No active booking found to test index constraint.');
  }

  console.log(`Active booking tenant profile: ${activeBooking.tenant_id}`);

  try {
    console.log('Attempting to insert a duplicate active booking (MOVE_IN) for the same tenant...');
    await prisma.booking.create({
      data: {
        id: randomUUID(),
        tenant_id: activeBooking.tenant_id,
        bed_id: activeBooking.bed_id,
        booking_date: new Date(),
        expected_move_in: new Date(),
        booking_amount: 1000.00,
        security_deposit: 5000.00,
        rent: 5000.00,
        status: BookingStatus.MOVE_IN,
      }
    });
    throw new Error('❌ Index failure: Successfully inserted a duplicate active booking!');
  } catch (err: any) {
    if (err.message.includes('Unique constraint failed') || err.message.includes('unique_active_booking')) {
      console.log('✔ Unique active booking index constraint successfully enforced.');
    } else {
      console.error('Unexpected error on booking index constraint:', err.message);
      throw err;
    }
  }
}

async function testActiveAgreementConstraint() {
  console.log('\n--- 5. Testing Duplicate Active Agreement Index Constraint ---');
  const activeAgreement = await prisma.rentalAgreement.findFirst({
    where: { status: AgreementStatus.ACTIVE }
  });
  if (!activeAgreement) {
    throw new Error('No active rental agreement found to test index constraint.');
  }

  try {
    console.log('Attempting to insert a duplicate active agreement for the same tenant...');
    await prisma.rentalAgreement.create({
      data: {
        id: randomUUID(),
        booking_id: randomUUID(), // mock random booking id to bypass booking fk check (need to be unique agreement)
        tenant_profile_id: activeAgreement.tenant_profile_id,
        url: 'https://supabase.storage/documents/agreements/dup.pdf',
        path: 'agreements/dup.pdf',
        status: AgreementStatus.ACTIVE,
      }
    });
    throw new Error('❌ Index failure: Successfully inserted a duplicate active rental agreement!');
  } catch (err: any) {
    if (err.message.includes('Unique constraint failed') || err.message.includes('unique_active_agreement')) {
      console.log('✔ Unique active rental agreement index constraint successfully enforced.');
    } else {
      console.error('Unexpected error on agreement index constraint:', err.message);
      throw err;
    }
  }
}

async function testSoftDeleteTrigger() {
  console.log('\n--- 6. Testing Soft Delete Trigger ---');
  
  const ticketId = randomUUID();
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No user found for soft delete test.');
  }

  // Dynamically set soft delete trigger on SupportTicket table for validation
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS soft_delete_support_ticket ON public."SupportTicket";`);
  await prisma.$executeRawUnsafe(`CREATE TRIGGER soft_delete_support_ticket BEFORE UPDATE ON public."SupportTicket" FOR EACH ROW EXECUTE FUNCTION public.process_soft_delete();`);

  await prisma.supportTicket.create({
    data: {
      id: ticketId,
      user_id: user.id,
      subject: 'Soft Delete Test Ticket',
      description: 'Verifying automated triggers update deleted_at.',
      status: 'OPEN'
    }
  });

  // Soft delete it
  console.log('Flagging support ticket as deleted...');
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { is_deleted: true }
  });

  // Fetch back and assert
  const deletedTicket = await prisma.supportTicket.findUnique({
    where: { id: ticketId }
  });

  if (deletedTicket && deletedTicket.is_deleted === true && deletedTicket.deleted_at !== null) {
    console.log(`✔ Support ticket soft-deleted. deleted_at set to: ${deletedTicket.deleted_at}`);
  } else {
    throw new Error('❌ Soft delete trigger failed to populate deleted_at.');
  }

  // Cleanup
  await prisma.supportTicket.delete({ where: { id: ticketId } });
}

async function testRLSPolicies() {
  console.log('\n--- 7. Testing Enterprise Row Level Security (RLS) Policies ---');

  const tenantUser = await prisma.user.findFirst({ where: { role: 'USER' } });
  const ownerUser = await prisma.user.findFirst({ where: { role: 'OWNER' } });
  
  if (!tenantUser || !ownerUser) {
    throw new Error('Users of type OWNER or USER not found for RLS test.');
  }

  try {
    // Tenant query for subscriptions
    console.log('Simulating Tenant query for Owner subscriptions...');
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated`);
      await tx.$executeRawUnsafe(
        `SELECT set_config('request.jwt.claims', $1, true)`,
        JSON.stringify({ sub: tenantUser.id })
      );

      const subs = await tx.$queryRawUnsafe<any[]>(
        `SELECT id FROM public."OwnerSubscription"`
      );
      
      console.log(`Tenant sees ${subs.length} subscription(s).`);
      if (subs.length === 0) {
        console.log('✔ RLS check: Tenant is blocked from viewing owner subscriptions.');
      } else {
        throw new Error('❌ RLS violation: Tenant saw owner subscriptions.');
      }
    });

    // Owner query for their own subscriptions
    console.log('Simulating Owner query for subscriptions...');
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated`);
      await tx.$executeRawUnsafe(
        `SELECT set_config('request.jwt.claims', $1, true)`,
        JSON.stringify({ sub: ownerUser.id })
      );

      const subs = await tx.$queryRawUnsafe<any[]>(
        `SELECT id FROM public."OwnerSubscription"`
      );
      
      console.log(`Owner sees ${subs.length} subscription(s).`);
      if (subs.length > 0) {
        console.log('✔ RLS check: Owner can view their own subscriptions.');
      } else {
        throw new Error('❌ RLS check failed: Owner should be able to view their subscriptions.');
      }
    });

  } catch (err: any) {
    console.error('RLS Test Failed:', err.message);
    throw err;
  }
}

async function run() {
  try {
    await testRoomCapacityConstraint();
    await testPaymentBalanceConstraint();
    await testRefundDepositConstraint();
    await testActiveBookingConstraint();
    await testActiveAgreementConstraint();
    await testSoftDeleteTrigger();
    await testRLSPolicies();
    console.log('\n🎉 ALL ENTERPRISE DATABASE FOUNDATION VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Verification script failed.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
