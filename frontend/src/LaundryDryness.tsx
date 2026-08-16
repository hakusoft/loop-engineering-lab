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

export function LaundryDryness({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 16, margin: "4px 0" }}>
      {formatLaundryDryness(data)}
    </p>
  );
}
