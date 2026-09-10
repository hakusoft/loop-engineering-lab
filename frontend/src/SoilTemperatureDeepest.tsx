import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilTemperatureDeeper.tsx と同様。
// 18cm よりさらに深い層（54cm）の土の温度も知りたいという声を受けて追加する
// （Issue #346。真夏でも地面の奥は涼しいのか気になるとのこと）。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う。
export function formatSoilTemperatureDeepest(data: WeatherResponse): string {
  const { value, unit } = data.soil_temperature_deepest;
  if (value === null) {
    // 欠測時に項目を消してしまうと「壊れているのでは」という不安につながる
    // という指摘があった（Issue #333）。行自体は残し、取得できていないことを伝える。
    return "土の温度（深さ54cm） 現在取得できません";
  }
  return `土の温度（深さ54cm） ${Math.round(value * 10) / 10}${unit}`;
}

export function SoilTemperatureDeepest({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {formatSoilTemperatureDeepest(data)}
    </p>
  );
}
