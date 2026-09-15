import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
//
// 湿度が低く風が強いほど乾きやすい、というシンプルな経験則を
// 3段階（乾きやすい・普通・乾きにくい）に単純化したもの。
// 細かい数値指数ではなく簡易な目安が欲しい、という依頼を受けての設計（Issue #138）。
export function laundryDryingLevel(humidity: number, windSpeed: number): string {
  if (humidity <= 60 && windSpeed >= 10) {
    return "乾きやすい";
  }
  if (humidity >= 80 || windSpeed < 5) {
    return "乾きにくい";
  }
  return "普通";
}

export function formatLaundryDryness(data: WeatherResponse): string {
  const { value: humidity } = data.humidity;
  const { value: windSpeed } = data.wind_speed;
  return `洗濯物の乾きやすさ ${laundryDryingLevel(humidity, windSpeed)}`;
}

// 段階ごとに色を割り当てる。文字だけだと3段階が見分けにくいという声（Slack）を
// 受けた対応。HeatStrokeRisk.tsx の heatStrokeRiskColor と同様、乾きやすい方を
// 嬉しい方向（緑）、乾きにくい方を注意方向（オレンジ）にする。
export function laundryDryingLevelColor(level: string): string {
  switch (level) {
    case "乾きやすい":
      return "#2f9e44";
    case "乾きにくい":
      return "#e8590c";
    default:
      return "var(--text-secondary)";
  }
}

export function LaundryDryness({ data }: { data: WeatherResponse }) {
  const { value: humidity } = data.humidity;
  const { value: windSpeed } = data.wind_speed;
  const level = laundryDryingLevel(humidity, windSpeed);
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      洗濯物の乾きやすさ{" "}
      <span style={{ color: laundryDryingLevelColor(level), fontWeight: 600 }}>{level}</span>
    </p>
  );
}
