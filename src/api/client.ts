import type {
  FamilyMember,
  LabReport,
  MedicalRecord,
  MedicalSchedule,
  Medication,
} from '../types';
import type { HealthNotification } from '../components/NotificationsModal';

const TOKEN_KEY = 'hk_access_token';
const USER_KEY = 'hk_user';
const LEGACY_KEYS = [
  'hk_members',
  'hk_medications',
  'hk_records',
  'hk_lab_reports',
  'hk_schedules',
  'hk_notifications',
];

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
  clearLegacyBusinessCache();
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function clearLegacyBusinessCache() {
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
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
    let detail: unknown = `请求失败 (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
      if (Array.isArray(detail)) {
        detail = detail.map((d: { msg?: string }) => d.msg).join('; ');
      }
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

  getMembers: () => request<FamilyMember[]>('/members'),

  createMember: (body: {
    name: string;
    nickname?: string;
    relation?: string;
    age?: number;
    avatar?: string;
    blood_type?: string;
    height?: number;
    weight?: number;
    chronic_conditions?: string[];
    allergies?: string[];
    status_text?: string;
    status_type?: string;
  }) =>
    request<FamilyMember>('/members', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateMember: (
    id: string,
    body: Partial<{
      name: string;
      nickname: string;
      relation: string;
      age: number;
      avatar: string;
      blood_type: string;
      height: number;
      weight: number;
      chronic_conditions: string[];
      allergies: string[];
      status_text: string;
      status_type: string;
    }>
  ) =>
    request<FamilyMember>(`/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteMember: (id: string) => request<{ ok: boolean }>(`/members/${id}`, { method: 'DELETE' }),

  recordVitals: (
    memberId: string,
    body: { type: 'bp' | 'glucose' | 'temp' | 'heartRate' | 'sleep'; data: Record<string, unknown> }
  ) =>
    request<FamilyMember>(`/members/${memberId}/vitals`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMedications: (memberId?: string) => {
    const q = memberId ? `?member_id=${encodeURIComponent(memberId)}` : '';
    return request<Medication[]>(`/medications${q}`);
  },

  createMedication: (body: Record<string, unknown>) =>
    request<Medication>('/medications', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateMedication: (id: string, body: Record<string, unknown>) =>
    request<Medication>(`/medications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteMedication: (id: string) =>
    request<{ ok: boolean }>(`/medications/${id}`, { method: 'DELETE' }),

  takeMedication: (id: string) =>
    request<Medication>(`/medications/${id}/take`, { method: 'POST' }),

  getRecords: (memberId?: string) => {
    const q = memberId ? `?member_id=${encodeURIComponent(memberId)}` : '';
    return request<MedicalRecord[]>(`/records${q}`);
  },

  createRecord: (body: {
    memberId: string;
    hospital?: string;
    department?: string;
    date?: string;
    doctor?: string;
    status?: string;
    complaint?: string;
    diagnosis?: string;
    orders?: string;
  }) =>
    request<MedicalRecord>('/records', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getLabReports: (memberId?: string) => {
    const q = memberId ? `?member_id=${encodeURIComponent(memberId)}` : '';
    return request<LabReport[]>(`/lab-reports${q}`);
  },

  createLabReport: (body: {
    memberId: string;
    title: string;
    date?: string;
    lab?: string;
    statusTag?: string;
    statusType?: string;
    metrics?: Array<Record<string, unknown>>;
    sourceFileUrl?: string;
  }) =>
    request<LabReport>('/lab-reports', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  downloadLabOriginal: async (reportId: string) => {
    const token = getToken();
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch(`${API_BASE}/lab-reports/${reportId}/original`, { headers });
    if (!res.ok) {
      let detail = `下载失败 (${res.status})`;
      try {
        const data = await res.json();
        detail = String(data.detail ?? detail);
      } catch {
        /* ignore */
      }
      throw new Error(detail);
    }
    return res.blob();
  },

  getSchedules: () => request<MedicalSchedule[]>('/schedules'),

  createSchedule: (body: {
    memberId: string;
    title: string;
    type?: string;
    dateIso: string;
    time?: string;
    location?: string;
    department?: string;
    doctor?: string;
    tags?: string[];
    notes?: string;
    themeColor?: string;
    reminderSet?: boolean;
  }) =>
    request<MedicalSchedule>('/schedules', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateSchedule: (
    id: string,
    body: Partial<{ isCompleted: boolean; reminderSet: boolean; title: string; notes: string }>
  ) =>
    request<MedicalSchedule>(`/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteSchedule: (id: string) =>
    request<{ ok: boolean }>(`/schedules/${id}`, { method: 'DELETE' }),

  getNotifications: () => request<HealthNotification[]>('/notifications'),

  markNotificationRead: (id: string) =>
    request<HealthNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request<{ ok: boolean }>('/notifications/read-all', { method: 'POST' }),

  sendReminder: () =>
    request<{ ok: boolean; message: string }>('/reminders/send', { method: 'POST' }),

  scan: async (kind: 'medicine' | 'lab', file: File) => {
    const form = new FormData();
    form.append('kind', kind);
    form.append('file', file);
    return request<{
      kind: string;
      data: Record<string, unknown>;
      confidence: number;
      raw_text: string;
      source_file_url?: string;
    }>('/ai/scan', { method: 'POST', body: form });
  },
};
