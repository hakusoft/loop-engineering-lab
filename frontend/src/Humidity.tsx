import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。CurrentTemperature.tsx の formatTemperature と同様。
//
// Open-Meteo のモデル値は仕様上まれに100%を超えることがある。元データ自体は
// バグではないが、数字だけ見ると変な感じがするという声を受け、表示側だけ
// 100%で上限キャップする（Issue #276）。API レスポンス自体の値は変更しない。
export function formatHumidity(data: WeatherResponse): string {
  const { value, unit } = data.humidity;
  return `湿度 ${Math.round(Math.min(value, 100))}${unit}`;
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
