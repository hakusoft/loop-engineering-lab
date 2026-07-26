import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeriesResponse } from "./api";

// series の中から気温を取り出し、Recharts が食える {time, value}[] にする。
// 時刻は共通の timestamps を、値は該当系列の values を突き合わせる。
function toChartData(data: SeriesResponse) {
  const temp = data.series.find((s) => s.label === "気温");
  if (!temp) return { rows: [], unit: "°C" };

  const rows = data.timestamps.map((t, i) => ({
    // "2026-07-21T00:00" -> "21日 00:00" 程度の短い表示に。
    time: t.slice(8, 10) + "日 " + t.slice(11, 16),
    value: temp.values[i],
  }));
  return { rows, unit: temp.unit };
}

const NARROW_VIEWPORT_QUERY = "(max-width: 480px)";

// スマホ幅では固定 12px の目盛りが相対的に読みにくいという声があったため、
// 狭い画面では目盛りを大きくする。
function useIsNarrowViewport(): boolean {
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(NARROW_VIEWPORT_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(NARROW_VIEWPORT_QUERY);
    const onChange = () => setIsNarrow(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isNarrow;
}

export function TemperatureChart({ data }: { data: SeriesResponse }) {
  const { rows, unit } = toChartData(data);
  const isNarrow = useIsNarrowViewport();
  const tickFontSize = isNarrow ? 15 : 12;
  const axisWidth = isNarrow ? 68 : 56;

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={rows} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="time" minTickGap={40} tick={{ fontSize: tickFontSize }} />
        <YAxis
          unit={unit}
          width={axisWidth}
          domain={["dataMin - 1", "dataMax + 1"]}
          tick={{ fontSize: tickFontSize }}
        />
        <Tooltip formatter={(v: number) => [`${v}${unit}`, "気温"]} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#e2492c"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          name="気温"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
