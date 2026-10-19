import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, TextInput, View } from "react-native";
import { MinusIcon, PlusIcon } from "../../components/icons";
import { Button, Card, Header, Screen, T } from "../../components/ui";
import { api, errorMessage } from "../../lib/api";
import { applyReminder } from "../../lib/notifications";
import { DEFAULT_REMINDER, defaultApiUrl, getApiUrl, getReminder, saveReminder, setApiUrl, type Reminder } from "../../lib/settings";
import { fonts, useTheme } from "../../theme";

type Note = { text: string; ok: boolean } | null;

function Stepper({ value, onChange, label }: { value: string; onChange: (dir: -1 | 1) => void; label: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.stepper, { borderColor: c.line }]}>
      <Pressable onPress={() => onChange(-1)} hitSlop={6} style={styles.stepBtn} accessibilityLabel={`${label} azalt`}>
        <MinusIcon color={c.fg} />
      </Pressable>
      <T style={{ fontFamily: fonts.monoBold, fontSize: 22, minWidth: 34, textAlign: "center" }}>{value}</T>
      <Pressable onPress={() => onChange(1)} hitSlop={6} style={styles.stepBtn} accessibilityLabel={`${label} artır`}>
        <PlusIcon color={c.fg} />
      </Pressable>
    </View>
  );
}

function NoteText({ note }: { note: Note }) {
  const { c } = useTheme();
  if (!note) return null;
  return (
    <T variant="hint" color={note.ok ? c.accent : c.danger}>
      {note.text}
    </T>
  );
}

export default function SettingsScreen() {
  const { c } = useTheme();
  const [reminder, setReminder] = useState<Reminder>(DEFAULT_REMINDER);
  const [reminderNote, setReminderNote] = useState<Note>(null);
  const [goal, setGoal] = useState("");
  const [height, setHeight] = useState("");
  const [profileNote, setProfileNote] = useState<Note>(null);
  const [url, setUrl] = useState("");
  const [urlNote, setUrlNote] = useState<Note>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    getReminder().then(setReminder);
    getApiUrl().then(setUrl);
    api
      .profile()
      .then((p) => {
        setGoal(p.goalKg != null ? String(p.goalKg).replace(".", ",") : "");
        setHeight(p.heightCm != null ? String(p.heightCm) : "");
      })
      .catch(() => {});
  }, []);

  const updateReminder = async (next: Reminder) => {
    setReminder(next);
    await saveReminder(next);
    const problem = await applyReminder(next);
    setReminderNote(
      problem
        ? { text: problem, ok: false }
        : next.enabled
          ? { text: `Her gün ${pad(next.hour)}:${pad(next.minute)}'da hatırlatacağım.`, ok: true }
          : null,
    );
  };

  const saveProfile = async () => {
    const g = goal.trim() ? Number(goal.replace(",", ".")) : null;
    const h = height.trim() ? Number(height) : null;
    if ((g != null && !Number.isFinite(g)) || (h != null && !Number.isInteger(h))) {
      setProfileNote({ text: "Hedef kilo ve boy sayı olmalı.", ok: false });
      return;
    }
    setBusy("profile");
    try {
      await api.saveProfile({ goalKg: g, heightCm: h });
      setProfileNote({ text: "Kaydedildi.", ok: true });
    } catch (e) {
      setProfileNote({ text: errorMessage(e), ok: false });
    } finally {
      setBusy(null);
    }
  };

  const saveUrl = async () => {
    setBusy("url");
    const saved = await setApiUrl(url);
    setUrl(saved);
    try {
      await api.summary();
      setUrlNote({ text: `Bağlantı kuruldu: ${saved}`, ok: true });
    } catch (e) {
      setUrlNote({ text: errorMessage(e), ok: false });
    } finally {
      setBusy(null);
    }
  };

  const inputStyle = [styles.input, { color: c.fg, borderColor: c.line, backgroundColor: c.bg }];

  return (
    <Screen>
      <Header eyebrow="Uygulama" title="Ayarlar" />

      <Card style={{ gap: 12 }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <T variant="title">Günlük hatırlatma</T>
            <T variant="hint">İşaretlemeyi unutmaman için her gün bir bildirim.</T>
          </View>
          <Switch
            value={reminder.enabled}
            onValueChange={(enabled) => updateReminder({ ...reminder, enabled })}
            trackColor={{ true: c.accent, false: c.empty }}
            thumbColor={c.card}
          />
        </View>
        {reminder.enabled && (
          <View style={[styles.rowBetween, { justifyContent: "center", gap: 10 }]}>
            <Stepper
              label="Saat"
              value={pad(reminder.hour)}
              onChange={(d) => updateReminder({ ...reminder, hour: (reminder.hour + d + 24) % 24 })}
            />
            <T style={{ fontFamily: fonts.monoBold, fontSize: 22 }}>:</T>
            <Stepper
              label="Dakika"
              value={pad(reminder.minute)}
              onChange={(d) => updateReminder({ ...reminder, minute: (reminder.minute + d * 15 + 60) % 60 })}
            />
          </View>
        )}
        <NoteText note={reminderNote} />
      </Card>

      <Card style={{ gap: 12 }}>
        <T variant="title">Hedef</T>
        <View style={styles.fields}>
          <View style={{ flex: 1, gap: 6 }}>
            <T variant="label">Hedef kilo (kg)</T>
            <TextInput value={goal} onChangeText={setGoal} keyboardType="decimal-pad" placeholder="ör. 80" placeholderTextColor={c.muted} style={inputStyle} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <T variant="label">Boy (cm)</T>
            <TextInput value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="ör. 178" placeholderTextColor={c.muted} style={inputStyle} />
          </View>
        </View>
        <Button title="Kaydet" onPress={saveProfile} busy={busy === "profile"} />
        <NoteText note={profileNote} />
      </Card>

      <Card style={{ gap: 12 }}>
        <View>
          <T variant="title">Sunucu adresi</T>
          <T variant="hint">Bilgisayarında çalışan Spring Boot sunucusu. Boş bırakırsan otomatik bulunur: {defaultApiUrl()}</T>
        </View>
        <TextInput
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder={defaultApiUrl()}
          placeholderTextColor={c.muted}
          style={[inputStyle, { fontFamily: fonts.mono, fontSize: 15 }]}
        />
        <Button title="Kaydet ve bağlantıyı dene" kind="secondary" onPress={saveUrl} busy={busy === "url"} />
        <NoteText note={urlNote} />
      </Card>

      <T variant="hint" style={{ textAlign: "center" }}>
        Temiz Seri {Constants.expoConfig?.version ?? ""}
      </T>
    </Screen>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

const styles = StyleSheet.create({
  rowBetween: { flexDirection: "row", alignItems: "center", gap: 12 },
  fields: { flexDirection: "row", gap: 12 },
  input: { height: 48, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, fontFamily: fonts.monoBold, fontSize: 18 },
  stepper: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 4 },
  stepBtn: { width: 40, height: 44, alignItems: "center", justifyContent: "center" },
});
