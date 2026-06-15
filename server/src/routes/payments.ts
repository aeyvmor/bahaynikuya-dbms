import { prisma } from '../db';
import { createCrudRouter } from '../lib/crud';
import { paymentCreate, paymentUpdate } from '../lib/schemas';

export default createCrudRouter({
  delegate: prisma.payment,
  createSchema: paymentCreate,
  updateSchema: paymentUpdate,
  include: { lease: { include: { tenant: true, room: true } } },
  dateFields: ['paymentDate'],
  orderBy: { paymentDate: 'desc' },
  buildWhere: (q) => {
    const where: any = {};
    if (q.status && q.status !== 'all') where.status = q.status;
    if (q.search) {
      const s = String(q.search);
      where.lease = {
        OR: [
          { tenant: { firstName: { contains: s, mode: 'insensitive' } } },
          { tenant: { lastName: { contains: s, mode: 'insensitive' } } },
          { room: { roomNumber: { contains: s, mode: 'insensitive' } } },
        ],
      };
    }
    return where;
  },
});
