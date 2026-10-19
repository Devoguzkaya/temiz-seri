import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts, useTheme } from "../theme";

type TVariant = "body" | "small" | "title" | "h1" | "label" | "mono" | "hint";

const variants: Record<TVariant, TextStyle> = {
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  title: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  h1: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 32 },
  label: { fontFamily: fonts.mono, fontSize: 11.5, letterSpacing: 0.9 },
  mono: { fontFamily: fonts.monoBold, fontSize: 14, fontVariant: ["tabular-nums"] },
};

/** Türkçe büyük harf: textTransform "i"yi "I" yapar, bu yüzden elle çeviriyoruz. */
const trUpper = (s: string) => s.replace(/i/g, "İ").toUpperCase();

export function T({
  variant = "body",
  color,
  style,
  children,
  ...rest
}: TextProps & { variant?: TVariant; color?: string }) {
  const { c } = useTheme();
  const muted = variant === "label" || variant === "hint";
  return (
    <Text {...rest} style={[variants[variant], { color: color ?? (muted ? c.muted : c.fg) }, style]}>
      {variant === "label" && typeof children === "string" ? trUpper(children) : children}
    </Text>
  );
}

export function Screen({
  children,
  refreshing,
  onRefresh,
  underHeader,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Üstte gezinme başlığı varsa güvenli alan boşluğu eklenmez */
  underHeader?: boolean;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={[styles.screen, { paddingTop: underHeader ? 8 : insets.top + 12 }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.accent} colors={[c.accent]} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }, style]}>{children}</View>;
}

export function Header({ eyebrow, title, right }: { eyebrow: string; title: string; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <T variant="label">{eyebrow}</T>
        <T variant="h1" style={{ marginTop: 2 }}>
          {title}
        </T>
      </View>
      {right}
    </View>
  );
}

export function Button({
  title,
  onPress,
  kind = "primary",
  disabled,
  busy,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  kind?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  busy?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const bg = kind === "primary" ? c.accent : kind === "danger" ? c.dangerSoft : "transparent";
  const fg = kind === "primary" ? c.onAccent : kind === "danger" ? c.danger : c.fg;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: kind === "secondary" ? c.line : bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={fg} /> : icon}
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: fg }}>{title}</Text>
    </Pressable>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="alert" style={[styles.error, { backgroundColor: c.dangerSoft, borderColor: c.danger }]}>
      <T variant="small" color={c.danger} style={{ flex: 1 }}>
        {message}
      </T>
      {onRetry && (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text style={{ fontFamily: fonts.semibold, color: c.danger, textDecorationLine: "underline" }}>Tekrar dene</Text>
        </Pressable>
      )}
    </View>
  );
}

export function Loading() {
  const { c } = useTheme();
  return (
    <View style={{ paddingVertical: 64, alignItems: "center" }}>
      <ActivityIndicator color={c.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 16, paddingBottom: 32, gap: 14, width: "100%", maxWidth: 520, alignSelf: "center" },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  header: { flexDirection: "row", alignItems: "flex-end", gap: 12, paddingTop: 4, paddingBottom: 2 },
  button: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  error: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 12, padding: 12 },
});
