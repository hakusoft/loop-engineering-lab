import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureDiffGroundAloft.tsx と同様。
// 気温は地上と上空(850hPa)の差が見れるようになった（Issue #311）ので、湿度も
// 同じ高さの値と地上との差を知りたいという声を受けて追加する（Issue #435）。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う。
//
// 欠測時に項目ごと消してしまうと「壊れているのでは」という不安につながる
// という指摘があった（Issue #333、Issue #402、Issue #447）。行自体は残し、
// 取得できていないことを伝える。
export function formatHumidityDiffGroundAloft(data: WeatherResponse): string {
  const { value, unit } = data.humidity_diff_ground_aloft;
  if (value === null) {
    return "地上と上空(850hPa)の湿度差 現在取得できません";
  }
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `地上と上空(850hPa)の湿度差 ${sign}${rounded}${unit}`;
}

// 差だけでなく上空自体の実際の湿度も知りたいという声を受けて追加する（Issue #470）。
// humidity_aloft は humidity_diff_ground_aloft と同じく実 API での応答が未確認の
// 項目のため、null をそのまま扱う（formatHumidityDiffGroundAloft と同じ方針）。
export function formatHumidityAloft(data: WeatherResponse): string {
  const { value, unit } = data.humidity_aloft;
  if (value === null) {
    return "上空(850hPa)の湿度 現在取得できません";
  }
  return `上空(850hPa)の湿度 ${Math.round(value * 10) / 10}${unit}`;
}

export function HumidityDiffGroundAloft({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
        {formatHumidityAloft(data)}
      </p>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
        {formatHumidityDiffGroundAloft(data)}
      </p>
    </>
  );
}
