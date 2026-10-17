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

// 日焼け止めの目安も知りたいという声を受けて追加する（Issue #599）。
// UV指数(本日の最大)から、WHOの区分(3未満: 低い、3〜7: 中〜高い、8以上: 非常に高い)を
// 参考に3段階に単純化する。
export function sunscreenGuidance(uvIndexMax: number): string {
  if (uvIndexMax >= 8) {
    return "日焼け止めが必要";
  }
  if (uvIndexMax >= 3) {
    return "日焼け止めがあると安心";
  }
  return "日焼け止めは不要";
}

export function formatActionGuidance(data: WeatherResponse): string {
  const umbrella = umbrellaGuidance(data.precipitation_probability.value, data.precipitation_sum.value);
  const jacket = jacketGuidance(data.temperature_min.value, data.apparent_temperature_min.value);
  const sunscreen = sunscreenGuidance(data.uv_index_max.value);
  return `傘: ${umbrella} / 上着: ${jacket} / 日焼け止め: ${sunscreen}`;
}

export function ActionGuidance({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatActionGuidance(data)}
    </p>
  );
}
