import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。CloudCover.tsx の formatCloudCover と同様。
export function formatCloudCoverLayers(data: WeatherResponse): string {
  const low = Math.round(data.cloud_cover_low.value);
  const mid = Math.round(data.cloud_cover_mid.value);
  const high = Math.round(data.cloud_cover_high.value);
  return `雲量の内訳 低層 ${low}% ・ 中層 ${mid}% ・ 高層 ${high}%`;
}

export function CloudCoverLayers({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatCloudCoverLayers(data)}
    </p>
  );
}
