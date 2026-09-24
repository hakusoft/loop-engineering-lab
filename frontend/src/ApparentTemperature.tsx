import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。CurrentTemperature.tsx の formatTemperature と同様。
//
// Math.round(value * 10) / 10 だけだと、小数第1位が0になる値（例: 23.0）のとき
// 数値→文字列変換で末尾の .0 が落ち、他の値（例: 23.4）と桁数が揃わない
// という指摘があった（Issue #458）。toFixed(1) で常に小数第1位まで出す。
export function formatApparentTemperature(data: WeatherResponse): string {
  const { value, unit } = data.apparent_temperature;
  return `体感 ${(Math.round(value * 10) / 10).toFixed(1)}${unit}`;
}

export function ApparentTemperature({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px", color: "#444" }}>
      {formatApparentTemperature(data)}
    </p>
  );
}
