import { useColorScheme } from "react-native";

const light = {
  bg: "#F6F1E4",
  card: "#FFFDF6",
  line: "#E4DCC8",
  fg: "#22281F",
  muted: "#6B6F60",
  accent: "#2F5D3A",
  accentSoft: "#E2EBDC",
  onAccent: "#FDFBF3",
  gold: "#B7791F",
  goldSoft: "#F6E6C3",
  empty: "#E9E2CF",
  danger: "#A33A2B",
  dangerSoft: "#F6DED8",
};

export type Palette = typeof light;

const dark: Palette = {
  bg: "#161A15",
  card: "#1F241E",
  line: "#313A2F",
  fg: "#ECE8DA",
  muted: "#A2A593",
  accent: "#7FBF8A",
  accentSoft: "#263A2A",
  onAccent: "#10180F",
  gold: "#E3A94A",
  goldSoft: "#3A2F1A",
  empty: "#2C3329",
  danger: "#E58A7A",
  dangerSoft: "#3A221D",
};

export const fonts = {
  regular: "IBMPlexSans_400Regular",
  medium: "IBMPlexSans_500Medium",
  semibold: "IBMPlexSans_600SemiBold",
  bold: "IBMPlexSans_700Bold",
  mono: "IBMPlexMono_500Medium",
  monoBold: "IBMPlexMono_600SemiBold",
};

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return { c: isDark ? dark : light, isDark };
}

/** Bir gündeki işaret sayısına göre takvim/çubuk rengi. */
export function scoreColor(c: Palette, done: number, total: number) {
  if (total > 0 && done >= total) return c.gold;
  if (done === 0) return c.empty;
  return c.accent;
}
