import { Router } from 'express';
import { z } from 'zod';
import { serialize } from './serialize';

type CrudOptions = {
  delegate: any; // a Prisma model delegate (e.g. prisma.tenant)
  createSchema: z.ZodTypeAny;
  updateSchema: z.ZodTypeAny;
  buildWhere?: (query: any) => any;
  include?: any;
  orderBy?: any;
  /** field names whose string value should be converted to a Date before write */
  dateFields?: string[];
  /** tenants: set status=inactive instead of deleting */
  softDelete?: boolean;
  /** return { blocked, message } to refuse a hard delete with 409 */
  checkDependents?: (id: number) => Promise<{ blocked: boolean; message?: string }>;
};

function applyDates(data: Record<string, any>, dateFields: string[]) {
  const out = { ...data };
  for (const f of dateFields) {
    if (out[f] === undefined) continue;
    if (out[f] === null || out[f] === '') {
      out[f] = null;
    } else {
      out[f] = new Date(out[f] + 'T00:00:00.000Z');
    }
  }
  return out;
}

export function createCrudRouter(opts: CrudOptions): Router {
  const router = Router();
  const { delegate, include, orderBy = { id: 'asc' }, dateFields = [] } = opts;

  // LIST (with search/filter)
  router.get('/', async (req, res, next) => {
    try {
      const where = opts.buildWhere ? opts.buildWhere(req.query) : {};
      const rows = await delegate.findMany({ where, include, orderBy });
      res.json(serialize(rows));
    } catch (err) {
      next(err);
    }
  });

  // GET one
  router.get('/:id', async (req, res, next) => {
    try {
      const row = await delegate.findUnique({ where: { id: Number(req.params.id) }, include });
      if (!row) return res.status(404).json({ error: 'Record not found.' });
      res.json(serialize(row));
    } catch (err) {
      next(err);
    }
  });

  // CREATE
  router.post('/', async (req, res, next) => {
    try {
      const parsed = opts.createSchema.parse(req.body);
      const data = applyDates(parsed as Record<string, any>, dateFields);
      const row = await delegate.create({ data, include });
      res.status(201).json(serialize(row));
    } catch (err) {
      next(err);
    }
  });

  // UPDATE
  router.put('/:id', async (req, res, next) => {
    try {
      const parsed = opts.updateSchema.parse(req.body);
      const data = applyDates(parsed as Record<string, any>, dateFields);
      const row = await delegate.update({ where: { id: Number(req.params.id) }, data, include });
      res.json(serialize(row));
    } catch (err) {
      next(err);
    }
  });

  // DELETE (soft for tenants, hard + dependency guard otherwise)
  router.delete('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      if (opts.checkDependents) {
        const { blocked, message } = await opts.checkDependents(id);
        if (blocked) {
          return res.status(409).json({ error: message ?? 'Cannot delete: record is referenced by other records.' });
        }
      }

      if (opts.softDelete) {
        const row = await delegate.update({ where: { id }, data: { status: 'inactive' } });
        return res.json({ softDeleted: true, record: serialize(row) });
      }

      await delegate.delete({ where: { id } });
      res.json({ deleted: true, id });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
