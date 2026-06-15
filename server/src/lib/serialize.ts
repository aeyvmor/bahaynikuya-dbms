export function serialize(value: any): any {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (typeof value === 'object') {
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
