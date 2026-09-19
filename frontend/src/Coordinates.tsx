import type { SeriesResponse } from "./api";

// 表示ロジックを純関数に切り出す。LocationName.tsx と同様、地点情報の一部として
// ヘッダー付近に小さく添える（Issue #423）。地図は不要、数値だけでよいという要望。
export function formatCoordinates(data: SeriesResponse): string {
  const { latitude, longitude } = data.coordinates;
  return `北緯${latitude}° 東経${longitude}°`;
}

export function Coordinates({ data }: { data: SeriesResponse }) {
  return (
    <span style={{ fontSize: 13, color: "#888", marginLeft: 8 }}>
      {formatCoordinates(data)}
    </span>
  );
}
