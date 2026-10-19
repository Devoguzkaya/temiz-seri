import type { HabitStatus } from "../lib/api";

type Props = { habits: HabitStatus[]; onToggle: (id: number) => void };

export default function HabitList({ habits, onToggle }: Props) {
  const done = habits.filter((h) => h.done).length;
  const complete = habits.length > 0 && done === habits.length;

  return (
    <section className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">Bugünkü işaretler</p>
        <span className={`font-mono text-[13px] tabular-nums ${complete ? "font-semibold text-accent" : "text-muted"}`}>
          {done}/{habits.length}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {habits.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              aria-pressed={h.done}
              onClick={() => onToggle(h.id)}
              className={`group flex min-h-[60px] w-full cursor-pointer items-center gap-3.5 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none ${
                h.done ? "border-accent bg-accent-soft" : "border-line bg-transparent"
              }`}
            >
              <span
                className={`grid size-7 flex-none place-items-center rounded-lg border-2 transition-colors ${
                  h.done ? "border-accent bg-accent" : "border-muted"
                }`}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className={`size-4 transition-all ${h.done ? "scale-100 opacity-100" : "scale-60 opacity-0"}`}
                >
                  <path d="M3 8.5l3.2 3L13 4.5" className="stroke-on-accent" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold">{h.name}</span>
                <span className="text-[13px] text-muted">{h.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {complete && <p className="mt-2.5 text-sm font-semibold text-accent">Dördü de tamam. Bugün seriye eklendi.</p>}
    </section>
  );
}
