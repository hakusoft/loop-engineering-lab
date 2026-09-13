import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。LaundryDryness.tsx の laundryDryingLevel と同様。
//
// 気象庁の暑さ指数（WBGT）警戒レベルの目安である 21/25/28/31℃ を閾値として使う。
// 日射量・風速まで加味した正式な WBGT の計算ではなく、気温・湿度から Open-Meteo が
// 算出する湿球温度を目安として使う簡易判定（Issue #343）。
export function heatStrokeRiskLevel(wetBulbTemperature: number): string {
  if (wetBulbTemperature >= 31) {
    return "危険";
  }
  if (wetBulbTemperature >= 28) {
    return "厳重警戒";
  }
  if (wetBulbTemperature >= 25) {
    return "警戒";
  }
  if (wetBulbTemperature >= 21) {
    return "注意";
  }
  return "ほぼ安全";
}

export function formatHeatStrokeRisk(data: WeatherResponse): string {
  const { value: wetBulbTemperature } = data.wet_bulb_temperature;
  return `熱中症の目安 ${heatStrokeRiskLevel(wetBulbTemperature)}`;
}

// 段階ごとに色を割り当てる。文字だけだと「注意」と「厳重警戒」がパッと
// 見分けにくいという声（Slack）を受けた対応。安全側から危険側へ緑→赤の
// グラデーションにする。
export function heatStrokeRiskColor(level: string): string {
  switch (level) {
    case "危険":
      return "#c92a2a";
    case "厳重警戒":
      return "#d9480f";
    case "警戒":
      return "#e8590c";
    case "注意":
      return "#f08c00";
    default:
      return "#2f9e44";
  }
}

export function HeatStrokeRisk({ data }: { data: WeatherResponse }) {
  const level = heatStrokeRiskLevel(data.wet_bulb_temperature.value);
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      熱中症の目安{" "}
      <span style={{ color: heatStrokeRiskColor(level), fontWeight: 600 }}>{level}</span>
    </p>
  );
}
