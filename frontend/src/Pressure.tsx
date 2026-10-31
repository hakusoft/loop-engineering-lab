import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
//
// 「海面気圧」（SeaLevelPressure.tsx）との対比で、どちらが観測地点の実際の
// （今の）気圧か分かりにくいという声を受け、「気圧」から「地上気圧」に変える
// （Issue #564）。値自体（surface_pressure）・算出方法は変えない。
//
// もう少し細かい桁数で見たいという声を受け、小数第1位から第2位に変更する
// （Issue #665。app/weather.py の PRESSURE_PRECISION と揃える）。
export function formatPressure(data: WeatherResponse): string {
  const { value, unit } = data.pressure;
  return `地上気圧 ${Math.round(value * 100) / 100} ${unit}`;
}

export function Pressure({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "0 0 8px" }}>
      {formatPressure(data)}
    </p>
  );
}
