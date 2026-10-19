import { Pressable, StyleSheet, View } from "react-native";
import type { DayScore } from "../lib/api";
import { toIso } from "../lib/dates";
import { fonts, useTheme } from "../theme";
import { T } from "./ui";

const WEEK_HEAD = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

type Props = {
  year: number;
  month: number; // 0-11
  scores: Record<string, DayScore>;
  today: string;
  onSelect: (date: string) => void;
};

/** Pazartesi ile başlayan ay görünümü. Her gün, o gün yapılan alışkanlık sayısına göre boyanır. */
export function MonthCalendar({ year, month, scores, today, onSelect }: Props) {
  const { c } = useTheme();
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toIso(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7) cells.push(null);

  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  return (
    <View style={{ gap: 6 }}>
      <View style={styles.row}>
        {WEEK_HEAD.map((d) => (
          <T key={d} variant="hint" style={styles.head}>
            {d}
          </T>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.row}>
          {week.map((iso, di) => {
            if (!iso) return <View key={di} style={styles.cell} />;
            const s = scores[iso];
            const done = s?.done ?? 0;
            const total = s?.total ?? 4;
            const future = iso > today;
            const full = done >= total && total > 0;
            const isToday = iso === today;
            const bg = future ? "transparent" : full ? c.gold : done > 0 ? c.accent + ["", "40", "70", "A8"][done] : c.empty;
            const fg = full ? c.onAccent : done >= 3 ? c.onAccent : future ? c.muted : c.fg;
            return (
              <Pressable
                key={iso}
                disabled={future}
                onPress={() => onSelect(iso)}
                accessibilityRole="button"
                accessibilityLabel={`${iso}, ${done}/${total}`}
                style={({ pressed }) => [
                  styles.cell,
                  styles.day,
                  {
                    backgroundColor: bg,
                    borderColor: isToday ? c.fg : "transparent",
                    opacity: future ? 0.4 : pressed ? 0.7 : 1,
                  },
                ]}
              >
                <T style={{ fontFamily: isToday ? fonts.monoBold : fonts.mono, fontSize: 14 }} color={fg}>
                  {Number(iso.slice(8))}
                </T>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  head: { flex: 1, textAlign: "center" },
  cell: { flex: 1, aspectRatio: 1, maxHeight: 54 },
  day: { borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
