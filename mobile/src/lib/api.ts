import { getApiUrl } from "./settings";
import { todayIso } from "./dates";

export type HabitStatus = { id: number; name: string; hint: string; done: boolean };
export type DayScore = { date: string; done: number; total: number };
export type Summary = {
  today: string;
  habits: HabitStatus[];
  streak: number;
  streakBeforeToday: number;
  lastSevenDays: DayScore[];
};
export type DayDetail = { date: string; habits: HabitStatus[] };
export type Stats = {
  currentStreak: number;
  bestStreak: number;
  cleanDays: number;
  monthRate: number;
  firstDay: string | null;
};
export type Weight = { date: string; kg: number };
export type Profile = { goalKg: number | null; heightCm: number | null };

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = await getApiUrl();
  let res: Response;
  try {
    res = await fetch(base + path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(`Sunucuya ulaşılamadı (${base}). Backend çalışıyor mu, telefon aynı Wi-Fi'de mi?`);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message || `Sunucu hatası (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const t = () => `today=${todayIso()}`;

export const api = {
  summary: () => request<Summary>(`/api/summary?${t()}`),
  stats: () => request<Stats>(`/api/stats?${t()}`),
  range: (from: string, to: string) => request<DayScore[]>(`/api/days?from=${from}&to=${to}`),
  day: (date: string) => request<DayDetail>(`/api/days/${date}`),
  setDone: (date: string, habitId: number, done: boolean) =>
    request<Summary>(`/api/days/${date}/habits/${habitId}?${t()}`, {
      method: "PUT",
      body: JSON.stringify({ done }),
    }),
  weights: () => request<Weight[]>(`/api/weights`),
  saveWeight: (date: string, kg: number) =>
    request<Weight>(`/api/weights/${date}?${t()}`, { method: "PUT", body: JSON.stringify({ kg }) }),
  deleteWeight: (date: string) => request<void>(`/api/weights/${date}`, { method: "DELETE" }),
  profile: () => request<Profile>(`/api/profile`),
  saveProfile: (p: Profile) => request<Profile>(`/api/profile`, { method: "PUT", body: JSON.stringify(p) }),
};

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu.";
}
