import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilMoistureDeeper.tsx の formatSoilMoistureDeeper と同様。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う。
//
// 欠測時に項目ごと消してしまうと「壊れているのでは」という不安につながる
// という指摘があった（Issue #333、Issue #402）。行自体は残し、取得できて
// いないことを伝える。
export function formatSoilMoistureDeepest(data: WeatherResponse): string {
  const { value, unit } = data.soil_moisture_deepest;
  if (value === null) {
    return "土の湿り気（9〜27cm） 現在取得できません";
  }
  return `土の湿り気（9〜27cm） ${Math.round(value * 100) / 100}${unit}`;
}

export function SoilMoistureDeepest({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatSoilMoistureDeepest(data)}
    </p>
  );
}
