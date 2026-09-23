import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilTemperatureDeep.tsx と同様。
// 地上と上空でどのくらい気温が違うか知りたいという声を受けて追加する
// （Issue #311）。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う。
//
// 欠測時に項目ごと消してしまうと「壊れているのでは」という不安につながる
// という指摘があった（Issue #333、Issue #402、Issue #447）。行自体は残し、
// 取得できていないことを伝える。
export function formatTemperatureDiffGroundAloft(data: WeatherResponse): string {
  const { value, unit } = data.temperature_diff_ground_aloft;
  if (value === null) {
    return "地上と上空(850hPa)の気温差 現在取得できません";
  }
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `地上と上空(850hPa)の気温差 ${sign}${rounded}${unit}`;
}

export function TemperatureDiffGroundAloft({ data }: { data: WeatherResponse }) {
  const text = formatTemperatureDiffGroundAloft(data);
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {text}
    </p>
  );
}
