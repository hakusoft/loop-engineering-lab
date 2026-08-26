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
  const windSpeed = data.series.find((s) => s.label === "風速");
  const upperWindSpeed = data.series.find((s) => s.label === "上空の風速");
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
      windSpeed: undefined,
      upperWindSpeed: undefined,
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
    windSpeed: windSpeed?.values[i] ?? null,
    upperWindSpeed: upperWindSpeed?.values[i] ?? null,
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
    windSpeed,
    upperWindSpeed,
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

// 夜間表示（App.tsx の NIGHT_THEME）では背景が濃紺になるため、目盛り・グリッド線・
// 現在時刻線のデフォルト色（グレー系）はコントラストが低く読みにくい。
// 昼夜で色を切り替える。
function chartColors(isDay: boolean | undefined) {
  if (isDay === false) {
    return { grid: "#3a3a5a", tick: "#cfcfe6", referenceLine: "#8888bb", referenceLabel: "#aaaadd" };
  }
  return { grid: "#eee", tick: "#666", referenceLine: "#888", referenceLabel: "#888" };
}

// now と同じローカル日付（年月日）の部分だけを "YYYY-MM-DD" で返す。
// timestamps は Asia/Tokyo のローカル時刻文字列なので、ブラウザのローカル日付と比較する。
function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// series の紫外線指数のうち、now と同じ日の中で最大の値とその時刻を返す。
// 該当する系列がない、または今日の値が一つもない場合は null。
export function uvIndexPeak(
  data: SeriesResponse,
  now: Date,
): { time: string; value: number } | null {
  const uvIndex = data.series.find((s) => s.label === "紫外線指数");
  if (!uvIndex) {
    return null;
  }
  const today = localDateKey(now);
  let bestIndex = -1;
  let bestValue = -Infinity;
  data.timestamps.forEach((t, i) => {
    if (localDateKey(new Date(t)) !== today) {
      return;
    }
    const value = uvIndex.values[i];
    if (value !== null && value > bestValue) {
      bestValue = value;
      bestIndex = i;
    }
  });
  if (bestIndex === -1) {
    return null;
  }
  return { time: data.timestamps[bestIndex].slice(11, 16), value: bestValue };
}

export function formatUvIndexPeak(data: SeriesResponse, now: Date): string | null {
  const peak = uvIndexPeak(data, now);
  if (!peak) {
    return null;
  }
  return `紫外線指数のピークは${peak.time}ごろ（指数 ${Math.round(peak.value * 10) / 10}）`;
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

export function TemperatureChart({ data, isDay }: { data: SeriesResponse; isDay?: boolean }) {
  const {
    rows,
    temperatureUnit,
    apparentTemperature,
    humidity,
    rain,
    snow,
    precipitationProbability,
    pressure,
    windSpeed,
    upperWindSpeed,
    uvIndex,
  } = toChartData(data);
  const isNarrow = useIsNarrowViewport();
  const tickFontSize = isNarrow ? 15 : 12;
  const axisWidth = isNarrow ? 68 : 56;
  // 目盛りを拡大した分、右端のラベルが枠からはみ出さないよう余白も広げる。
  const chartRightMargin = isNarrow ? 40 : 24;
  const nowLabel = nearestTimeLabel(data.timestamps, rows, new Date());
  const dateBoundaries = dateBoundaryLabels(data.timestamps, rows);
  const uvPeakText = formatUvIndexPeak(data, new Date());
  const colors = chartColors(isDay);

  return (
    <>
    {uvPeakText && (
      <p style={{ color: colors.tick, fontSize: 14, margin: "0 0 8px" }}>{uvPeakText}</p>
    )}
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={rows} margin={{ top: 16, right: chartRightMargin, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="time" minTickGap={40} tick={{ fontSize: tickFontSize, fill: colors.tick }} />
        {nowLabel && (
          <ReferenceLine
            yAxisId="temperature"
            x={nowLabel}
            stroke={colors.referenceLine}
            strokeDasharray="4 4"
            label={{ value: "現在", position: "top", fontSize: tickFontSize, fill: colors.referenceLine }}
          />
        )}
        {dateBoundaries.map((boundary) => (
          <ReferenceLine
            key={boundary.time}
            yAxisId="temperature"
            x={boundary.time}
            stroke={colors.grid}
            label={{ value: boundary.date, position: "top", fontSize: tickFontSize, fill: colors.referenceLabel }}
          />
        ))}
        <YAxis
          yAxisId="temperature"
          unit={temperatureUnit}
          width={axisWidth}
          domain={["dataMin - 1", "dataMax + 1"]}
          tick={{ fontSize: tickFontSize, fill: colors.tick }}
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
        {windSpeed && (
          // 風速も他系列と単位・スケールが違うので、独立した軸にする。
          <YAxis yAxisId="windSpeed" hide domain={[0, Math.max(windSpeed.max ?? 0, 1) + 1]} />
        )}
        {upperWindSpeed && (
          // 上空の風速は地上より大きくなるので、地上の風速とも軸を分ける。
          <YAxis
            yAxisId="upperWindSpeed"
            hide
            domain={[0, Math.max(upperWindSpeed.max ?? 0, 1) + 1]}
          />
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
                            : name === "風速"
                              ? windSpeed?.unit
                              : name === "上空の風速"
                                ? upperWindSpeed?.unit
                                : uvIndex?.unit;
            return [`${v}${unit ?? ""}`, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: tickFontSize, color: colors.tick }} />
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
        {windSpeed && (
          <Line
            yAxisId="windSpeed"
            type="monotone"
            dataKey="windSpeed"
            stroke="#12b886"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="風速"
            connectNulls
          />
        )}
        {upperWindSpeed && (
          <Line
            yAxisId="upperWindSpeed"
            type="monotone"
            dataKey="upperWindSpeed"
            stroke="#7048e8"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="上空の風速"
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
    </>
  );
}
