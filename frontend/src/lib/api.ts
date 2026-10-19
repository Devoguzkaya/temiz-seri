export type HabitStatus = { id: number; name: string; hint: string; done: boolean };
export type DayScore = { date: string; done: number; total: number };
export type Summary = {
  today: string;
  habits: HabitStatus[];
  streak: number;
  streakBeforeToday: number;
  lastSevenDays: DayScore[];
};

/** Cihazın yerel tarihi (YYYY-MM-DD). Sunucu "bugünü" buna göre hesaplar. */
export function localToday(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function request(path: string, init?: RequestInit): Promise<Summary> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Sunucu hatası (${res.status})`);
  }
  return res.json();
}

export function fetchSummary(today: string) {
  return request(`/api/summary?today=${today}`);
}

export function setHabitDone(day: string, habitId: number, done: boolean, today: string) {
  return request(`/api/days/${day}/habits/${habitId}?today=${today}`, {
    method: "PUT",
    body: JSON.stringify({ done }),
  });
}
