import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const d = (s: string) => new Date(s + 'T00:00:00.000Z');

async function resetSequences() {
  const tables: [string, string][] = [
    ['tenants', 'tenant_id'],
    ['rooms', 'room_id'],
    ['leases', 'lease_id'],
    ['payments', 'payment_id'],
    ['maintenance_requests', 'request_id'],
  ];
  for (const [t, c] of tables) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('${t}', '${c}'), (SELECT COALESCE(MAX(${c}), 1) FROM ${t}))`
    );
  }
}

async function main() {
  console.log('Seeding Bahay ni Kuya database...');

  // Wipe (respect FK order)
  await prisma.payment.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.room.deleteMany();

  // ----- Rooms -----
  await prisma.room.createMany({
    data: [
      { id: 1, roomNumber: '101', floor: 1, type: 'single', monthlyRate: 4500, maxOccupancy: 1, status: 'occupied' },
      { id: 2, roomNumber: '102', floor: 1, type: 'double', monthlyRate: 6000, maxOccupancy: 2, status: 'occupied' },
      { id: 3, roomNumber: '201', floor: 2, type: 'single', monthlyRate: 4800, maxOccupancy: 1, status: 'available' },
      { id: 4, roomNumber: '202', floor: 2, type: 'shared', monthlyRate: 3000, maxOccupancy: 4, status: 'occupied' },
      { id: 5, roomNumber: '203', floor: 2, type: 'single', monthlyRate: 4800, maxOccupancy: 1, status: 'under_maintenance' },
    ],
  });

  // ----- Tenants -----
  await prisma.tenant.createMany({
    data: [
      { id: 1, firstName: 'Carlos', lastName: 'Reyes', email: 'carlos.reyes@example.com', phone: '0917-123-4501', status: 'active' },
      { id: 2, firstName: 'Ana', lastName: 'Santos', email: 'ana.santos@example.com', phone: '0917-123-4502', status: 'active' },
      { id: 3, firstName: 'Miguel', lastName: 'Cruz', email: 'miguel.cruz@example.com', phone: '0917-123-4503', status: 'active' },
      { id: 4, firstName: 'Jasmine', lastName: 'Dela Cruz', email: 'jasmine.delacruz@example.com', phone: '0917-123-4504', status: 'active' },
      { id: 5, firstName: 'Ramon', lastName: 'Villanueva', email: 'ramon.villanueva@example.com', phone: '0917-123-4505', status: 'inactive' },
    ],
  });

  // ----- Leases -----
  await prisma.lease.createMany({
    data: [
      { id: 1, tenantId: 1, roomId: 1, startDate: d('2024-06-01'), endDate: null, status: 'active' },
      { id: 2, tenantId: 2, roomId: 2, startDate: d('2024-07-15'), endDate: null, status: 'active' },
      { id: 3, tenantId: 3, roomId: 4, startDate: d('2024-08-01'), endDate: null, status: 'active' },
      { id: 4, tenantId: 4, roomId: 4, startDate: d('2024-09-01'), endDate: null, status: 'active' },
      { id: 5, tenantId: 5, roomId: 3, startDate: d('2023-01-10'), endDate: d('2024-01-10'), status: 'ended' },
    ],
  });

  // ----- Payments (brief: May/Apr) + added June 2026 so "income this month" is live -----
  await prisma.payment.createMany({
    data: [
      // Brief sample data (exact)
      { id: 1, leaseId: 1, amount: 4500, paymentDate: d('2026-05-05'), status: 'paid' },
      { id: 2, leaseId: 2, amount: 6000, paymentDate: d('2026-05-03'), status: 'paid' },
      { id: 3, leaseId: 3, amount: 3000, paymentDate: d('2026-05-10'), status: 'paid' },
      { id: 4, leaseId: 4, amount: 1500, paymentDate: d('2026-05-12'), status: 'partial' },
      { id: 5, leaseId: 1, amount: 4500, paymentDate: d('2026-04-04'), status: 'paid' },
      // Added current-month (June 2026) records
      { id: 6, leaseId: 1, amount: 4500, paymentDate: d('2026-06-05'), status: 'paid' },
      { id: 7, leaseId: 2, amount: 6000, paymentDate: d('2026-06-03'), status: 'paid' },
      { id: 8, leaseId: 3, amount: 3000, paymentDate: d('2026-06-10'), status: 'paid' },
      { id: 9, leaseId: 4, amount: 1500, paymentDate: d('2026-06-12'), status: 'partial' },
    ],
  });

  // ----- Maintenance Requests -----
  await prisma.maintenanceRequest.createMany({
    data: [
      { id: 1, roomId: 5, description: 'Air-conditioning unit not cooling; needs servicing.', priority: 'high', reportedDate: d('2026-05-20'), status: 'in_progress' },
      { id: 2, roomId: 2, description: 'Leaking faucet in the bathroom.', priority: 'medium', reportedDate: d('2026-05-22'), status: 'resolved' },
      { id: 3, roomId: 4, description: 'Broken window latch, will not lock.', priority: 'high', reportedDate: d('2026-06-01'), status: 'pending' },
      { id: 4, roomId: 1, description: 'Flickering ceiling light.', priority: 'low', reportedDate: d('2026-05-30'), status: 'pending' },
      { id: 5, roomId: 3, description: 'Door lock sticking, hard to open.', priority: 'low', reportedDate: d('2026-05-18'), status: 'in_progress' },
    ],
  });

  await resetSequences();

  const counts = {
    tenants: await prisma.tenant.count(),
    rooms: await prisma.room.count(),
    leases: await prisma.lease.count(),
    payments: await prisma.payment.count(),
    maintenance: await prisma.maintenanceRequest.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
