import type { SeriesResponse } from "./api";
import { iconForWeatherCode } from "./weatherIcons";

// 今日一日を時刻ごとではなく1つのコードで知りたいという声を受けて追加する
// （Issue #557）。表示ロジックは純関数に切り出す。
export function formatDailyConditionIcon(data: SeriesResponse): string | null {
  if (!data.daily_condition) {
    return null;
  }
  return iconForWeatherCode(data.daily_condition.code);
}

export function DailyCondition({ data }: { data: SeriesResponse }) {
  if (!data.daily_condition) {
    return null;
  }
  const icon = formatDailyConditionIcon(data);
  return (
    <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 8px" }}>
      今日一日の代表コード: {icon ? `${icon} ` : ""}
      {data.daily_condition.description}（{data.daily_condition.code}）
    </p>
  );
}
