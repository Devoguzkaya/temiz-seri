import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { fonts, useTheme } from "../theme";
import { T } from "./ui";

/** Bugün kaç alışkanlığın tamamlandığını halka olarak gösterir; 4 dilim, aralarında boşluk. */
export function ProgressRing({ done, total, size = 92 }: { done: number; total: number; size?: number }) {
  const { c } = useTheme();
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  // Yuvarlak uçlar her iki yana stroke/2 taşar; boşluk bunu karşılamalı
  const gap = total > 1 ? stroke + 5 : 0;
  const seg = total > 0 ? circ / total - gap : 0;
  const full = total > 0 && done >= total;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        {Array.from({ length: total }, (_, i) => (
          <Circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={i < done ? (full ? c.gold : c.accent) : c.empty}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${seg} ${circ - seg}`}
            strokeDashoffset={-(i * (seg + gap)) - gap / 2}
          />
        ))}
      </Svg>
      <T style={{ fontFamily: fonts.monoBold, fontSize: 22 }}>
        {done}
        <T style={{ fontFamily: fonts.mono, fontSize: 14 }} color={c.muted}>
          /{total}
        </T>
      </T>
    </View>
  );
}
