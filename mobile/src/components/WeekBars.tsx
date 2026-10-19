import { StyleSheet, View } from "react-native";
import type { DayScore } from "../lib/api";
import { SHORT_DAYS, fromIso } from "../lib/dates";
import { fonts, useTheme } from "../theme";
import { T } from "./ui";

export function WeekBars({ days }: { days: DayScore[] }) {
  const { c } = useTheme();
  return (
    <View>
      <View style={styles.grid}>
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          const full = d.total > 0 && d.done >= d.total;
          return (
            <View key={d.date} style={styles.col} accessibilityLabel={`${d.date}: ${d.done}/${d.total}`}>
              <T style={{ fontFamily: fonts.monoBold, fontSize: 12 }}>{d.done}</T>
              <View style={[styles.bar, { backgroundColor: c.empty }]}>
                {Array.from({ length: d.total }, (_, s) => (
                  <View
                    key={s}
                    style={[styles.seg, { backgroundColor: s < d.done ? (full ? c.gold : c.accent) : "transparent" }]}
                  />
                ))}
              </View>
              <T
                variant="hint"
                color={isToday ? c.fg : c.muted}
                style={isToday ? { fontFamily: fonts.bold } : undefined}
              >
                {isToday ? "Bugün" : SHORT_DAYS[fromIso(d.date).getDay()]}
              </T>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <Legend color={c.accent} label="Yapılan alışkanlık" />
        <Legend color={c.gold} label="4/4 temiz gün" />
      </View>
    </View>
  );
}

export function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
      <T variant="hint">{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "flex-end" },
  col: { flex: 1, alignItems: "center", gap: 6 },
  bar: { width: "100%", maxWidth: 36, height: 92, borderRadius: 9, padding: 3, gap: 3, flexDirection: "column-reverse" },
  seg: { flex: 1, borderRadius: 5 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 12 },
});
