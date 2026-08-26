import type { SeriesResponse } from "./api";
import { iconForWeatherCode } from "./weatherIcons";

// 何時間おきにアイコンを出すか。48 点すべてに出すと潰れて読めないため間引く。
const STEP_HOURS = 3;

export type HourlyConditionCell = {
  time: string;
  icon: string | null;
  description: string;
};

// 表示ロジックを純関数に切り出す。Condition.tsx の formatCondition と同様。
// timestamps と conditions を突き合わせ、STEP_HOURS おきのセルにする。
export function toHourlyConditionCells(data: SeriesResponse): HourlyConditionCell[] {
  const cells: HourlyConditionCell[] = [];
  for (let i = 0; i < data.timestamps.length; i += STEP_HOURS) {
    const condition = data.conditions[i];
    if (!condition) continue;
    cells.push({
      // "2026-07-21T00:00" -> "00時" 程度の短い表示に。
      time: data.timestamps[i].slice(11, 13) + "時",
      icon: iconForWeatherCode(condition.code),
      description: condition.description,
    });
  }
  return cells;
}

export function HourlyConditions({ data }: { data: SeriesResponse }) {
  const cells = toHourlyConditionCells(data);
  if (cells.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        overflowX: "auto",
        margin: "8px 0 0",
        paddingBottom: 4,
      }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          title={cell.description}
          style={{
            flex: "0 0 auto",
            minWidth: 44,
            textAlign: "center",
            fontSize: 12,
            color: "#666",
          }}
        >
          <div style={{ fontSize: 18, lineHeight: 1.4 }}>{cell.icon ?? "—"}</div>
          <div>{cell.time}</div>
        </div>
      ))}
    </div>
  );
}
