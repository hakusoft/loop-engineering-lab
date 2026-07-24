import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。ISO8601 の時刻部分（HH:MM）だけを取り出す。
export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

export function SunTimes({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0 16px" }}>
      日の出 {formatTime(data.sunset)} ・ 日の入り {formatTime(data.sunrise)}
    </p>
  );
}
