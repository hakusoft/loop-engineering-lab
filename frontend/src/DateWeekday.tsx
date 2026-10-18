// 表示ロジックを純関数に切り出す。ObservedAt.tsx / SunTimesRelative.tsx の
// nowInJst と同じ考え方で、ブラウザのローカルタイムゾーンに関わらず
// 日本時間の日付・曜日を出す（利用者が日本国外にいる場合など、ローカルの
// 日付とズレるため）。データ取得とは無関係なので、他の項目のように
// WeatherResponse / SeriesResponse を受け取らず、常に表示できる。
//
// 「今日が何月何日・何曜日か画面のどこにも出ていない」という声を受けて追加する。
export function formatDateWeekday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("month")}月${get("day")}日（${get("weekday")}）`;
}

export function DateWeekday() {
  return (
    <span style={{ fontSize: 14, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
      {formatDateWeekday()}
    </span>
  );
}
