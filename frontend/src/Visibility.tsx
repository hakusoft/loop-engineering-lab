import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
export function formatVisibility(data: WeatherResponse): string {
  const { value } = data.visibility;
  return `視程 ${Math.round(value)}km`;
}

export function Visibility({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>
      {formatVisibility(data)}
    </p>
  );
}
