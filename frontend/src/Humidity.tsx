import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。CurrentTemperature.tsx の formatTemperature と同様。
export function formatHumidity(data: WeatherResponse): string {
  const { value, unit } = data.humidity;
  return `湿度 ${Math.round(value)}${unit}`;
}

// 気温（CurrentTemperature.tsx）ほど主要な数値ではないため同じ大きさにはせず、
// 気温に比べて小さすぎて見づらいという声（Issue #280）を踏まえた中間の大きさにする。
export function Humidity({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 24, fontWeight: 600, margin: "0 0 8px" }}>
      {formatHumidity(data)}
    </p>
  );
}
