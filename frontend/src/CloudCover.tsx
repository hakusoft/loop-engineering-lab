import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
export function formatCloudCover(data: WeatherResponse): string {
  const { value, unit } = data.cloud_cover;
  return `雲量 ${Math.round(value)}${unit}`;
}

export function CloudCover({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>
      {formatCloudCover(data)}
    </p>
  );
}
