import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilTemperatureDeep.tsx と同様。
// 6cm よりさらに深い層（18cm）の土の温度も知りたいという声を受けて追加する
// （Issue #309。庭の木の根っこあたりの目安にしたいとのこと）。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う。
export function formatSoilTemperatureDeeper(data: WeatherResponse): string | null {
  const { value, unit } = data.soil_temperature_deeper;
  if (value === null) {
    return null;
  }
  return `土の温度（深さ18cm） ${Math.round(value * 10) / 10}${unit}`;
}

export function SoilTemperatureDeeper({ data }: { data: WeatherResponse }) {
  const text = formatSoilTemperatureDeeper(data);
  if (text === null) {
    return null;
  }
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {text}
    </p>
  );
}
