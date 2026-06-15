import { prisma } from '../db';
import { createCrudRouter } from '../lib/crud';
import { maintenanceCreate, maintenanceUpdate } from '../lib/schemas';

export default createCrudRouter({
  delegate: prisma.maintenanceRequest,
  createSchema: maintenanceCreate,
  updateSchema: maintenanceUpdate,
  include: { room: true },
  dateFields: ['reportedDate'],
  orderBy: { reportedDate: 'desc' },
  buildWhere: (q) => {
    const where: any = {};
    if (q.status && q.status !== 'all') where.status = q.status;
    if (q.priority && q.priority !== 'all') where.priority = q.priority;
    if (q.search) {
      const s = String(q.search);
      where.OR = [
        { description: { contains: s, mode: 'insensitive' } },
        { room: { roomNumber: { contains: s, mode: 'insensitive' } } },
      ];
    }
    return where;
  },
});
