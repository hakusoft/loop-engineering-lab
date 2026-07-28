import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeriesResponse } from "./api";

// series の中から気温・湿度を取り出し、Recharts が食える {time, temperature, humidity}[] にする。
// 時刻は共通の timestamps を、値は該当系列の values を突き合わせる。
function toChartData(data: SeriesResponse) {
  const temperature = data.series.find((s) => s.label === "気温");
  const humidity = data.series.find((s) => s.label === "湿度");
  if (!temperature) return { rows: [], temperatureUnit: "°C", humidity: undefined };

  const rows = data.timestamps.map((t, i) => ({
    // "2026-07-21T00:00" -> "21日 00:00" 程度の短い表示に。
    time: t.slice(8, 10) + "日 " + t.slice(11, 16),
    temperature: temperature.values[i],
    humidity: humidity?.values[i] ?? null,
  }));
  return { rows, temperatureUnit: temperature.unit, humidity };
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
  const { rows, temperatureUnit, humidity } = toChartData(data);
  const isNarrow = useIsNarrowViewport();
  const tickFontSize = isNarrow ? 15 : 12;
  const axisWidth = isNarrow ? 68 : 56;

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={rows} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="time" minTickGap={40} tick={{ fontSize: tickFontSize }} />
        <YAxis
          yAxisId="temperature"
          unit={temperatureUnit}
          width={axisWidth}
          domain={["dataMin - 1", "dataMax + 1"]}
          tick={{ fontSize: tickFontSize }}
        />
        {humidity && (
          <YAxis
            yAxisId="humidity"
            orientation="right"
            unit={humidity.unit}
            width={axisWidth}
            domain={[humidity.min as number, humidity.max as number]}
            tick={{ fontSize: tickFontSize }}
          />
        )}
        <Tooltip
          formatter={(v: number, name: string) => [
            `${v}${name === "気温" ? temperatureUnit : humidity?.unit ?? ""}`,
            name,
          ]}
        />
        <Legend />
        <Line
          yAxisId="temperature"
          type="monotone"
          dataKey="temperature"
          stroke="#e2492c"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          name="気温"
        />
        {humidity && (
          <Line
            yAxisId="humidity"
            type="monotone"
            dataKey="humidity"
            stroke="#2c7be2"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="湿度"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
