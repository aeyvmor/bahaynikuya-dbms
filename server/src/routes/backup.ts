import { Router } from 'express';
import { prisma, resetSequences } from '../db';
import { serialize } from '../lib/serialize';

const router = Router();

// GET /api/backup -> full database snapshot as JSON
router.get('/backup', async (_req, res, next) => {
  try {
    const [tenants, rooms, leases, payments, maintenance_requests] = await Promise.all([
      prisma.tenant.findMany({ orderBy: { id: 'asc' } }),
      prisma.room.findMany({ orderBy: { id: 'asc' } }),
      prisma.lease.findMany({ orderBy: { id: 'asc' } }),
      prisma.payment.findMany({ orderBy: { id: 'asc' } }),
      prisma.maintenanceRequest.findMany({ orderBy: { id: 'asc' } }),
    ]);

    res.json({
      app: 'bahay-ni-kuya',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: serialize({ tenants, rooms, leases, payments, maintenance_requests }),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/restore -> replace ALL data from an uploaded backup
router.post('/restore', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const data = body.data ?? body;

    const required = ['tenants', 'rooms', 'leases', 'payments', 'maintenance_requests'];
    for (const key of required) {
      if (!Array.isArray(data?.[key])) {
        return res.status(400).json({ error: `Invalid backup file: missing "${key}" array.` });
      }
    }

    await prisma.$transaction(async (tx) => {
      // delete in FK-safe order
      await tx.payment.deleteMany();
      await tx.maintenanceRequest.deleteMany();
      await tx.lease.deleteMany();
      await tx.tenant.deleteMany();
      await tx.room.deleteMany();

      await tx.room.createMany({
        data: data.rooms.map((r: any) => ({
          id: r.id,
          roomNumber: r.roomNumber,
          floor: r.floor,
          type: r.type,
          monthlyRate: r.monthlyRate,
          maxOccupancy: r.maxOccupancy,
          status: r.status,
        })),
      });
      await tx.tenant.createMany({
        data: data.tenants.map((t: any) => ({
          id: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
          phone: t.phone,
          status: t.status,
        })),
      });
      await tx.lease.createMany({
        data: data.leases.map((l: any) => ({
          id: l.id,
          tenantId: l.tenantId,
          roomId: l.roomId,
          startDate: new Date(l.startDate),
          endDate: l.endDate ? new Date(l.endDate) : null,
          status: l.status,
        })),
      });
      await tx.payment.createMany({
        data: data.payments.map((p: any) => ({
          id: p.id,
          leaseId: p.leaseId,
          amount: p.amount,
          paymentDate: new Date(p.paymentDate),
          status: p.status,
        })),
      });
      await tx.maintenanceRequest.createMany({
        data: data.maintenance_requests.map((m: any) => ({
          id: m.id,
          roomId: m.roomId,
          description: m.description,
          priority: m.priority,
          reportedDate: new Date(m.reportedDate),
          status: m.status,
        })),
      });
    });

    await resetSequences();

    const counts = {
      tenants: await prisma.tenant.count(),
      rooms: await prisma.room.count(),
      leases: await prisma.lease.count(),
      payments: await prisma.payment.count(),
      maintenance_requests: await prisma.maintenanceRequest.count(),
    };
    res.json({ restored: true, counts });
  } catch (err) {
    next(err);
  }
});

export default router;
