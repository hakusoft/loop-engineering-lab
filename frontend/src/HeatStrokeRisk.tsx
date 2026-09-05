import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。LaundryDryness.tsx の laundryDryingLevel と同様。
//
// 気象庁の熱中症警戒レベルの呼び方を借りているが、正式な WBGT（暑さ指数、日射量や
// 風速まで加味する）の計算ではなく、気温・湿度だけを使った簡易な目安。
export function heatStrokeRiskLevel(temperature: number, humidity: number): string {
  if (temperature >= 31 || (temperature >= 28 && humidity >= 70)) {
    return "厳重警戒";
  }
  if (temperature >= 28 || (temperature >= 25 && humidity >= 70)) {
    return "警戒";
  }
  if (temperature >= 25) {
    return "注意";
  }
  return "ほぼ安全";
}

export function formatHeatStrokeRisk(data: WeatherResponse): string {
  const { value: temperature } = data.temperature;
  const { value: humidity } = data.humidity;
  return `熱中症の目安 ${heatStrokeRiskLevel(temperature, humidity)}`;
}

export function HeatStrokeRisk({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatHeatStrokeRisk(data)}
    </p>
  );
}
