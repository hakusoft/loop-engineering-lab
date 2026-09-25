import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。DewPoint.tsx の formatDewPoint と同様。
export function formatWetBulbTemperature(data: WeatherResponse): string {
  const { value, unit } = data.wet_bulb_temperature;
  return `湿球温度 ${Math.round(value * 10) / 10}${unit}`;
}

export function WetBulbTemperature({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
        {formatWetBulbTemperature(data)}
      </p>
      <ItemDescription text="気温と湿度から算出する、蒸発による冷却を考慮した温度" />
    </>
  );
}
