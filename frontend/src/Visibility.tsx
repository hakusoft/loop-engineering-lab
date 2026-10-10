import type { WeatherResponse } from "./api";

// m の数字だけだとどのくらい先まで見えるかピンと来ないという声を受け、
// 気象庁の視程の目安を参考にした言葉の目安を添える（Wind.tsx の
// windSpeedDescription と同様の方針）。
export function visibilityDescription(valueMeters: number): string {
  if (valueMeters < 100) {
    return "濃霧でほとんど見えません";
  }
  if (valueMeters < 1000) {
    return "視界不良";
  }
  if (valueMeters < 4000) {
    return "やや見えにくい";
  }
  if (valueMeters < 10000) {
    return "見通し良好";
  }
  return "遠くまで良く見えます";
}

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
//
// 単位は常に m で返ってくるが、晴天時など10000mを超えると桁数が多くて
// 一瞬で読み取りにくいという声を受け、1000m以上は km（小数第1位）に換算する。
export function formatVisibility(data: WeatherResponse): string {
  const { value, unit } = data.visibility;
  const description = visibilityDescription(value);
  if (unit === "m" && value >= 1000) {
    return `視程 ${Math.round(value / 100) / 10}km（${description}）`;
  }
  return `視程 ${Math.round(value)}${unit}（${description}）`;
}

export function Visibility({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "0 0 8px" }}>
      {formatVisibility(data)}
    </p>
  );
}
