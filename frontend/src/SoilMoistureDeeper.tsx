import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilMoistureDeep.tsx の formatSoilMoistureDeep と同様。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う。
//
// 欠測時に項目ごと消してしまうと「壊れているのでは」という不安につながる
// という指摘があった（Issue #333、Issue #402、Issue #447）。行自体は残し、
// 取得できていないことを伝える。
export function formatSoilMoistureDeeper(data: WeatherResponse): string {
  const { value, unit } = data.soil_moisture_deeper;
  if (value === null) {
    return "土の湿り気（3〜9cm） 現在取得できません";
  }
  return `土の湿り気（3〜9cm） ${Math.round(value * 100) / 100}${unit}`;
}

export function SoilMoistureDeeper({ data }: { data: WeatherResponse }) {
  const text = formatSoilMoistureDeeper(data);
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {text}
    </p>
  );
}
