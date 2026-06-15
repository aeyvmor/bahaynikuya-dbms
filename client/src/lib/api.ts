export class ApiError extends Error {
  status: number;
  details?: { path: string; message: string }[];
  constructor(message: string, status: number, details?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const TOKEN_KEY = 'bnk_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response, path: string): Promise<T> {
  if (!res.ok) {
    // Session expired/invalid on a protected route → drop token and bounce to login.
    if (res.status === 401 && !path.startsWith('/auth/')) {
      clearToken();
      if (window.location.pathname.startsWith('/app')) {
        window.location.assign('/login');
      }
    }
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
  get: <T>(path: string) => fetch(`${BASE}${path}`, { headers: authHeaders() }).then((r) => handle<T>(r, path)),

  post: <T>(path: string, data: unknown) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then((r) => handle<T>(r, path)),

  put: <T>(path: string, data: unknown) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then((r) => handle<T>(r, path)),

  del: <T>(path: string) =>
    fetch(`${BASE}${path}`, { method: 'DELETE', headers: authHeaders() }).then((r) => handle<T>(r, path)),
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
