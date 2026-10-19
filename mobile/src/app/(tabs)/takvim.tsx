import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronIcon } from "../../components/icons";
import { MonthCalendar } from "../../components/MonthCalendar";
import { StatTile } from "../../components/StatTile";
import { Card, ErrorBanner, Header, Loading, Screen, T } from "../../components/ui";
import { Legend } from "../../components/WeekBars";
import { api, type DayScore } from "../../lib/api";
import { MONTHS, toIso, todayIso } from "../../lib/dates";
import { useLoad } from "../../lib/useLoad";
import { useTheme } from "../../theme";

export default function CalendarScreen() {
  const { c } = useTheme();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const today = todayIso();

  const { data, error, refreshing, refresh, reload } = useLoad(async () => {
    const from = toIso(new Date(cursor.year, cursor.month, 1));
    const to = toIso(new Date(cursor.year, cursor.month + 1, 0));
    const [stats, days] = await Promise.all([api.stats(), api.range(from, to)]);
    const scores: Record<string, DayScore> = {};
    days.forEach((d) => (scores[d.date] = d));
    return { stats, scores, key: `${cursor.year}-${cursor.month}` };
  });

  const shift = (n: number) => {
    const d = new Date(cursor.year, cursor.month + n, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };
  const isCurrentMonth = cursor.year === now.getFullYear() && cursor.month === now.getMonth();
  const stale = !!data && data.key !== `${cursor.year}-${cursor.month}`;

  // Ay değişince yeniden yükle (ilk yükleme ekran odaklanınca zaten yapılıyor)
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) reload();
    mounted.current = true;
  }, [cursor, reload]);

  const stats = data?.stats;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Header eyebrow="Geçmiş" title="Takvim" />
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {!data ? (
        !error && <Loading />
      ) : (
        <>
          <View style={styles.tiles}>
            <StatTile label="Mevcut seri" value={String(stats!.currentStreak)} unit="gün" tone="gold" />
            <StatTile label="En uzun seri" value={String(stats!.bestStreak)} unit="gün" />
            <StatTile label="Temiz gün" value={String(stats!.cleanDays)} unit="toplam" />
            <StatTile label="Bu ay" value={`%${Math.round(stats!.monthRate * 100)}`} unit="işaret" />
          </View>

          <Card style={{ gap: 14 }}>
            <View style={styles.monthBar}>
              <Pressable onPress={() => shift(-1)} hitSlop={10} accessibilityLabel="Önceki ay" style={styles.nav}>
                <ChevronIcon dir="left" color={c.fg} />
              </Pressable>
              <T variant="title">
                {MONTHS[cursor.month]} {cursor.year}
              </T>
              <Pressable
                onPress={() => shift(1)}
                disabled={isCurrentMonth}
                hitSlop={10}
                accessibilityLabel="Sonraki ay"
                style={[styles.nav, { opacity: isCurrentMonth ? 0.3 : 1 }]}
              >
                <ChevronIcon dir="right" color={c.fg} />
              </Pressable>
            </View>

            <View style={{ opacity: stale ? 0.4 : 1 }}>
              <MonthCalendar
                year={cursor.year}
                month={cursor.month}
                scores={data.scores}
                today={today}
                onSelect={(iso) => router.push({ pathname: "/gun/[date]", params: { date: iso } })}
              />
            </View>

            <View style={styles.legend}>
              <Legend color={c.empty} label="0" />
              <Legend color={c.accent + "70"} label="1-3" />
              <Legend color={c.gold} label="4/4" />
            </View>
            <T variant="hint">Bir güne dokunarak o günün işaretlerini düzeltebilirsin.</T>
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  monthBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nav: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  legend: { flexDirection: "row", gap: 14 },
});
