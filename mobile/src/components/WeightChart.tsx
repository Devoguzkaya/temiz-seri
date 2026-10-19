import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg";
import type { Weight } from "../lib/api";
import { fromIso, shortDate } from "../lib/dates";
import { fonts, useTheme } from "../theme";
import { T } from "./ui";

const H = 190;
const PAD = { top: 14, right: 14, bottom: 26, left: 40 };

/** Kilo çizgisi; hedef varsa kesikli çizgi olarak gösterilir. */
export function WeightChart({ data, goal }: { data: Weight[]; goal: number | null }) {
  const { c } = useTheme();
  const [width, setWidth] = useState(0);

  if (data.length < 2) {
    return (
      <View style={{ height: 120, alignItems: "center", justifyContent: "center" }}>
        <T variant="small" color={c.muted} style={{ textAlign: "center" }}>
          Grafik için en az iki gün kilo gir.
        </T>
      </View>
    );
  }

  const values = data.map((d) => d.kg);
  if (goal != null) values.push(goal);
  let min = Math.floor(Math.min(...values) - 1);
  let max = Math.ceil(Math.max(...values) + 1);
  if (max - min < 4) {
    const mid = (max + min) / 2;
    min = Math.floor(mid - 2);
    max = Math.ceil(mid + 2);
  }

  const t0 = fromIso(data[0].date).getTime();
  const t1 = fromIso(data[data.length - 1].date).getTime();
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = H - PAD.top - PAD.bottom;
  const x = (iso: string) => PAD.left + ((fromIso(iso).getTime() - t0) / Math.max(1, t1 - t0)) * plotW;
  const y = (kg: number) => PAD.top + (1 - (kg - min) / (max - min)) * plotH;

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(d.date).toFixed(1)},${y(d.kg).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data[data.length - 1].date).toFixed(1)},${PAD.top + plotH} L${PAD.left},${PAD.top + plotH} Z`;
  const step = Math.max(1, Math.ceil((max - min) / 4));
  const ticks: number[] = [];
  for (let v = min; v <= max; v += step) ticks.push(v);
  const last = data[data.length - 1];

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: H }}>
      {width > 0 && (
        <Svg width={width} height={H}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c.accent} stopOpacity={0.22} />
              <Stop offset="1" stopColor={c.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {ticks.map((v) => (
            <Line key={v} x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={c.line} strokeWidth={1} />
          ))}
          {ticks.map((v) => (
            <SvgText key={`l${v}`} x={PAD.left - 8} y={y(v) + 4} fontSize={11} fontFamily={fonts.mono} fill={c.muted} textAnchor="end">
              {v}
            </SvgText>
          ))}
          {goal != null && (
            <>
              <Line x1={PAD.left} x2={width - PAD.right} y1={y(goal)} y2={y(goal)} stroke={c.gold} strokeWidth={1.5} strokeDasharray="5 4" />
              <SvgText x={width - PAD.right} y={y(goal) - 6} fontSize={11} fontFamily={fonts.mono} fill={c.gold} textAnchor="end">
                {`hedef ${goal}`}
              </SvgText>
            </>
          )}
          <Path d={area} fill="url(#fill)" />
          <Path d={line} stroke={c.accent} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {data.length <= 40 &&
            data.map((d) => <Circle key={d.date} cx={x(d.date)} cy={y(d.kg)} r={2.5} fill={c.accent} />)}
          <Circle cx={x(last.date)} cy={y(last.kg)} r={6} fill={c.card} stroke={c.accent} strokeWidth={3} />
          <SvgText x={PAD.left} y={H - 6} fontSize={11} fontFamily={fonts.mono} fill={c.muted}>
            {shortDate(data[0].date)}
          </SvgText>
          <SvgText x={width - PAD.right} y={H - 6} fontSize={11} fontFamily={fonts.mono} fill={c.muted} textAnchor="end">
            {shortDate(last.date)}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
