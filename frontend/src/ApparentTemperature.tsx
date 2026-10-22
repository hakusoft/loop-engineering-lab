import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。CurrentTemperature.tsx の formatTemperature と同様。
//
// Math.round(value * 10) / 10 だけだと、小数第1位が0になる値（例: 23.0）のとき
// 数値→文字列変換で末尾の .0 が落ち、他の値（例: 23.4）と桁数が揃わない
// という指摘があった（Issue #458）。toFixed(1) で常に小数第1位まで出す。
export function formatApparentTemperature(data: WeatherResponse): string {
  const { value, unit } = data.apparent_temperature;
  return `体感 ${(Math.round(value * 10) / 10).toFixed(1)}${unit}`;
}

// 気温（CurrentTemperature.tsx の formatTemperatureFahrenheit）と同様、
// 体感温度も華氏で見たいという声を受けて併記する（Issue #623）。
export function formatApparentTemperatureFahrenheit(data: WeatherResponse): string {
  const { value } = data.apparent_temperature;
  const fahrenheit = (value * 9) / 5 + 32;
  return `${(Math.round(fahrenheit * 10) / 10).toFixed(1)}°F`;
}

export function ApparentTemperature({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px", color: "#444" }}>
        {formatApparentTemperature(data)}
        <span style={{ fontSize: 16, fontWeight: 400, color: "var(--text-secondary)", marginLeft: 8 }}>
          {formatApparentTemperatureFahrenheit(data)}
        </span>
      </p>
      <ItemDescription text="湿度や風などを考慮した、体感上の暑さ・寒さの目安(右の小さい数字は華氏換算)" />
    </>
  );
}
