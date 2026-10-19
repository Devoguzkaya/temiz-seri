type Props = { today: string; streak: number; streakBeforeToday: number; todayComplete: boolean };

function formatToday(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
}

function streakNote({ streak, streakBeforeToday, todayComplete }: Omit<Props, "today">) {
  if (todayComplete) {
    return streak === 1 ? "Seri bugün başladı. Yarın da devam." : `Bugün de dahil ${streak} gün üst üste 4/4.`;
  }
  if (streakBeforeToday > 0) {
    return `Dün dahil ${streakBeforeToday} gün temiz. Bugünü tamamlarsan ${streakBeforeToday + 1} olur.`;
  }
  return "Bugün dördünü de işaretlersen seri başlar.";
}

export default function TodayCard(props: Props) {
  return (
    <section className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">Bugün</p>
          <h1 className="mt-0.5 text-[22px] font-semibold text-balance">{formatToday(props.today)}</h1>
        </div>
        <div
          aria-live="polite"
          className="flex min-w-[84px] flex-none flex-col items-center rounded-xl border border-gold/35 bg-gold-soft px-3 py-2 text-gold"
        >
          <b className="font-mono text-[30px] leading-none font-semibold tabular-nums">{props.streak}</b>
          <span className="mt-1 text-xs font-semibold">gün temiz</span>
        </div>
      </div>
      <p className="mt-2.5 text-sm text-muted">{streakNote(props)}</p>
    </section>
  );
}
