/**
 * Recursively convert Prisma result objects into JSON-friendly shapes:
 *  - Decimal -> number
 *  - Date    -> 'YYYY-MM-DD' (all our date columns are @db.Date)
 */
export function serialize(value: any): any {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (typeof value === 'object') {
    // Prisma Decimal (decimal.js) exposes toNumber + toFixed
    if (typeof value.toNumber === 'function' && typeof value.toFixed === 'function') {
      return value.toNumber();
    }
    const out: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      out[key] = serialize(value[key]);
    }
    return out;
  }

  return value;
}
