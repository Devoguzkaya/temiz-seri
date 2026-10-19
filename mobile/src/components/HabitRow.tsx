import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import type { HabitStatus } from "../lib/api";
import { useTheme } from "../theme";
import { CheckIcon } from "./icons";
import { T } from "./ui";

export function HabitRow({ habit, onToggle }: { habit: HabitStatus; onToggle: () => void }) {
  const { c } = useTheme();
  const on = habit.done;

  const press = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(on ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onToggle();
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={habit.name}
      onPress={press}
      style={({ pressed }) => [
        styles.row,
        { borderColor: on ? c.accent : c.line, backgroundColor: on ? c.accentSoft : "transparent", transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <View style={[styles.box, { borderColor: on ? c.accent : c.muted, backgroundColor: on ? c.accent : "transparent" }]}>
        {on && <CheckIcon color={c.onAccent} />}
      </View>
      <View style={{ flex: 1 }}>
        <T variant="title">{habit.name}</T>
        <T variant="hint">{habit.hint}</T>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  box: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
