import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilTemperatureDeep.tsx と同様。
// 地上と上空でどのくらい気温が違うか知りたいという声を受けて追加する
// （Issue #311）。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う。
export function formatTemperatureDiffGroundAloft(data: WeatherResponse): string | null {
  const { value, unit } = data.temperature_diff_ground_aloft;
  if (value === null) {
    return null;
  }
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `地上と上空(850hPa)の気温差 ${sign}${rounded}${unit}`;
}

export function TemperatureDiffGroundAloft({ data }: { data: WeatherResponse }) {
  const text = formatTemperatureDiffGroundAloft(data);
  if (text === null) {
    return null;
  }
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {text}
    </p>
  );
}
