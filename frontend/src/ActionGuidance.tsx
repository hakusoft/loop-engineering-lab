import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。GardenWatering.tsx の gardenWateringLevel と同様。
//
// 「傘いるかな、上着いるかな」という行動の目安が知りたいという声を受けて追加する
// （Issue #575）。GardenWatering / LaundryDryness と同じく、既に取得済みの値から
// 3段階に単純化したもの。
export function umbrellaGuidance(precipitationProbability: number, precipitationSum: number): string {
  if (precipitationProbability >= 70 || precipitationSum >= 10) {
    return "傘が必要";
  }
  if (precipitationProbability >= 30) {
    return "折りたたみ傘があると安心";
  }
  return "傘は不要";
}

// 気温だけでなく体感温度の最低も見て、風などによる寒さの感じやすさも反映する。
export function jacketGuidance(temperatureMin: number, apparentTemperatureMin: number): string {
  const coldest = Math.min(temperatureMin, apparentTemperatureMin);
  if (coldest < 10) {
    return "上着が必要";
  }
  if (coldest < 18) {
    return "羽織るものがあると安心";
  }
  return "上着は不要";
}

export function formatActionGuidance(data: WeatherResponse): string {
  const umbrella = umbrellaGuidance(data.precipitation_probability.value, data.precipitation_sum.value);
  const jacket = jacketGuidance(data.temperature_min.value, data.apparent_temperature_min.value);
  return `傘: ${umbrella} / 上着: ${jacket}`;
}

export function ActionGuidance({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatActionGuidance(data)}
    </p>
  );
}
