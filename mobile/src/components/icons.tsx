import Svg, { Circle, Path, Rect } from "react-native-svg";

type P = { color: string; size?: number };
const stroke = (color: string) => ({
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

export function TodayIcon({ color, size = 24 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="4" width="16" height="16" rx="4" {...stroke(color)} />
      <Path d="M8.5 12.2l2.4 2.3 4.6-5" {...stroke(color)} />
    </Svg>
  );
}

export function CalendarIcon({ color, size = 24 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3.5" y="5" width="17" height="15" rx="3" {...stroke(color)} />
      <Path d="M3.5 10h17M8 3v4M16 3v4" {...stroke(color)} />
    </Svg>
  );
}

export function ScaleIcon({ color, size = 24 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3.5" y="3.5" width="17" height="17" rx="4" {...stroke(color)} />
      <Path d="M8 9.5a5 5 0 0 1 8 0M12 9.5l1.6-2" {...stroke(color)} />
    </Svg>
  );
}

export function SettingsIcon({ color, size = 24 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 7h10M18 7h2M4 17h2M10 17h10" {...stroke(color)} />
      <Circle cx="16" cy="7" r="2" {...stroke(color)} />
      <Circle cx="8" cy="17" r="2" {...stroke(color)} />
    </Svg>
  );
}

export function CheckIcon({ color, size = 16 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M3 8.5l3.2 3L13 4.5" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function ChevronIcon({ color, size = 22, dir }: P & { dir: "left" | "right" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} {...stroke(color)} />
    </Svg>
  );
}

export function FlameIcon({ color, size = 18 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.4 2.4-5.4 3.7-8.4.3 2 1.3 3.2 2.5 3.8.2-2.8 1.6-5.2 3.8-7.3-.2 3.4 3 5.9 3 10.4 0 4.3-2.7 7.6-6.5 7.6z"
        fill={color}
      />
    </Svg>
  );
}

export function TrashIcon({ color, size = 18 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l1 12.5h9l1-12.5M9.5 7V4.5h5V7" {...stroke(color)} />
    </Svg>
  );
}

export function MinusIcon({ color, size = 20 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 12h12" {...stroke(color)} />
    </Svg>
  );
}

export function PlusIcon({ color, size = 20 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 6v12M6 12h12" {...stroke(color)} />
    </Svg>
  );
}
