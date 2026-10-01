import { useEffect, useRef, useState } from "react";
import type { SeriesResponse } from "./api";
import { iconForWeatherCode } from "./weatherIcons";

// 何時間おきにアイコンを出すか。48 点すべてに出すと潰れて読めないため間引く。
const STEP_HOURS = 3;

export type HourlyConditionCell = {
  time: string;
  timestamp: string;
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
      timestamp: data.timestamps[i],
      icon: iconForWeatherCode(condition.code),
      description: condition.description,
    });
  }
  return cells;
}

// 今が何時ごろか分かりにくいという声を受け、現在時刻に最も近いセルを示す
// （Issue #501）。TemperatureChart.tsx の nearestTimeLabel と同様の考え方。
export function nearestConditionCellIndex(
  cells: HourlyConditionCell[],
  now: Date,
): number | null {
  if (cells.length === 0) return null;
  let bestIndex = 0;
  let bestDiff = Infinity;
  cells.forEach((cell, i) => {
    const diff = Math.abs(new Date(cell.timestamp).getTime() - now.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  });
  return bestIndex;
}

export function HourlyConditions({ data }: { data: SeriesResponse }) {
  const cells = toHourlyConditionCells(data);
  // title 属性はホバー前提でスマホのタップでは出ないため、タップでも見えるよう
  // 選択中のセルの説明を別途表示する（トグルで開閉）。
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 開いたまま他をタップしても説明が消えずに残るという声を受け、コンポーネント
  // 外をタップ/クリックしたときは選択を解除する（Issue #477）。同じセルの
  // 再タップで閉じる既存の挙動（cell の onClick）はそのまま。
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedIndex(null);
      }
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [selectedIndex]);

  if (cells.length === 0) return null;

  const selected = selectedIndex !== null ? cells[selectedIndex] : undefined;
  const nearestIndex = nearestConditionCellIndex(cells, new Date());

  return (
    <div ref={containerRef}>
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
            onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
            style={{
              flex: "0 0 auto",
              minWidth: 44,
              textAlign: "center",
              fontSize: 12,
              color: "var(--text-secondary)",
              cursor: "pointer",
              borderBottom: i === nearestIndex ? "2px solid var(--text-secondary)" : "2px solid transparent",
            }}
          >
            <div style={{ fontSize: 18, lineHeight: 1.4 }}>{cell.icon ?? "—"}</div>
            <div>{cell.time}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          {selected.time}: {selected.description}
        </div>
      )}
    </div>
  );
}
