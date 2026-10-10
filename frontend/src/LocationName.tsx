import type { WeatherResponse } from "./api";

// 海外の友人に天気をシェアするときに使いたいという声を受け、ローマ字表記も
// 括弧書きで添える（Issue #558）。日本語の地点名表示（location_name）は変更しない。
export function formatLocationNameRomaji(data: WeatherResponse): string {
  return `${data.city_name_romaji}, ${data.prefecture_name_romaji}`;
}

export function LocationName({ data }: { data: WeatherResponse }) {
  return (
    <span style={{ fontSize: 13, color: "#888", marginLeft: 8 }}>
      {data.location_name}（{formatLocationNameRomaji(data)}）
    </span>
  );
}
