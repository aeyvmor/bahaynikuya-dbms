import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const incomeAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'paid', paymentDate: { gte: monthStart, lt: monthEnd } },
    });
    const incomeThisMonth = Number(incomeAgg._sum.amount ?? 0);

    const totalRooms = await prisma.room.count();
    const occupiedRooms = await prisma.room.count({ where: { status: 'occupied' } });

    const outstanding = await prisma.payment.findMany({
      where: { status: { in: ['partial', 'overdue'] } },
      include: { lease: { include: { tenant: true, room: true } } },
      orderBy: { paymentDate: 'asc' },
    });
    const today = Date.now();
    const overdue = outstanding.map((p) => {
      const days = Math.max(0, Math.floor((today - new Date(p.paymentDate).getTime()) / 86_400_000));
      return {
        paymentId: p.id,
        tenant: `${p.lease.tenant.firstName} ${p.lease.tenant.lastName}`,
        roomNumber: p.lease.room.roomNumber,
        amount: Number(p.amount),
        status: p.status,
        paymentDate: new Date(p.paymentDate).toISOString().slice(0, 10),
        daysOverdue: days,
      };
    });
    const overdueTotal = overdue.reduce((sum, o) => sum + o.amount, 0);

    const grouped = await prisma.maintenanceRequest.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const maintenanceByStatus = { pending: 0, in_progress: 0, resolved: 0 } as Record<string, number>;
    grouped.forEach((g) => {
      maintenanceByStatus[g.status] = g._count._all;
    });

    const activeTenants = await prisma.tenant.count({ where: { status: 'active' } });
    const activeLeases = await prisma.lease.count({ where: { status: 'active' } });

    res.json({
      incomeThisMonth,
      month: monthStart.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
      occupancy: {
        occupied: occupiedRooms,
        total: totalRooms,
        rate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      },
      overdue,
      overdueTotal,
      maintenanceByStatus,
      maintenanceTotal: outstanding.length >= 0 ? Object.values(maintenanceByStatus).reduce((a, b) => a + b, 0) : 0,
      activeTenants,
      activeLeases,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
