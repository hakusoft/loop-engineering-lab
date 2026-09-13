import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
//
// uv_index_clear_sky_max は実 API での応答未確認の項目（api.ts のコメント参照）。
// 取れないときは value が null になるので、欄ごと省いて表示する
// （SoilTemperatureDeep.tsx 等とは異なり、この値は「一言添える」補足情報のため
// 全体を欠測扱いにせず未取得の部分だけ省く）。
export function formatUvIndex(data: WeatherResponse): string {
  const current = Math.round(data.uv_index.value * 10) / 10;
  const max = Math.round(data.uv_index_max.value * 10) / 10;
  const { value: clearSkyMaxValue } = data.uv_index_clear_sky_max;
  if (clearSkyMaxValue === null) {
    return `紫外線指数 ${current}（本日の最大 ${max}）`;
  }
  const clearSkyMax = Math.round(clearSkyMaxValue * 10) / 10;
  return `紫外線指数 ${current}（本日の最大 ${max}・快晴時 ${clearSkyMax}）`;
}

export function UvIndex({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatUvIndex(data)}
    </p>
  );
}
