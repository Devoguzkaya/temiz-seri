import HabitList from "./components/HabitList";
import TodayCard from "./components/TodayCard";
import WeekChart from "./components/WeekChart";
import { useSummary } from "./lib/useSummary";

export default function App() {
  const { summary, error, toggle, reload } = useSummary();

  return (
    <main className="mx-auto flex max-w-[460px] flex-col gap-3.5 px-[max(16px,env(safe-area-inset-left))] pt-[max(20px,env(safe-area-inset-top))] pb-8">
      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-danger/40 px-4 py-3 text-sm text-danger">
          <span>{error}</span>
          <button type="button" onClick={reload} className="font-semibold underline underline-offset-2">
            Tekrar dene
          </button>
        </div>
      )}

      {summary ? (
        <>
          <TodayCard
            today={summary.today}
            streak={summary.streak}
            streakBeforeToday={summary.streakBeforeToday}
            todayComplete={summary.habits.length > 0 && summary.habits.every((h) => h.done)}
          />
          <HabitList habits={summary.habits} onToggle={toggle} />
          <WeekChart days={summary.lastSevenDays} />
        </>
      ) : (
        !error && <p className="py-16 text-center text-sm text-muted">Yükleniyor…</p>
      )}
    </main>
  );
}
