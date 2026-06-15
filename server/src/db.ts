import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

/**
 * Reset Postgres identity sequences to MAX(id) so app-created rows do not
 * collide with explicitly-seeded / restored ids.
 */
export async function resetSequences() {
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
