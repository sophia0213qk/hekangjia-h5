const TOKEN_KEY = 'hk_access_token';
const USER_KEY = 'hk_user';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

export type AuthUser = {
  id: string;
  phone: string;
  display_name: string;
  avatar_url: string;
  family_id?: string | null;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearSession();
    throw new Error('未登录或登录已过期');
  }
  if (!res.ok) {
    let detail = `请求失败 (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
      if (Array.isArray(detail)) detail = detail.map((d: { msg?: string }) => d.msg).join('; ');
    } catch {
      /* ignore */
    }
    throw new Error(String(detail));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  sendSms: (phone: string) =>
    request<{ ok: boolean; message: string; debug_code?: string }>('/auth/sms/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  loginSms: (phone: string, code: string) =>
    request<{ access_token: string; token_type: string; user: AuthUser }>('/auth/sms/login', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  me: () => request<AuthUser>('/auth/me'),

  scan: async (kind: 'medicine' | 'lab', file: File) => {
    const form = new FormData();
    form.append('kind', kind);
    form.append('file', file);
    return request<{ kind: string; data: Record<string, unknown>; confidence: number; raw_text: string }>(
      '/ai/scan',
      { method: 'POST', body: form }
    );
  },
};
