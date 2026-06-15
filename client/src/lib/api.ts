export class ApiError extends Error {
  status: number;
  details?: { path: string; message: string }[];
  constructor(message: string, status: number, details?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: any = {};
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    const msg =
      body?.error ||
      (Array.isArray(body?.details) ? body.details.map((d: any) => d.message).join(', ') : '') ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body?.details);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const BASE = '/api';

export const api = {
  get: <T>(path: string) => fetch(`${BASE}${path}`).then((r) => handle<T>(r)),

  post: <T>(path: string, data: unknown) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handle<T>(r)),

  put: <T>(path: string, data: unknown) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handle<T>(r)),

  del: <T>(path: string) => fetch(`${BASE}${path}`, { method: 'DELETE' }).then((r) => handle<T>(r)),
};

/** Build a query string from a filter object, omitting empty / "all" values. */
export function qs(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v !== 'all' && v.trim() !== '') sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}
