import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ChevronIcon, TrashIcon } from "../../components/icons";
import { StatTile } from "../../components/StatTile";
import { Button, Card, ErrorBanner, Header, Loading, Screen, T } from "../../components/ui";
import { WeightChart } from "../../components/WeightChart";
import { api, errorMessage, type Weight } from "../../lib/api";
import { addDays, longDate, shortDate, todayIso } from "../../lib/dates";
import { useLoad } from "../../lib/useLoad";
import { fonts, useTheme } from "../../theme";

const RANGES = [
  { key: "30", label: "30 gün", days: 30 },
  { key: "90", label: "90 gün", days: 90 },
  { key: "all", label: "Tümü", days: null },
] as const;

function parseKg(text: string): number | null {
  const n = Number(text.replace(",", ".").trim());
  return Number.isFinite(n) && n >= 20 && n <= 400 ? Math.round(n * 10) / 10 : null;
}

export default function WeightScreen() {
  const { c } = useTheme();
  const today = todayIso();
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("90");
  const [date, setDate] = useState(today);
  // null: kullanıcı yazmadı, öneri gösterilir
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);

  const { data, setData, error, setError, refreshing, refresh, reload } = useLoad(async () => {
    const [weights, profile] = await Promise.all([api.weights(), api.profile()]);
    return { weights, profile };
  });

  const weights = data?.weights ?? [];
  const existing = weights.find((w) => w.date === date);

  // Seçili günün kaydı varsa onu, yoksa son kiloyu öner
  const suggestion = existing ?? weights[weights.length - 1];
  const input = draft ?? (suggestion ? suggestion.kg.toFixed(1) : "");
  const pickDate = (d: string) => {
    setDate(d);
    setDraft(null);
  };

  const kg = parseKg(input);

  const save = async () => {
    if (kg == null || !data) return;
    setSaving(true);
    try {
      const saved = await api.saveWeight(date, kg);
      const next = [...data.weights.filter((w) => w.date !== date), saved].sort((a, b) => a.date.localeCompare(b.date));
      setData({ ...data, weights: next });
      setDraft(null);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (w: Weight) => {
    if (!data) return;
    setConfirm(null);
    try {
      await api.deleteWeight(w.date);
      setData({ ...data, weights: data.weights.filter((x) => x.date !== w.date) });
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const days = RANGES.find((r) => r.key === range)!.days;
  const shown = days == null ? weights : weights.filter((w) => w.date >= addDays(today, -days + 1));
  const first = weights[0];
  const last = weights[weights.length - 1];
  const goal = data?.profile.goalKg ?? null;
  const height = data?.profile.heightCm ?? null;
  const bmi = last && height ? last.kg / (height / 100) ** 2 : null;
  const change = first && last ? last.kg - first.kg : 0;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Header eyebrow="Takip" title="Kilo" />
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {!data ? (
        !error && <Loading />
      ) : (
        <>
          <View style={styles.tiles}>
            <StatTile label="Şu an" value={last ? last.kg.toFixed(1) : "—"} unit="kg" />
            <StatTile
              label="Başlangıçtan"
              value={first && last ? `${change <= 0 ? "−" : "+"}${Math.abs(change).toFixed(1)}` : "—"}
              unit="kg"
              tone={change < 0 ? "gold" : undefined}
            />
            <StatTile
              label="Hedefe kalan"
              value={goal != null && last ? Math.max(0, last.kg - goal).toFixed(1) : "—"}
              unit={goal != null ? "kg" : "hedef yok"}
            />
            <StatTile label="VKİ" value={bmi ? bmi.toFixed(1) : "—"} unit={bmi ? undefined : "boy girilmedi"} />
          </View>

          <Card style={{ gap: 12 }}>
            <View style={styles.rowBetween}>
              <T variant="label">Grafik</T>
              <View style={styles.chips}>
                {RANGES.map((r) => (
                  <Pressable
                    key={r.key}
                    onPress={() => setRange(r.key)}
                    style={[styles.chip, { backgroundColor: range === r.key ? c.accentSoft : "transparent", borderColor: range === r.key ? c.accent : c.line }]}
                  >
                    <T variant="hint" color={range === r.key ? c.accent : c.muted} style={{ fontFamily: fonts.semibold }}>
                      {r.label}
                    </T>
                  </Pressable>
                ))}
              </View>
            </View>
            <WeightChart data={shown} goal={goal} />
          </Card>

          <Card style={{ gap: 12 }}>
            <T variant="label">Kilo gir</T>
            <View style={styles.dateBar}>
              <Pressable onPress={() => pickDate(addDays(date, -1))} hitSlop={10} style={styles.nav} accessibilityLabel="Önceki gün">
                <ChevronIcon dir="left" color={c.fg} />
              </Pressable>
              <T variant="title">{date === today ? "Bugün" : longDate(date)}</T>
              <Pressable
                onPress={() => pickDate(addDays(date, 1))}
                disabled={date >= today}
                hitSlop={10}
                style={[styles.nav, { opacity: date >= today ? 0.3 : 1 }]}
                accessibilityLabel="Sonraki gün"
              >
                <ChevronIcon dir="right" color={c.fg} />
              </Pressable>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setDraft}
                keyboardType="decimal-pad"
                placeholder="ör. 92,4"
                placeholderTextColor={c.muted}
                returnKeyType="done"
                onSubmitEditing={save}
                style={[styles.input, { color: c.fg, borderColor: input && kg == null ? c.danger : c.line, backgroundColor: c.bg }]}
              />
              <T variant="title" color={c.muted}>
                kg
              </T>
              <Button title={existing ? "Güncelle" : "Kaydet"} onPress={save} disabled={kg == null} busy={saving} style={{ flex: 1 }} />
            </View>
            {input !== "" && kg == null && (
              <T variant="hint" color={c.danger}>
                20 ile 400 arasında bir değer gir.
              </T>
            )}
          </Card>

          {weights.length > 0 && (
            <Card style={{ gap: 2 }}>
              <T variant="label" style={{ marginBottom: 6 }}>
                Geçmiş
              </T>
              {[...weights].reverse().slice(0, 30).map((w, i, arr) => {
                const prev = arr[i + 1];
                const diff = prev ? w.kg - prev.kg : null;
                return (
                  <View key={w.date} style={[styles.historyRow, { borderTopColor: c.line, borderTopWidth: i ? 1 : 0 }]}>
                    <T variant="small" style={{ flex: 1 }}>
                      {shortDate(w.date)}
                    </T>
                    {diff != null && diff !== 0 && (
                      <T variant="hint" color={diff < 0 ? c.accent : c.danger} style={{ fontFamily: fonts.mono }}>
                        {diff < 0 ? "−" : "+"}
                        {Math.abs(diff).toFixed(1)}
                      </T>
                    )}
                    <T variant="mono" style={{ width: 64, textAlign: "right" }}>
                      {w.kg.toFixed(1)}
                    </T>
                    {confirm === w.date ? (
                      <View style={{ flexDirection: "row", gap: 12, marginLeft: 8 }}>
                        <T variant="hint" color={c.danger} style={{ fontFamily: fonts.semibold }} onPress={() => remove(w)}>
                          Sil
                        </T>
                        <T variant="hint" onPress={() => setConfirm(null)}>
                          Vazgeç
                        </T>
                      </View>
                    ) : (
                      <Pressable onPress={() => setConfirm(w.date)} hitSlop={8} style={{ marginLeft: 8 }} accessibilityLabel="Kaydı sil">
                        <TrashIcon color={c.muted} />
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  chips: { flexDirection: "row", gap: 6 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  dateBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nav: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: { width: 110, height: 48, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, fontFamily: fonts.monoBold, fontSize: 20 },
  historyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 8 },
});
