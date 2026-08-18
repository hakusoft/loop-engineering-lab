import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeriesResponse } from "./api";

// series の中から気温・湿度・雨量・降雪量・降水確率・紫外線指数を取り出し、
// Recharts が食える {time, temperature, humidity, rain, snow, precipitationProbability, uvIndex}[] にする。
// 時刻は共通の timestamps を、値は該当系列の values を突き合わせる。
function toChartData(data: SeriesResponse) {
  const temperature = data.series.find((s) => s.label === "気温");
  const apparentTemperature = data.series.find((s) => s.label === "体感温度");
  const humidity = data.series.find((s) => s.label === "湿度");
  const rain = data.series.find((s) => s.label === "雨量");
  const snow = data.series.find((s) => s.label === "降雪量");
  const precipitationProbability = data.series.find((s) => s.label === "降水確率");
  const pressure = data.series.find((s) => s.label === "気圧");
  const uvIndex = data.series.find((s) => s.label === "紫外線指数");
  if (!temperature) {
    return {
      rows: [],
      temperatureUnit: "°C",
      apparentTemperature: undefined,
      humidity: undefined,
      rain: undefined,
      snow: undefined,
      precipitationProbability: undefined,
      pressure: undefined,
      uvIndex: undefined,
    };
  }

  const rows = data.timestamps.map((t, i) => ({
    // "2026-07-21T00:00" -> "21日 00:00" 程度の短い表示に。
    time: t.slice(8, 10) + "日 " + t.slice(11, 16),
    temperature: temperature.values[i],
    apparentTemperature: apparentTemperature?.values[i] ?? null,
    humidity: humidity?.values[i] ?? null,
    rain: rain?.values[i] ?? null,
    snow: snow?.values[i] ?? null,
    precipitationProbability: precipitationProbability?.values[i] ?? null,
    pressure: pressure?.values[i] ?? null,
    uvIndex: uvIndex?.values[i] ?? null,
  }));
  return {
    rows,
    temperatureUnit: temperature.unit,
    apparentTemperature,
    humidity,
    rain,
    snow,
    precipitationProbability,
    pressure,
    uvIndex,
  };
}

// timestamps（rows と同じ並び）の中から now に最も近い時刻の行ラベルを返す。
// x 軸が rows[].time の文字列（カテゴリ）なので、ReferenceLine の x にはこのラベルを渡す。
export function nearestTimeLabel(
  timestamps: string[],
  rows: { time: string }[],
  now: Date,
): string | undefined {
  if (timestamps.length === 0 || timestamps.length !== rows.length) {
    return undefined;
  }
  let bestIndex = 0;
  let bestDiff = Infinity;
  timestamps.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - now.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  });
  return rows[bestIndex].time;
}

// timestamps（rows と同じ並び）の中で日付（年月日）が前の要素から変わるインデックスの
// 行ラベルを、変わった先の日付ラベル（例: "8/12"）とセットで返す。
// 48時間分のグラフだと日付の境目がどこか分かりにくいという声があったため、
// ReferenceLine で区切り線を引けるようにする。
export function dateBoundaryLabels(
  timestamps: string[],
  rows: { time: string }[],
): { time: string; date: string }[] {
  if (timestamps.length === 0 || timestamps.length !== rows.length) {
    return [];
  }
  const boundaries: { time: string; date: string }[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    const previousDate = timestamps[i - 1].slice(0, 10);
    const currentDate = timestamps[i].slice(0, 10);
    if (currentDate !== previousDate) {
      const month = Number(currentDate.slice(5, 7));
      const day = Number(currentDate.slice(8, 10));
      boundaries.push({ time: rows[i].time, date: `${month}/${day}` });
    }
  }
  return boundaries;
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
  const {
    rows,
    temperatureUnit,
    apparentTemperature,
    humidity,
    rain,
    snow,
    precipitationProbability,
    pressure,
    uvIndex,
  } = toChartData(data);
  const isNarrow = useIsNarrowViewport();
  const tickFontSize = isNarrow ? 15 : 12;
  const axisWidth = isNarrow ? 68 : 56;
  // 目盛りを拡大した分、右端のラベルが枠からはみ出さないよう余白も広げる。
  const chartRightMargin = isNarrow ? 40 : 24;
  const nowLabel = nearestTimeLabel(data.timestamps, rows, new Date());
  const dateBoundaries = dateBoundaryLabels(data.timestamps, rows);

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={rows} margin={{ top: 16, right: chartRightMargin, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="time" minTickGap={40} tick={{ fontSize: tickFontSize }} />
        {nowLabel && (
          <ReferenceLine
            yAxisId="temperature"
            x={nowLabel}
            stroke="#888"
            strokeDasharray="4 4"
            label={{ value: "現在", position: "top", fontSize: tickFontSize, fill: "#888" }}
          />
        )}
        {dateBoundaries.map((boundary) => (
          <ReferenceLine
            key={boundary.time}
            yAxisId="temperature"
            x={boundary.time}
            stroke="#ccc"
            label={{ value: boundary.date, position: "top", fontSize: tickFontSize, fill: "#999" }}
          />
        ))}
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
        {(rain || snow) && (
          // 気温・湿度と軸が重ならないよう、降水量の軸は目盛りを描画しない（スケールのみ利用）。
          <YAxis
            yAxisId="precipitation"
            hide
            domain={[0, Math.max(rain?.max ?? 0, snow?.max ?? 0) + 1]}
          />
        )}
        {precipitationProbability && (
          // 降水確率は % 固定なので 0〜100 のスケールで、他系列とは別軸にする。
          <YAxis yAxisId="precipitationProbability" hide domain={[0, 100]} />
        )}
        {uvIndex && (
          // 紫外線指数は他系列と単位もスケールも違うので、独立した軸にする。
          <YAxis yAxisId="uvIndex" hide domain={[0, Math.max(uvIndex.max ?? 0, 1) + 1]} />
        )}
        {pressure && (
          // 気圧も他系列と単位・スケールが違うので、独立した軸にする。
          <YAxis
            yAxisId="pressure"
            hide
            domain={[(pressure.min ?? 0) - 1, (pressure.max ?? 0) + 1]}
          />
        )}
        <Tooltip
          formatter={(v: number, name: string) => {
            const unit =
              name === "気温"
                ? temperatureUnit
                : name === "体感温度"
                  ? apparentTemperature?.unit
                  : name === "湿度"
                    ? humidity?.unit
                    : name === "雨量"
                      ? rain?.unit
                      : name === "降雪量"
                        ? snow?.unit
                        : name === "降水確率"
                          ? precipitationProbability?.unit
                          : name === "気圧"
                            ? pressure?.unit
                            : uvIndex?.unit;
            return [`${v}${unit ?? ""}`, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: tickFontSize }} />
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
        {apparentTemperature && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="apparentTemperature"
            stroke="#f4a300"
            strokeDasharray="4 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="体感温度"
          />
        )}
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
        {rain && (
          // 気温・湿度よりスケールが小さく見えにくいという声があったため、線を太くする。
          <Line
            yAxisId="precipitation"
            type="monotone"
            dataKey="rain"
            stroke="#12b886"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            name="雨量"
          />
        )}
        {snow && (
          <Line
            yAxisId="precipitation"
            type="monotone"
            dataKey="snow"
            stroke="#4dabf7"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            name="降雪量"
          />
        )}
        {precipitationProbability && (
          <Line
            yAxisId="precipitationProbability"
            type="monotone"
            dataKey="precipitationProbability"
            stroke="#748ffc"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="降水確率"
            connectNulls
          />
        )}
        {pressure && (
          <Line
            yAxisId="pressure"
            type="monotone"
            dataKey="pressure"
            stroke="#495057"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="気圧"
            connectNulls
          />
        )}
        {uvIndex && (
          <Line
            yAxisId="uvIndex"
            type="monotone"
            dataKey="uvIndex"
            stroke="#f59f00"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="紫外線指数"
            connectNulls
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
