import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilTemperature.tsx と同様。
// 表層（0cm）だけでは霜が降りるかどうかの目安にしづらいという声を受け、
// より深い層（6cm）の土の温度も表示する（Issue #278）。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う。
export function formatSoilTemperatureDeep(data: WeatherResponse): string | null {
  const { value, unit } = data.soil_temperature_deep;
  if (value === null) {
    return null;
  }
  return `土の温度（深さ6cm） ${Math.round(value * 10) / 10}${unit}`;
}

export function SoilTemperatureDeep({ data }: { data: WeatherResponse }) {
  const text = formatSoilTemperatureDeep(data);
  if (text === null) {
    return null;
  }
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {text}
    </p>
  );
}
