import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Pressure.tsx の formatPressure と同様。

// 標準気圧1013.25hPaを基準にした言葉の目安。地上気圧（Pressure.tsx）は観測地点の
// 標高の影響を受けるため対象にしない（標高補正済みの海面気圧側にのみ添える）。
export function seaLevelPressureDescription(pressureHpa: number): string {
  if (pressureHpa >= 1017) {
    return "高気圧寄り";
  }
  if (pressureHpa <= 1009) {
    return "低気圧寄り";
  }
  return "平年並み";
}

export function formatSeaLevelPressure(data: WeatherResponse): string {
  const { value, unit } = data.sea_level_pressure;
  const rounded = Math.round(value * 10) / 10;
  return `海面気圧 ${rounded}${unit}（${seaLevelPressureDescription(value)}）`;
}

export function SeaLevelPressure({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "0 0 8px" }}>
      {formatSeaLevelPressure(data)}
    </p>
  );
}
