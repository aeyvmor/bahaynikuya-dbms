import { prisma } from '../db';
import { createCrudRouter } from '../lib/crud';
import { leaseCreate, leaseUpdate } from '../lib/schemas';

export default createCrudRouter({
  delegate: prisma.lease,
  createSchema: leaseCreate,
  updateSchema: leaseUpdate,
  include: { tenant: true, room: true },
  dateFields: ['startDate', 'endDate'],
  buildWhere: (q) => {
    const where: any = {};
    if (q.status && q.status !== 'all') where.status = q.status;
    if (q.search) {
      const s = String(q.search);
      where.OR = [
        { tenant: { firstName: { contains: s, mode: 'insensitive' } } },
        { tenant: { lastName: { contains: s, mode: 'insensitive' } } },
        { room: { roomNumber: { contains: s, mode: 'insensitive' } } },
      ];
    }
    return where;
  },
  checkDependents: async (id) => {
    const payments = await prisma.payment.count({ where: { leaseId: id } });
    if (payments > 0) {
      return {
        blocked: true,
        message: `Cannot delete lease: it has ${payments} payment(s). Remove those first.`,
      };
    }
    return { blocked: false };
  },
});
