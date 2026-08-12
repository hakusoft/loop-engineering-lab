import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。LaundryDryness.tsx の laundryDryingLevel と同様。
//
// 土壌水分量など専用のパラメータではなく、既に取得済みの本日の合計降水量・最高気温・
// 最低湿度から簡易な3段階（水やり推奨・普通・不要）に単純化したもの（Issue #205）。
export function gardenWateringLevel(
  precipitationSum: number,
  temperatureMax: number,
  humidityMin: number,
): string {
  if (precipitationSum >= 5) {
    return "水やり不要";
  }
  if (precipitationSum < 1 && temperatureMax >= 30 && humidityMin <= 50) {
    return "水やり推奨";
  }
  return "普通";
}

export function formatGardenWatering(data: WeatherResponse): string {
  const { value: precipitationSum } = data.precipitation_sum;
  const { value: temperatureMax } = data.temperature_max;
  const { value: humidityMin } = data.humidity_min;
  return `庭の水やり ${gardenWateringLevel(precipitationSum, temperatureMax, humidityMin)}`;
}

export function GardenWatering({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatGardenWatering(data)}
    </p>
  );
}
