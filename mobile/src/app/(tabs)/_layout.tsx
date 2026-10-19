import { Tabs } from "expo-router/js-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarIcon, ScaleIcon, SettingsIcon, TodayIcon } from "../../components/icons";
import { fonts, useTheme } from "../../theme";

export default function TabLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.line,
          height: 68 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
        tabBarItemStyle: { height: 56 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Bugün", tabBarIcon: ({ color }) => <TodayIcon color={String(color)} /> }} />
      <Tabs.Screen name="takvim" options={{ title: "Takvim", tabBarIcon: ({ color }) => <CalendarIcon color={String(color)} /> }} />
      <Tabs.Screen name="kilo" options={{ title: "Kilo", tabBarIcon: ({ color }) => <ScaleIcon color={String(color)} /> }} />
      <Tabs.Screen name="ayarlar" options={{ title: "Ayarlar", tabBarIcon: ({ color }) => <SettingsIcon color={String(color)} /> }} />
    </Tabs>
  );
}
