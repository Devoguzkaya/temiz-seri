import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { HabitRow } from "../../components/HabitRow";
import { Button, Card, ErrorBanner, Loading, Screen, T } from "../../components/ui";
import { api, errorMessage } from "../../lib/api";
import { longDate, todayIso } from "../../lib/dates";
import { useLoad } from "../../lib/useLoad";
import { useTheme } from "../../theme";

export default function EditDayScreen() {
  const { c } = useTheme();
  const { date } = useLocalSearchParams<{ date: string }>();
  const [changed, setChanged] = useState(false);
  const { data, setData, error, setError, reload } = useLoad(() => api.day(date));

  const toggle = async (habitId: number) => {
    if (!data) return;
    const previous = data;
    const habit = data.habits.find((h) => h.id === habitId);
    if (!habit) return;
    setData({ ...data, habits: data.habits.map((h) => (h.id === habitId ? { ...h, done: !h.done } : h)) });
    try {
      await api.setDone(date, habitId, !habit.done);
      setChanged(true);
      setError(null);
    } catch (e) {
      setData(previous);
      setError(errorMessage(e));
    }
  };

  const done = data?.habits.filter((h) => h.done).length ?? 0;
  const total = data?.habits.length ?? 4;

  return (
    <Screen underHeader>
      <View style={{ gap: 2 }}>
        <T variant="label">{date === todayIso() ? "Bugün" : "Geçmiş gün"}</T>
        <T variant="h1">{longDate(date)}</T>
      </View>
      {error && <ErrorBanner message={error} onRetry={reload} />}
      {!data ? (
        !error && <Loading />
      ) : (
        <Card style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <T variant="label">İşaretler</T>
            <T variant="mono" color={done === total ? c.gold : c.muted}>
              {done}/{total}
            </T>
          </View>
          {data.habits.map((h) => (
            <HabitRow key={h.id} habit={h} onToggle={() => toggle(h.id)} />
          ))}
          <T variant="hint" style={{ marginTop: 4 }}>
            {changed ? "Kaydedildi. Seri ve istatistikler yeniden hesaplandı." : "Değişiklikler dokunduğun anda kaydedilir."}
          </T>
        </Card>
      )}
      <Button title="Tamam" kind="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
