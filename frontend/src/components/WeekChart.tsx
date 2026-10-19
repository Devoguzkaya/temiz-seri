import type { DayScore } from "../lib/api";

const SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function parse(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function WeekChart({ days }: { days: DayScore[] }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-4">
      <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">Son 7 gün</p>

      <div className="mt-3 grid grid-cols-7 items-end gap-2">
        {days.map((day, i) => {
          const isToday = i === days.length - 1;
          const full = day.total > 0 && day.done >= day.total;
          const date = parse(day.date);
          return (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1.5"
              aria-label={`${date.toLocaleDateString("tr-TR", { weekday: "long" })}: ${day.done}/${day.total}`}
            >
              <span className="font-mono text-xs font-semibold tabular-nums">{day.done}</span>
              <div className="flex h-[88px] w-full max-w-[34px] flex-col-reverse gap-[3px] overflow-hidden rounded-lg bg-empty p-[3px]">
                {Array.from({ length: day.total }, (_, s) => (
                  <span
                    key={s}
                    className={`flex-1 rounded-[5px] ${s < day.done ? (full ? "bg-gold" : "bg-accent") : "bg-transparent"}`}
                  />
                ))}
              </div>
              <span className={`text-xs ${isToday ? "font-bold text-fg" : "text-muted"}`}>
                {isToday ? "Bugün" : SHORT[date.getDay()]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3.5 text-[12.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-2.5 rounded-[3px] bg-accent" />
          Yapılan alışkanlık
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-2.5 rounded-[3px] bg-gold" />
          4/4 temiz gün
        </span>
      </div>
    </section>
  );
}
