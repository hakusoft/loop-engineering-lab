import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

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

// 差だけでなく上空自体の実際の気温も知りたいという声を受けて追加する（Issue #470）。
// temperature_aloft は temperature_diff_ground_aloft と同じく実 API での応答が
// 未確認の項目のため、null をそのまま扱う（formatTemperatureDiffGroundAloft と同じ方針）。
export function formatTemperatureAloft(data: WeatherResponse): string {
  const { value, unit } = data.temperature_aloft;
  if (value === null) {
    return "上空(850hPa)の気温 現在取得できません";
  }
  return `上空(850hPa)の気温 ${Math.round(value * 10) / 10}${unit}`;
}

export function TemperatureDiffGroundAloft({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
        {formatTemperatureAloft(data)}
      </p>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
        {formatTemperatureDiffGroundAloft(data)}
      </p>
      <ItemDescription text="地上と上空(850hPa、目安として高度1500m前後)の気温差" />
    </>
  );
}
