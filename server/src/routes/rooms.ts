import { prisma } from '../db';
import { createCrudRouter } from '../lib/crud';
import { roomCreate, roomUpdate } from '../lib/schemas';

export default createCrudRouter({
  delegate: prisma.room,
  createSchema: roomCreate,
  updateSchema: roomUpdate,
  buildWhere: (q) => {
    const where: any = {};
    if (q.status && q.status !== 'all') where.status = q.status;
    if (q.type && q.type !== 'all') where.type = q.type;
    if (q.search) where.roomNumber = { contains: String(q.search), mode: 'insensitive' };
    return where;
  },
  checkDependents: async (id) => {
    const leases = await prisma.lease.count({ where: { roomId: id } });
    const mr = await prisma.maintenanceRequest.count({ where: { roomId: id } });
    if (leases + mr > 0) {
      return {
        blocked: true,
        message: `Cannot delete room: it has ${leases} lease(s) and ${mr} maintenance request(s). Remove those first.`,
      };
    }
    return { blocked: false };
  },
});
