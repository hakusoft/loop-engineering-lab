import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。Evapotranspiration.tsx の formatEvapotranspiration と同様。
export function formatVaporPressureDeficit(data: WeatherResponse): string {
  const { value, unit } = data.vapor_pressure_deficit;
  return `飽差 ${Math.round(value * 100) / 100}${unit}`;
}

export function VaporPressureDeficit({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
        {formatVaporPressureDeficit(data)}
      </p>
      <ItemDescription text="空気が今の水蒸気量からあとどれだけ乾けるかの目安。値が大きいほど空気が乾いていて、植物から水分が奪われやすい" />
    </>
  );
}
