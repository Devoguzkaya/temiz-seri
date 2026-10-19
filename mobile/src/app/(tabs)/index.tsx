import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { HabitRow } from "../../components/HabitRow";
import { FlameIcon } from "../../components/icons";
import { ProgressRing } from "../../components/ProgressRing";
import { Button, Card, ErrorBanner, Header, Loading, Screen, T } from "../../components/ui";
import { WeekBars } from "../../components/WeekBars";
import { api, errorMessage, type Summary, type Weight } from "../../lib/api";
import { greeting, longDate } from "../../lib/dates";
import { useLoad } from "../../lib/useLoad";
import { fonts, useTheme } from "../../theme";

function streakNote(s: Summary, complete: boolean) {
  if (complete) return s.streak === 1 ? "Seri bugün başladı. Yarın da devam." : `Bugün de dahil ${s.streak} gün üst üste 4/4.`;
  if (s.streakBeforeToday > 0)
    return `Dün dahil ${s.streakBeforeToday} gün temiz. Bugünü tamamlarsan ${s.streakBeforeToday + 1} olur.`;
  return "Bugün dördünü de işaretlersen seri başlar.";
}

export default function TodayScreen() {
  const { c } = useTheme();
  const { data, setData, error, setError, refreshing, refresh, reload } = useLoad(async () => {
    const [summary, weights] = await Promise.all([api.summary(), api.weights().catch(() => [] as Weight[])]);
    return { summary, weights };
  });

  const toggle = async (habitId: number) => {
    if (!data) return;
    const { summary } = data;
    const habit = summary.habits.find((h) => h.id === habitId);
    if (!habit) return;
    const previous = data;
    const done = !habit.done;
    setData({ ...data, summary: { ...summary, habits: summary.habits.map((h) => (h.id === habitId ? { ...h, done } : h)) } });
    try {
      const next = await api.setDone(summary.today, habitId, done);
      setData((d) => (d ? { ...d, summary: next } : d));
      setError(null);
    } catch (e) {
      setData(previous);
      setError(errorMessage(e));
    }
  };

  const s = data?.summary;
  const doneCount = s?.habits.filter((h) => h.done).length ?? 0;
  const complete = !!s && s.habits.length > 0 && doneCount === s.habits.length;
  const weights = data?.weights ?? [];
  const lastWeight = weights[weights.length - 1];
  const firstWeight = weights[0];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Header
        eyebrow={greeting()}
        title={s ? longDate(s.today) : " "}
        right={
          s && (
            <View style={[styles.badge, { backgroundColor: c.goldSoft, borderColor: c.gold + "55" }]}>
              <FlameIcon color={c.gold} />
              <T style={{ fontFamily: fonts.monoBold, fontSize: 20 }} color={c.gold}>
                {s.streak}
              </T>
            </View>
          )
        }
      />

      {error && <ErrorBanner message={error} onRetry={reload} />}

      {!s ? (
        !error && <Loading />
      ) : (
        <>
          <Card style={styles.hero}>
            <ProgressRing done={doneCount} total={s.habits.length} />
            <View style={{ flex: 1, gap: 4 }}>
              <T variant="label" color={complete ? c.gold : c.muted}>
                {complete ? "Temiz gün" : "Temiz seri"}
              </T>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                <T style={{ fontFamily: fonts.monoBold, fontSize: 34, lineHeight: 40 }} color={c.gold}>
                  {s.streak}
                </T>
                <T variant="title" color={c.gold}>
                  gün
                </T>
              </View>
              <T variant="small" color={c.muted}>
                {streakNote(s, complete)}
              </T>
            </View>
          </Card>

          <Card style={{ gap: 8 }}>
            <View style={styles.rowBetween}>
              <T variant="label">Bugünkü işaretler</T>
              <T variant="mono" color={complete ? c.accent : c.muted}>
                {doneCount}/{s.habits.length}
              </T>
            </View>
            {s.habits.map((h) => (
              <HabitRow key={h.id} habit={h} onToggle={() => toggle(h.id)} />
            ))}
          </Card>

          <Card>
            <View style={styles.rowBetween}>
              <T variant="label">Son 7 gün</T>
              <T variant="hint" onPress={() => router.navigate("/takvim")} color={c.accent} style={{ fontFamily: fonts.semibold }}>
                Takvim
              </T>
            </View>
            <WeekBars days={s.lastSevenDays} />
          </Card>

          <Card style={styles.weight}>
            <View style={{ flex: 1 }}>
              <T variant="label">Kilo</T>
              {lastWeight ? (
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                  <T style={{ fontFamily: fonts.monoBold, fontSize: 24 }}>{lastWeight.kg.toFixed(1)}</T>
                  <T variant="hint">kg</T>
                  {firstWeight && firstWeight !== lastWeight && (
                    <T variant="mono" color={lastWeight.kg <= firstWeight.kg ? c.accent : c.danger}>
                      {lastWeight.kg <= firstWeight.kg ? "−" : "+"}
                      {Math.abs(lastWeight.kg - firstWeight.kg).toFixed(1)}
                    </T>
                  )}
                </View>
              ) : (
                <T variant="small" color={c.muted} style={{ marginTop: 4 }}>
                  Henüz kilo girmedin.
                </T>
              )}
            </View>
            <Button title="Kilo gir" kind="secondary" onPress={() => router.navigate("/kilo")} />
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  hero: { flexDirection: "row", alignItems: "center", gap: 18 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  weight: { flexDirection: "row", alignItems: "center", gap: 12 },
});
