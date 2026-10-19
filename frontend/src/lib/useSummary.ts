import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSummary, localToday, setHabitDone, type Summary } from "./api";

export function useSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const todayRef = useRef(localToday());

  const load = useCallback(async () => {
    todayRef.current = localToday();
    try {
      setSummary(await fetchSummary(todayRef.current));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Veriler alınamadı.");
    }
  }, []);

  useEffect(() => {
    load();
    // Uygulamaya dönünce ya da gece yarısı geçince günü yenile
    const onVisible = () => document.visibilityState === "visible" && load();
    const timer = setInterval(() => localToday() !== todayRef.current && load(), 30_000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const toggle = useCallback(
    async (habitId: number) => {
      if (!summary) return;
      const habit = summary.habits.find((h) => h.id === habitId);
      if (!habit) return;
      const previous = summary;
      const done = !habit.done;

      // İyimser güncelleme: dokunuş anında görünsün, sunucu cevabıyla düzelsin
      setSummary({
        ...summary,
        habits: summary.habits.map((h) => (h.id === habitId ? { ...h, done } : h)),
      });
      try {
        setSummary(await setHabitDone(summary.today, habitId, done, summary.today));
        setError(null);
      } catch (e) {
        setSummary(previous);
        setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      }
    },
    [summary],
  );

  return { summary, error, toggle, reload: load };
}
