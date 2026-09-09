import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
//
// 単位は常に m で返ってくるが、晴天時など10000mを超えると桁数が多くて
// 一瞬で読み取りにくいという声を受け、1000m以上は km（小数第1位）に換算する。
export function formatVisibility(data: WeatherResponse): string {
  const { value, unit } = data.visibility;
  if (unit === "m" && value >= 1000) {
    return `視程 ${Math.round(value / 100) / 10}km`;
  }
  return `視程 ${Math.round(value)}${unit}`;
}

export function Visibility({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "0 0 8px" }}>
      {formatVisibility(data)}
    </p>
  );
}
