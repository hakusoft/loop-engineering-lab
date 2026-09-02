import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。ISO8601 の時刻部分（HH:MM）だけを取り出す。
export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

// 文字だけだと味気ないという声を受け、日の出・日の入りにそれぞれアイコンを添える（Issue #302）。
const SUNRISE_ICON = "🌅";
const SUNSET_ICON = "🌇";

export function SunTimes({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0 16px" }}>
      {SUNRISE_ICON} 日の出 {formatTime(data.sunrise)} ・ {SUNSET_ICON} 日の入り{" "}
      {formatTime(data.sunset)}
    </p>
  );
}
