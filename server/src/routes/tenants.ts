import { prisma } from '../db';
import { createCrudRouter } from '../lib/crud';
import { tenantCreate, tenantUpdate } from '../lib/schemas';

export default createCrudRouter({
  delegate: prisma.tenant,
  createSchema: tenantCreate,
  updateSchema: tenantUpdate,
  softDelete: true,
  buildWhere: (q) => {
    const where: any = {};
    if (q.status && q.status !== 'all') where.status = q.status;
    if (q.search) {
      const s = String(q.search);
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s } },
      ];
    }
    return where;
  },
});
