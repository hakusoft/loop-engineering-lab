import type { WeatherResponse } from "./api";

// 日付（YYYY-MM-DD）を「M/D」の表記にする。TemperatureRange.tsx の formatMonthDay と同様。
function formatMonthDay(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
// 降水確率が高いときの傘の注意書き（旧 PrecipitationWarning.tsx）はここに統合している。
const WARNING_THRESHOLD = 50;

export function formatPrecipitationProbability(data: WeatherResponse): string {
  const { value, unit, date } = data.precipitation_probability;
  // 本日の降水確率の最大値（daily の precipitation_probability_max）を表示している。
  // 「もっと見る」内の平均・最低（PrecipitationProbabilityMean.tsx /
  // PrecipitationProbabilityMin.tsx）と並べたとき、こちらに「最高」が無いと
  // 大小関係が逆に見えるという指摘があった（Issue #516）。ラベルに明示する。
  return `降水確率（最高） ${Math.round(value)}${unit}（${formatMonthDay(date)}）`;
}

export function formatPrecipitationWarning(data: WeatherResponse): string | null {
  const { value } = data.precipitation_probability;
  if (value < WARNING_THRESHOLD) {
    return null;
  }
  return "☂️ 傘があると安心です";
}

export function PrecipitationProbability({ data }: { data: WeatherResponse }) {
  const warning = formatPrecipitationWarning(data);
  // 主要項目が多くどれが大事か分かりにくいという声を受け、既にある閾値
  // （傘の注意書きが出る条件）に該当するときだけ目立たせる（Issue #541）。
  return (
    <p
      style={{
        color: warning ? "#e8590c" : "var(--text-secondary)",
        fontSize: 16,
        fontWeight: warning ? 700 : 400,
        margin: "4px 0",
      }}
    >
      {formatPrecipitationProbability(data)}
      {warning ? ` ${warning}` : ""}
    </p>
  );
}
