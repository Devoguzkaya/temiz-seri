import { StyleSheet, View } from "react-native";
import { fonts, useTheme } from "../theme";
import { T } from "./ui";

export function StatTile({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone?: "gold" }) {
  const { c } = useTheme();
  const gold = tone === "gold";
  return (
    <View style={[styles.tile, { backgroundColor: gold ? c.goldSoft : c.card, borderColor: gold ? c.gold + "55" : c.line }]}>
      <T variant="label" color={gold ? c.gold : c.muted}>
        {label}
      </T>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 6 }}>
        <T style={{ fontFamily: fonts.monoBold, fontSize: 26, lineHeight: 30 }} color={gold ? c.gold : c.fg}>
          {value}
        </T>
        {unit && (
          <T variant="hint" color={gold ? c.gold : c.muted}>
            {unit}
          </T>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flexBasis: "47%", flexGrow: 1, borderWidth: 1, borderRadius: 16, padding: 14 },
});
