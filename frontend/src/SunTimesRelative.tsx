import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。ObservedAt.tsx の nowInJst と同じ考え方。
//
// sunrise / sunset は日本時間の naive な ISO8601 文字列（タイムゾーン情報なし）。
// 比較する「今」もブラウザのローカルタイムゾーンに関わらず日本時間で揃えないと
// ズレる（利用者が日本国外にいる場合など）ため、Intl.DateTimeFormat で
// 現在時刻を日本時間の文字列に変換してから、sunrise / sunset と同じ
// 「タイムゾーン情報のない日本時間」同士で差分を取る。
function nowInJst(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return new Date(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`,
  );
}

function formatHoursMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}分`;
  return `${hours}時間${minutes}分`;
}

export function formatTimeUntilSunset(sunsetIso: string, now: Date = nowInJst()): string {
  const minutes = Math.round((new Date(sunsetIso).getTime() - now.getTime()) / 60000);
  if (minutes <= 0) return "日の入り済み";
  return `日の入りまであと${formatHoursMinutes(minutes)}`;
}

export function formatTimeSinceSunrise(sunriseIso: string, now: Date = nowInJst()): string {
  const minutes = Math.round((now.getTime() - new Date(sunriseIso).getTime()) / 60000);
  if (minutes <= 0) return "日の出前";
  return `日の出から${formatHoursMinutes(minutes)}経過`;
}

export function SunTimesRelative({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatTimeUntilSunset(data.sunset)} ・ {formatTimeSinceSunrise(data.sunrise)}
    </p>
  );
}
