import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
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
  const temperature80m = data.series.find((s) => s.label === "上空の気温(80m)");
  const temperature120m = data.series.find((s) => s.label === "上空の気温(120m)");
  const temperature180m = data.series.find((s) => s.label === "上空の気温(180m)");
  const temperature925hPa = data.series.find((s) => s.label === "925hPaの気温");
  const freezingLevel = data.series.find((s) => s.label === "凍結高度");
  const soilTemperature0cm = data.series.find((s) => s.label === "土の温度(地表)");
  const soilTemperature6cm = data.series.find((s) => s.label === "土の温度(6cm)");
  const soilTemperature18cm = data.series.find((s) => s.label === "土の温度(18cm)");
  const soilTemperature54cm = data.series.find((s) => s.label === "土の温度(54cm)");
  const apparentTemperature = data.series.find((s) => s.label === "体感温度");
  const dewPoint = data.series.find((s) => s.label === "露点温度");
  const wetBulbTemperature = data.series.find((s) => s.label === "湿球温度");
  const vaporPressureDeficit = data.series.find((s) => s.label === "飽差(VPD)");
  const humidity = data.series.find((s) => s.label === "湿度");
  const rain = data.series.find((s) => s.label === "雨量");
  const snow = data.series.find((s) => s.label === "降雪量");
  const snowDepth = data.series.find((s) => s.label === "積雪の深さ");
  const precipitationProbability = data.series.find((s) => s.label === "降水確率");
  const evapotranspiration = data.series.find((s) => s.label === "蒸発散量");
  const pressure = data.series.find((s) => s.label === "気圧");
  const seaLevelPressure = data.series.find((s) => s.label === "海面気圧");
  const cloudCover = data.series.find((s) => s.label === "雲量");
  const cloudCoverLow = data.series.find((s) => s.label === "雲量(低層)");
  const cloudCoverMid = data.series.find((s) => s.label === "雲量(中層)");
  const cloudCoverHigh = data.series.find((s) => s.label === "雲量(高層)");
  const convectiveInhibition = data.series.find((s) => s.label === "対流抑制(CIN)");
  const boundaryLayerHeight = data.series.find((s) => s.label === "境界層の高さ");
  const windSpeed = data.series.find((s) => s.label === "風速");
  const windDirection = data.series.find((s) => s.label === "風向き");
  const windGusts = data.series.find((s) => s.label === "瞬間風速");
  const windSpeed700hPa = data.series.find((s) => s.label === "700hPaの風速");
  const windDirection700hPa = data.series.find((s) => s.label === "700hPaの風向き");
  const upperWindSpeed = data.series.find((s) => s.label === "上空の風速");
  const upperWindDirection = data.series.find((s) => s.label === "上空の風向き");
  const upperWindSpeed80m = data.series.find((s) => s.label === "上空の風速(80m)");
  const upperWindDirection80m = data.series.find((s) => s.label === "上空の風向き(80m)");
  const upperWindSpeed120m = data.series.find((s) => s.label === "上空の風速(120m)");
  const upperWindDirection120m = data.series.find((s) => s.label === "上空の風向き(120m)");
  const upperWindSpeed180m = data.series.find((s) => s.label === "上空の風速(180m)");
  const upperWindDirection180m = data.series.find((s) => s.label === "上空の風向き(180m)");
  const windSpeed925hPa = data.series.find((s) => s.label === "925hPaの風速");
  const windDirection925hPa = data.series.find((s) => s.label === "925hPaの風向き");
  const uvIndex = data.series.find((s) => s.label === "紫外線指数");
  const shortwaveRadiation = data.series.find((s) => s.label === "日射量");
  const sunshineDuration = data.series.find((s) => s.label === "日照時間");
  const visibility = data.series.find((s) => s.label === "視程");
  if (!temperature) {
    return {
      rows: [],
      temperatureUnit: "°C",
      temperature80m: undefined,
      temperature120m: undefined,
      temperature180m: undefined,
      temperature925hPa: undefined,
      freezingLevel: undefined,
      soilTemperature0cm: undefined,
      soilTemperature6cm: undefined,
      soilTemperature18cm: undefined,
      soilTemperature54cm: undefined,
      apparentTemperature: undefined,
      dewPoint: undefined,
      wetBulbTemperature: undefined,
      vaporPressureDeficit: undefined,
      humidity: undefined,
      rain: undefined,
      snow: undefined,
      snowDepth: undefined,
      precipitationProbability: undefined,
      evapotranspiration: undefined,
      pressure: undefined,
      seaLevelPressure: undefined,
      cloudCover: undefined,
      cloudCoverLow: undefined,
      cloudCoverMid: undefined,
      cloudCoverHigh: undefined,
      convectiveInhibition: undefined,
      boundaryLayerHeight: undefined,
      windSpeed: undefined,
      windDirection: undefined,
      windGusts: undefined,
      windSpeed700hPa: undefined,
      windDirection700hPa: undefined,
      upperWindSpeed: undefined,
      upperWindDirection: undefined,
      upperWindSpeed80m: undefined,
      upperWindDirection80m: undefined,
      upperWindSpeed120m: undefined,
      upperWindDirection120m: undefined,
      upperWindSpeed180m: undefined,
      upperWindDirection180m: undefined,
      windSpeed925hPa: undefined,
      windDirection925hPa: undefined,
      uvIndex: undefined,
      shortwaveRadiation: undefined,
      sunshineDuration: undefined,
      visibility: undefined,
    };
  }

  const rows = data.timestamps.map((t, i) => ({
    // "2026-07-21T00:00" -> "21日 00:00" 程度の短い表示に。
    time: t.slice(8, 10) + "日 " + t.slice(11, 16),
    temperature: temperature.values[i],
    temperature80m: temperature80m?.values[i] ?? null,
    temperature120m: temperature120m?.values[i] ?? null,
    temperature180m: temperature180m?.values[i] ?? null,
    temperature925hPa: temperature925hPa?.values[i] ?? null,
    freezingLevel: freezingLevel?.values[i] ?? null,
    soilTemperature0cm: soilTemperature0cm?.values[i] ?? null,
    soilTemperature6cm: soilTemperature6cm?.values[i] ?? null,
    soilTemperature18cm: soilTemperature18cm?.values[i] ?? null,
    soilTemperature54cm: soilTemperature54cm?.values[i] ?? null,
    apparentTemperature: apparentTemperature?.values[i] ?? null,
    dewPoint: dewPoint?.values[i] ?? null,
    wetBulbTemperature: wetBulbTemperature?.values[i] ?? null,
    vaporPressureDeficit: vaporPressureDeficit?.values[i] ?? null,
    humidity: humidity?.values[i] ?? null,
    rain: rain?.values[i] ?? null,
    snow: snow?.values[i] ?? null,
    snowDepth: snowDepth?.values[i] ?? null,
    precipitationProbability: precipitationProbability?.values[i] ?? null,
    evapotranspiration: evapotranspiration?.values[i] ?? null,
    pressure: pressure?.values[i] ?? null,
    seaLevelPressure: seaLevelPressure?.values[i] ?? null,
    cloudCover: cloudCover?.values[i] ?? null,
    cloudCoverLow: cloudCoverLow?.values[i] ?? null,
    cloudCoverMid: cloudCoverMid?.values[i] ?? null,
    cloudCoverHigh: cloudCoverHigh?.values[i] ?? null,
    convectiveInhibition: convectiveInhibition?.values[i] ?? null,
    boundaryLayerHeight: boundaryLayerHeight?.values[i] ?? null,
    windSpeed: windSpeed?.values[i] ?? null,
    windDirection: windDirection?.values[i] ?? null,
    windGusts: windGusts?.values[i] ?? null,
    windSpeed700hPa: windSpeed700hPa?.values[i] ?? null,
    windDirection700hPa: windDirection700hPa?.values[i] ?? null,
    upperWindSpeed: upperWindSpeed?.values[i] ?? null,
    upperWindDirection: upperWindDirection?.values[i] ?? null,
    upperWindSpeed80m: upperWindSpeed80m?.values[i] ?? null,
    upperWindDirection80m: upperWindDirection80m?.values[i] ?? null,
    upperWindSpeed120m: upperWindSpeed120m?.values[i] ?? null,
    upperWindDirection120m: upperWindDirection120m?.values[i] ?? null,
    upperWindSpeed180m: upperWindSpeed180m?.values[i] ?? null,
    upperWindDirection180m: upperWindDirection180m?.values[i] ?? null,
    windSpeed925hPa: windSpeed925hPa?.values[i] ?? null,
    windDirection925hPa: windDirection925hPa?.values[i] ?? null,
    uvIndex: uvIndex?.values[i] ?? null,
    shortwaveRadiation: shortwaveRadiation?.values[i] ?? null,
    sunshineDuration: sunshineDuration?.values[i] ?? null,
    visibility: visibility?.values[i] ?? null,
  }));
  return {
    rows,
    temperatureUnit: temperature.unit,
    temperature80m,
    temperature120m,
    temperature180m,
    temperature925hPa,
    freezingLevel,
    soilTemperature0cm,
    soilTemperature6cm,
    soilTemperature18cm,
    soilTemperature54cm,
    apparentTemperature,
    dewPoint,
    wetBulbTemperature,
    vaporPressureDeficit,
    humidity,
    rain,
    snow,
    snowDepth,
    precipitationProbability,
    evapotranspiration,
    pressure,
    seaLevelPressure,
    cloudCover,
    cloudCoverLow,
    cloudCoverMid,
    cloudCoverHigh,
    convectiveInhibition,
    boundaryLayerHeight,
    windSpeed,
    windDirection,
    windGusts,
    windSpeed700hPa,
    windDirection700hPa,
    upperWindSpeed,
    upperWindDirection,
    upperWindSpeed80m,
    upperWindDirection80m,
    upperWindSpeed120m,
    upperWindDirection120m,
    upperWindSpeed180m,
    upperWindDirection180m,
    windSpeed925hPa,
    windDirection925hPa,
    uvIndex,
    shortwaveRadiation,
    sunshineDuration,
    visibility,
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

// thunderstorm_hours（雷を伴う天気になる時刻の一覧、timestamps の部分集合）を、
// グラフに ReferenceArea で塗れる連続した範囲（x1〜x2）にまとめる。ThunderstormOutlook
// は文章だけで、グラフを見ながら雷の時間帯を把握したいという声があった（Issue #379）。
// バラバラの時刻ごとに描くと帯というより点線に見えてしまうため、連続区間ごとにまとめる。
export function thunderstormRanges(
  timestamps: string[],
  thunderstormHours: string[],
  rows: { time: string }[],
): { x1: string; x2: string }[] {
  if (timestamps.length === 0 || timestamps.length !== rows.length || thunderstormHours.length === 0) {
    return [];
  }
  const hourSet = new Set(thunderstormHours);
  const ranges: { x1: string; x2: string }[] = [];
  let start: number | null = null;
  for (let i = 0; i < timestamps.length; i++) {
    if (hourSet.has(timestamps[i])) {
      if (start === null) {
        start = i;
      }
    } else if (start !== null) {
      ranges.push({ x1: rows[start].time, x2: rows[i - 1].time });
      start = null;
    }
  }
  if (start !== null) {
    ranges.push({ x1: rows[start].time, x2: rows[timestamps.length - 1].time });
  }
  return ranges;
}

// 夜間表示（App.tsx の NIGHT_THEME）では背景が濃紺になるため、目盛り・グリッド線・
// 現在時刻線のデフォルト色（グレー系）はコントラストが低く読みにくい。
// 昼夜で色を切り替える。
//
// 気温・体感温度（グラフ本体の常に出ている基本線）も、昼間向けの色（暖色2色が
// 近く、暗い背景ではさらに見分けにくい）のままだと読みにくいという声があった
// （Issue #359）。夜間はコントラストが高く、かつ2色の見分けがつきやすい色にする。
function chartColors(isDay: boolean | undefined) {
  if (isDay === false) {
    return {
      grid: "#3a3a5a",
      tick: "#cfcfe6",
      referenceLine: "#8888bb",
      referenceLabel: "#aaaadd",
      temperature: "#ff6b52",
      apparentTemperature: "#ffe066",
      thunderstorm: "#ff8a65",
    };
  }
  return {
    grid: "#eee",
    tick: "#666",
    referenceLine: "#888",
    referenceLabel: "#888",
    temperature: "#e2492c",
    apparentTemperature: "#f4a300",
    thunderstorm: "#e2492c",
  };
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

// 気温グラフの系列が増え、常に全部重ねて表示すると何の線か分かりにくいという
// 声があった（Issue #262）。気温・降水（雨量・降雪量）は主要な系列として常に
// 表示し、それ以外はチェックボックスで必要な時だけ追加できるようにする。
//
// さらに項目が増え、目当てのチェックボックスを探すのが大変になったという
// 声を受け、カテゴリでグループ分けする（Issue #401）。カテゴリ名は
// displayItems.ts の DISPLAY_ITEMS で使っているものに揃える。
const SECONDARY_SERIES = [
  { key: "temperature80m", label: "上空の気温(80m)", category: "気温" },
  { key: "temperature120m", label: "上空の気温(120m)", category: "気温" },
  { key: "temperature180m", label: "上空の気温(180m)", category: "気温" },
  { key: "temperature925hPa", label: "925hPaの気温", category: "気温" },
  { key: "apparentTemperature", label: "体感温度", category: "気温" },
  { key: "dewPoint", label: "露点温度", category: "気温" },
  { key: "wetBulbTemperature", label: "湿球温度", category: "気温" },
  { key: "vaporPressureDeficit", label: "飽差(VPD)", category: "気温" },
  { key: "soilTemperature0cm", label: "土の温度(地表)", category: "降水・湿度" },
  { key: "soilTemperature6cm", label: "土の温度(6cm)", category: "降水・湿度" },
  { key: "soilTemperature18cm", label: "土の温度(18cm)", category: "降水・湿度" },
  { key: "soilTemperature54cm", label: "土の温度(54cm)", category: "降水・湿度" },
  { key: "humidity", label: "湿度", category: "降水・湿度" },
  { key: "snowDepth", label: "積雪の深さ", category: "降水・湿度" },
  { key: "precipitationProbability", label: "降水確率", category: "降水・湿度" },
  { key: "evapotranspiration", label: "蒸発散量", category: "降水・湿度" },
  { key: "pressure", label: "気圧", category: "環境" },
  { key: "seaLevelPressure", label: "海面気圧", category: "環境" },
  { key: "cloudCover", label: "雲量", category: "環境" },
  { key: "cloudCoverLow", label: "雲量(低層)", category: "環境" },
  { key: "cloudCoverMid", label: "雲量(中層)", category: "環境" },
  { key: "cloudCoverHigh", label: "雲量(高層)", category: "環境" },
  { key: "convectiveInhibition", label: "対流抑制(CIN)", category: "環境" },
  { key: "boundaryLayerHeight", label: "境界層の高さ", category: "環境" },
  { key: "freezingLevel", label: "凍結高度", category: "環境" },
  { key: "uvIndex", label: "紫外線指数", category: "環境" },
  { key: "shortwaveRadiation", label: "日射量", category: "環境" },
  { key: "sunshineDuration", label: "日照時間", category: "環境" },
  { key: "visibility", label: "視程", category: "環境" },
  { key: "windSpeed", label: "風速", category: "風" },
  { key: "windDirection", label: "風向き", category: "風" },
  { key: "windGusts", label: "瞬間風速", category: "風" },
  { key: "windSpeed700hPa", label: "700hPaの風速", category: "風" },
  { key: "windDirection700hPa", label: "700hPaの風向き", category: "風" },
  { key: "upperWindSpeed", label: "上空の風速", category: "風" },
  { key: "upperWindDirection", label: "上空の風向き", category: "風" },
  { key: "upperWindSpeed80m", label: "上空の風速(80m)", category: "風" },
  { key: "upperWindDirection80m", label: "上空の風向き(80m)", category: "風" },
  { key: "upperWindSpeed120m", label: "上空の風速(120m)", category: "風" },
  { key: "upperWindDirection120m", label: "上空の風向き(120m)", category: "風" },
  { key: "upperWindSpeed180m", label: "上空の風速(180m)", category: "風" },
  { key: "upperWindDirection180m", label: "上空の風向き(180m)", category: "風" },
  { key: "windSpeed925hPa", label: "925hPaの風速", category: "風" },
  { key: "windDirection925hPa", label: "925hPaの風向き", category: "風" },
] as const;

// チェックボックスをグループ表示する順番。displayItems.ts の CATEGORY_ORDER と
// 完全には揃えていない（気温グラフには「日照・時刻」の系列が無いため）。
const SECONDARY_SERIES_CATEGORY_ORDER = ["気温", "風", "降水・湿度", "環境"] as const;

type SecondarySeriesKey = (typeof SECONDARY_SERIES)[number]["key"];

const SECONDARY_SERIES_KEYS = new Set<string>(SECONDARY_SERIES.map(({ key }) => key));

// チェックボックスの色見本用。各項目の stroke 色（下の <Line> 群）と同じ値を
// ここにまとめておく。項目名だけだとグラフのどの色の線か分かりにくいという
// 声（Issue #436）を受けて追加した。
// apparentTemperature だけはダーク/ライトで色が変わる（colors.apparentTemperature）ため、
// ここでは占位の値を置き、描画側で colors から取った値に差し替える。
const SECONDARY_SERIES_COLOR: Record<SecondarySeriesKey, string> = {
  temperature80m: "#4263eb",
  temperature120m: "#5c940d",
  temperature180m: "#ae3ec9",
  temperature925hPa: "#1c7ed6",
  apparentTemperature: "",
  dewPoint: "#20c997",
  wetBulbTemperature: "#e8590c",
  vaporPressureDeficit: "#d6336c",
  soilTemperature0cm: "#8d6e63",
  soilTemperature6cm: "#a1662f",
  soilTemperature18cm: "#c1440e",
  soilTemperature54cm: "#6f4518",
  humidity: "#2c7be2",
  snowDepth: "#364fc7",
  precipitationProbability: "#748ffc",
  evapotranspiration: "#099268",
  pressure: "#495057",
  seaLevelPressure: "#5f3dc4",
  cloudCover: "#868e96",
  cloudCoverLow: "#5c7cfa",
  cloudCoverMid: "#adb5bd",
  cloudCoverHigh: "#343a40",
  convectiveInhibition: "#862e9c",
  boundaryLayerHeight: "#099268",
  freezingLevel: "#4263eb",
  uvIndex: "#ffd43b",
  shortwaveRadiation: "#fd7e14",
  sunshineDuration: "#f59f00",
  visibility: "#1098ad",
  windSpeed: "#e64980",
  windDirection: "#0ca678",
  windGusts: "#f76707",
  windSpeed700hPa: "#c92a2a",
  windDirection700hPa: "#5c7cfa",
  upperWindSpeed: "#7048e8",
  upperWindDirection: "#1864ab",
  upperWindSpeed80m: "#9c36b5",
  upperWindDirection80m: "#0c8599",
  upperWindSpeed120m: "#2b8a3e",
  upperWindDirection120m: "#495057",
  upperWindSpeed180m: "#e8590c",
  upperWindDirection180m: "#d6336c",
  windSpeed925hPa: "#f06595",
  windDirection925hPa: "#0b7285",
};

// availableSecondary（表示可能な項目）をカテゴリごとにまとめる。カテゴリ内の
// 順序は SECONDARY_SERIES の並びのまま、カテゴリの並びは
// SECONDARY_SERIES_CATEGORY_ORDER に従う。表示可能な項目が1つも無いカテゴリは
// 見出しごと出さない。
function groupSecondaryByCategory<T extends { category: string }>(
  items: readonly T[],
): { category: string; items: T[] }[] {
  return SECONDARY_SERIES_CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}

// チェックボックスの選択状態を保存するキー。毎回同じ組み合わせを選び直すのが
// 面倒という声を受け、次回表示時にも引き継ぐ（Issue #310）。
const VISIBLE_SECONDARY_STORAGE_KEY = "loop-engineering-lab:temperature-chart-visible-secondary";

// localStorage が使えない環境（プライベートブラウジング等）でも落ちないようにする。
// 保存が無い、あるいは壊れている場合は降水確率のみ ON のデフォルトに戻す。
function readStoredVisibleSecondary(): Set<SecondarySeriesKey> | undefined {
  try {
    const stored = localStorage.getItem(VISIBLE_SECONDARY_STORAGE_KEY);
    if (stored === null) {
      return undefined;
    }
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return undefined;
    }
    return new Set(parsed.filter((key): key is SecondarySeriesKey => SECONDARY_SERIES_KEYS.has(key)));
  } catch {
    return undefined;
  }
}

function writeStoredVisibleSecondary(keys: Set<SecondarySeriesKey>) {
  try {
    localStorage.setItem(VISIBLE_SECONDARY_STORAGE_KEY, JSON.stringify([...keys]));
  } catch {
    // 保存できなくても表示は続行する。
  }
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

type LegendPayloadEntry = { value?: string; color?: string };

// Legend のデフォルト描画は横一列に並べるだけで折り返さず、スマホで複数系列を
// 選ぶと凡例が画面の外にはみ出て読めなくなるという声があった（Issue #417）。
// flexWrap で折り返す独自の凡例に差し替える。
function WrappingLegend({
  payload,
  isNarrow,
  color,
}: {
  payload?: LegendPayloadEntry[];
  isNarrow: boolean;
  color: string;
}) {
  if (!payload || payload.length === 0) return null;
  return (
    <ul
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: isNarrow ? "4px 10px" : "4px 14px",
        padding: 0,
        margin: isNarrow ? "4px 0 0" : "8px 0 0",
        listStyle: "none",
        fontSize: isNarrow ? 12 : 13,
        color,
      }}
    >
      {payload.map((entry, i) => (
        <li key={`legend-${entry.value ?? i}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: entry.color,
              flexShrink: 0,
            }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export function TemperatureChart({ data, isDay }: { data: SeriesResponse; isDay?: boolean }) {
  const {
    rows,
    temperatureUnit,
    temperature80m,
    temperature120m,
    temperature180m,
    temperature925hPa,
    freezingLevel,
    soilTemperature0cm,
    soilTemperature6cm,
    soilTemperature18cm,
    soilTemperature54cm,
    apparentTemperature,
    dewPoint,
    wetBulbTemperature,
    vaporPressureDeficit,
    humidity,
    rain,
    snow,
    snowDepth,
    precipitationProbability,
    evapotranspiration,
    pressure,
    seaLevelPressure,
    cloudCover,
    cloudCoverLow,
    cloudCoverMid,
    cloudCoverHigh,
    convectiveInhibition,
    boundaryLayerHeight,
    windSpeed,
    windDirection,
    windGusts,
    windSpeed700hPa,
    windDirection700hPa,
    upperWindSpeed,
    upperWindDirection,
    upperWindSpeed80m,
    upperWindDirection80m,
    upperWindSpeed120m,
    upperWindDirection120m,
    upperWindSpeed180m,
    upperWindDirection180m,
    windSpeed925hPa,
    windDirection925hPa,
    uvIndex,
    shortwaveRadiation,
    sunshineDuration,
    visibility,
  } = toChartData(data);
  const isNarrow = useIsNarrowViewport();
  const tickFontSize = isNarrow ? 15 : 12;
  const axisWidth = isNarrow ? 68 : 56;
  // 目盛りを拡大した分、右端のラベルが枠からはみ出さないよう余白も広げる。
  const chartRightMargin = isNarrow ? 40 : 24;
  // スマホだとグラフ下の余白が広くスクロールが長くなるという声（Issue #430）を受け、
  // 狭い画面では高さと下側の余白を削る。広い画面の表示は変えない。
  const chartHeight = isNarrow ? 300 : 360;
  const chartBottomMargin = isNarrow ? 4 : 8;
  const nowLabel = nearestTimeLabel(data.timestamps, rows, new Date());
  const dateBoundaries = dateBoundaryLabels(data.timestamps, rows);
  const uvPeakText = formatUvIndexPeak(data, new Date());
  const colors = chartColors(isDay);
  const stormRanges = thunderstormRanges(data.timestamps, data.thunderstorm_hours, rows);

  // 降水確率は「傘が要るかすぐ分かりたい」という要望から、他の副系列と違い
  // デフォルトで表示する（Issue #272）。保存された選択があればそちらを使う
  // （Issue #310）。
  const [visibleSecondary, setVisibleSecondary] = useState<Set<SecondarySeriesKey>>(
    () => readStoredVisibleSecondary() ?? new Set(["precipitationProbability"]),
  );
  const availableSecondary = useMemo(
    () =>
      SECONDARY_SERIES.filter(({ key }) => {
        switch (key) {
          case "temperature80m":
            return Boolean(temperature80m);
          case "temperature120m":
            return Boolean(temperature120m);
          case "temperature180m":
            return Boolean(temperature180m);
          case "temperature925hPa":
            return Boolean(temperature925hPa);
          case "freezingLevel":
            return Boolean(freezingLevel);
          case "soilTemperature0cm":
            return Boolean(soilTemperature0cm);
          case "soilTemperature6cm":
            return Boolean(soilTemperature6cm);
          case "soilTemperature18cm":
            return Boolean(soilTemperature18cm);
          case "soilTemperature54cm":
            return Boolean(soilTemperature54cm);
          case "apparentTemperature":
            return Boolean(apparentTemperature);
          case "dewPoint":
            return Boolean(dewPoint);
          case "wetBulbTemperature":
            return Boolean(wetBulbTemperature);
          case "vaporPressureDeficit":
            return Boolean(vaporPressureDeficit);
          case "humidity":
            return Boolean(humidity);
          case "snowDepth":
            return Boolean(snowDepth);
          case "precipitationProbability":
            return Boolean(precipitationProbability);
          case "evapotranspiration":
            return Boolean(evapotranspiration);
          case "pressure":
            return Boolean(pressure);
          case "seaLevelPressure":
            return Boolean(seaLevelPressure);
          case "cloudCover":
            return Boolean(cloudCover);
          case "cloudCoverLow":
            return Boolean(cloudCoverLow);
          case "cloudCoverMid":
            return Boolean(cloudCoverMid);
          case "cloudCoverHigh":
            return Boolean(cloudCoverHigh);
          case "convectiveInhibition":
            return Boolean(convectiveInhibition);
          case "boundaryLayerHeight":
            return Boolean(boundaryLayerHeight);
          case "windSpeed":
            return Boolean(windSpeed);
          case "windDirection":
            return Boolean(windDirection);
          case "windGusts":
            return Boolean(windGusts);
          case "windSpeed700hPa":
            return Boolean(windSpeed700hPa);
          case "windDirection700hPa":
            return Boolean(windDirection700hPa);
          case "upperWindSpeed":
            return Boolean(upperWindSpeed);
          case "upperWindDirection":
            return Boolean(upperWindDirection);
          case "upperWindSpeed80m":
            return Boolean(upperWindSpeed80m);
          case "upperWindDirection80m":
            return Boolean(upperWindDirection80m);
          case "upperWindSpeed120m":
            return Boolean(upperWindSpeed120m);
          case "upperWindDirection120m":
            return Boolean(upperWindDirection120m);
          case "upperWindSpeed180m":
            return Boolean(upperWindSpeed180m);
          case "upperWindDirection180m":
            return Boolean(upperWindDirection180m);
          case "windSpeed925hPa":
            return Boolean(windSpeed925hPa);
          case "windDirection925hPa":
            return Boolean(windDirection925hPa);
          case "uvIndex":
            return Boolean(uvIndex);
          case "shortwaveRadiation":
            return Boolean(shortwaveRadiation);
          case "sunshineDuration":
            return Boolean(sunshineDuration);
          case "visibility":
            return Boolean(visibility);
        }
      }),
    [
      temperature80m,
      temperature120m,
      temperature180m,
      temperature925hPa,
      freezingLevel,
      soilTemperature0cm,
      soilTemperature6cm,
      soilTemperature18cm,
      soilTemperature54cm,
      apparentTemperature,
      dewPoint,
      humidity,
      snowDepth,
      precipitationProbability,
      evapotranspiration,
      pressure,
      seaLevelPressure,
      cloudCover,
      cloudCoverLow,
      cloudCoverMid,
      cloudCoverHigh,
      convectiveInhibition,
      boundaryLayerHeight,
      windSpeed,
      windDirection,
      windGusts,
      windSpeed700hPa,
      windDirection700hPa,
      upperWindSpeed,
      upperWindDirection,
      upperWindSpeed80m,
      upperWindDirection80m,
      upperWindSpeed120m,
      upperWindDirection120m,
      upperWindSpeed180m,
      upperWindDirection180m,
      windSpeed925hPa,
      windDirection925hPa,
      uvIndex,
      shortwaveRadiation,
      sunshineDuration,
      visibility,
    ],
  );

  function toggleSecondary(key: SecondarySeriesKey) {
    setVisibleSecondary((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      writeStoredVisibleSecondary(next);
      return next;
    });
  }

  const showTemperature80m = temperature80m && visibleSecondary.has("temperature80m");
  const showTemperature120m = temperature120m && visibleSecondary.has("temperature120m");
  const showTemperature180m = temperature180m && visibleSecondary.has("temperature180m");
  const showTemperature925hPa = temperature925hPa && visibleSecondary.has("temperature925hPa");
  const showFreezingLevel = freezingLevel && visibleSecondary.has("freezingLevel");
  const showSoilTemperature0cm = soilTemperature0cm && visibleSecondary.has("soilTemperature0cm");
  const showSoilTemperature6cm = soilTemperature6cm && visibleSecondary.has("soilTemperature6cm");
  const showSoilTemperature18cm = soilTemperature18cm && visibleSecondary.has("soilTemperature18cm");
  const showSoilTemperature54cm = soilTemperature54cm && visibleSecondary.has("soilTemperature54cm");
  const showApparentTemperature = apparentTemperature && visibleSecondary.has("apparentTemperature");
  const showDewPoint = dewPoint && visibleSecondary.has("dewPoint");
  const showWetBulbTemperature = wetBulbTemperature && visibleSecondary.has("wetBulbTemperature");
  const showVaporPressureDeficit = vaporPressureDeficit && visibleSecondary.has("vaporPressureDeficit");
  const showHumidity = humidity && visibleSecondary.has("humidity");
  const showSnowDepth = snowDepth && visibleSecondary.has("snowDepth");
  const showPrecipitationProbability = precipitationProbability && visibleSecondary.has("precipitationProbability");
  const showEvapotranspiration = evapotranspiration && visibleSecondary.has("evapotranspiration");
  const showPressure = pressure && visibleSecondary.has("pressure");
  const showSeaLevelPressure = seaLevelPressure && visibleSecondary.has("seaLevelPressure");
  const showCloudCover = cloudCover && visibleSecondary.has("cloudCover");
  const showCloudCoverLow = cloudCoverLow && visibleSecondary.has("cloudCoverLow");
  const showCloudCoverMid = cloudCoverMid && visibleSecondary.has("cloudCoverMid");
  const showCloudCoverHigh = cloudCoverHigh && visibleSecondary.has("cloudCoverHigh");
  const showConvectiveInhibition = convectiveInhibition && visibleSecondary.has("convectiveInhibition");
  const showBoundaryLayerHeight = boundaryLayerHeight && visibleSecondary.has("boundaryLayerHeight");
  const showWindSpeed = windSpeed && visibleSecondary.has("windSpeed");
  const showWindDirection = windDirection && visibleSecondary.has("windDirection");
  const showWindGusts = windGusts && visibleSecondary.has("windGusts");
  const showWindSpeed700hPa = windSpeed700hPa && visibleSecondary.has("windSpeed700hPa");
  const showWindDirection700hPa = windDirection700hPa && visibleSecondary.has("windDirection700hPa");
  const showUpperWindSpeed = upperWindSpeed && visibleSecondary.has("upperWindSpeed");
  const showUpperWindDirection = upperWindDirection && visibleSecondary.has("upperWindDirection");
  const showUpperWindSpeed80m = upperWindSpeed80m && visibleSecondary.has("upperWindSpeed80m");
  const showUpperWindDirection80m = upperWindDirection80m && visibleSecondary.has("upperWindDirection80m");
  const showUpperWindSpeed120m = upperWindSpeed120m && visibleSecondary.has("upperWindSpeed120m");
  const showUpperWindDirection120m = upperWindDirection120m && visibleSecondary.has("upperWindDirection120m");
  const showUpperWindSpeed180m = upperWindSpeed180m && visibleSecondary.has("upperWindSpeed180m");
  const showUpperWindDirection180m = upperWindDirection180m && visibleSecondary.has("upperWindDirection180m");
  const showWindSpeed925hPa = windSpeed925hPa && visibleSecondary.has("windSpeed925hPa");
  const showWindDirection925hPa = windDirection925hPa && visibleSecondary.has("windDirection925hPa");
  const showUvIndex = uvIndex && visibleSecondary.has("uvIndex");
  const showShortwaveRadiation = shortwaveRadiation && visibleSecondary.has("shortwaveRadiation");
  const showSunshineDuration = sunshineDuration && visibleSecondary.has("sunshineDuration");
  const showVisibility = visibility && visibleSecondary.has("visibility");

  return (
    <>
    {uvPeakText && (
      <p style={{ color: colors.tick, fontSize: 14, margin: "0 0 8px" }}>{uvPeakText}</p>
    )}
    {availableSecondary.length > 0 && (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, margin: "0 0 8px" }}>
        {groupSecondaryByCategory(availableSecondary).map(({ category, items }) => (
          <div key={category} style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "center" }}>
            <span style={{ fontSize: isNarrow ? 13 : 12, color: colors.tick, opacity: 0.7, minWidth: isNarrow ? "100%" : undefined }}>
              {category}
            </span>
            {items.map(({ key, label }) => (
              <label
                key={key}
                style={{
                  fontSize: isNarrow ? 15 : 13,
                  color: colors.tick,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  // スマホだと指では小さくて押しにくいという声があったため、
                  // 狭い画面ではラベル全体の余白も広げてタップ領域を確保する。
                  // 20px でもまだ狙いにくいという声（Issue #413）を受け、さらに広げた。
                  padding: isNarrow ? "8px 4px" : 0,
                }}
              >
                <input
                  type="checkbox"
                  checked={visibleSecondary.has(key)}
                  onChange={() => toggleSecondary(key)}
                  style={{
                    marginRight: 6,
                    width: isNarrow ? 24 : 13,
                    height: isNarrow ? 24 : 13,
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    marginRight: 6,
                    backgroundColor:
                      key === "apparentTemperature" ? colors.apparentTemperature : SECONDARY_SERIES_COLOR[key],
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        ))}
      </div>
    )}
    <ResponsiveContainer width="100%" height={chartHeight}>
      <LineChart data={rows} margin={{ top: 16, right: chartRightMargin, bottom: chartBottomMargin, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="time" minTickGap={40} tick={{ fontSize: tickFontSize, fill: colors.tick }} />
        {stormRanges.map((range) => (
          <ReferenceArea
            key={`storm-${range.x1}`}
            yAxisId="temperature"
            x1={range.x1}
            x2={range.x2}
            fill={colors.thunderstorm}
            fillOpacity={0.15}
            stroke={colors.thunderstorm}
            strokeOpacity={0.4}
            ifOverflow="extendDomain"
          />
        ))}
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
        {showHumidity && (
          <YAxis
            yAxisId="humidity"
            orientation="right"
            unit={humidity!.unit}
            width={axisWidth}
            domain={[humidity!.min as number, humidity!.max as number]}
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
        {showPrecipitationProbability && (
          // 降水確率は % 固定なので 0〜100 のスケールで、他系列とは別軸にする。
          <YAxis yAxisId="precipitationProbability" hide domain={[0, 100]} />
        )}
        {showUvIndex && (
          // 紫外線指数は他系列と単位もスケールも違うので、独立した軸にする。
          <YAxis yAxisId="uvIndex" hide domain={[0, Math.max(uvIndex!.max ?? 0, 1) + 1]} />
        )}
        {showSunshineDuration && (
          // 日照時間（秒）も他系列と単位・スケールが違うので、独立した軸にする。
          <YAxis
            yAxisId="sunshineDuration"
            hide
            domain={[0, Math.max(sunshineDuration!.max ?? 0, 60) + 60]}
          />
        )}
        {showEvapotranspiration && (
          // 蒸発散量も他系列と単位・スケールが違うので、独立した軸にする。
          <YAxis
            yAxisId="evapotranspiration"
            hide
            domain={[0, Math.max(evapotranspiration!.max ?? 0, 1) + 1]}
          />
        )}
        {showVaporPressureDeficit && (
          // 飽差(VPD)は kPa 単位で気温とスケールが違うので、独立した軸にする。
          <YAxis
            yAxisId="vaporPressureDeficit"
            hide
            domain={[0, Math.max(vaporPressureDeficit!.max ?? 0, 1) + 1]}
          />
        )}
        {showWindSpeed && (
          // 風速も他系列と単位・スケールが違うので、独立した軸にする。
          <YAxis yAxisId="windSpeed" hide domain={[0, Math.max(windSpeed!.max ?? 0, 1) + 1]} />
        )}
        {showWindDirection && (
          // 風向きは度数（0〜360）固定なので、風速とは別軸にする。
          <YAxis yAxisId="windDirection" hide domain={[0, 360]} />
        )}
        {showWindGusts && (
          // 瞬間風速は風速より大きくなるので、風速とも軸を分ける。
          <YAxis yAxisId="windGusts" hide domain={[0, Math.max(windGusts!.max ?? 0, 1) + 1]} />
        )}
        {showWindSpeed700hPa && (
          // 700hPa の風速も他の風速系列とスケールが異なるため、軸を分ける。
          <YAxis
            yAxisId="windSpeed700hPa"
            hide
            domain={[0, Math.max(windSpeed700hPa!.max ?? 0, 1) + 1]}
          />
        )}
        {showWindDirection700hPa && (
          // 700hPa の風向きも度数（0〜360）固定なので、他の風向き系列とは別軸にする。
          <YAxis yAxisId="windDirection700hPa" hide domain={[0, 360]} />
        )}
        {showUpperWindSpeed && (
          // 上空の風速は地上より大きくなるので、地上の風速とも軸を分ける。
          <YAxis
            yAxisId="upperWindSpeed"
            hide
            domain={[0, Math.max(upperWindSpeed!.max ?? 0, 1) + 1]}
          />
        )}
        {showUpperWindDirection && (
          // 上空の風向きも度数（0〜360）固定なので、地上の風向きとは別軸にする。
          <YAxis yAxisId="upperWindDirection" hide domain={[0, 360]} />
        )}
        {showUpperWindSpeed80m && (
          // 80m 高度の風速も850hPaの風速とスケールが異なるため、軸を分ける。
          <YAxis
            yAxisId="upperWindSpeed80m"
            hide
            domain={[0, Math.max(upperWindSpeed80m!.max ?? 0, 1) + 1]}
          />
        )}
        {showUpperWindDirection80m && (
          // 80m 高度の風向きも度数（0〜360）固定なので、他の風向き系列とは別軸にする。
          <YAxis yAxisId="upperWindDirection80m" hide domain={[0, 360]} />
        )}
        {showUpperWindSpeed120m && (
          // 120m 高度の風速も他の風速系列とスケールが異なるため、軸を分ける。
          <YAxis
            yAxisId="upperWindSpeed120m"
            hide
            domain={[0, Math.max(upperWindSpeed120m!.max ?? 0, 1) + 1]}
          />
        )}
        {showUpperWindDirection120m && (
          // 120m 高度の風向きも度数（0〜360）固定なので、他の風向き系列とは別軸にする。
          <YAxis yAxisId="upperWindDirection120m" hide domain={[0, 360]} />
        )}
        {showUpperWindSpeed180m && (
          // 180m 高度の風速も他の風速系列とスケールが異なるため、軸を分ける。
          <YAxis
            yAxisId="upperWindSpeed180m"
            hide
            domain={[0, Math.max(upperWindSpeed180m!.max ?? 0, 1) + 1]}
          />
        )}
        {showUpperWindDirection180m && (
          // 180m 高度の風向きも度数（0〜360）固定なので、他の風向き系列とは別軸にする。
          <YAxis yAxisId="upperWindDirection180m" hide domain={[0, 360]} />
        )}
        {showWindSpeed925hPa && (
          // 925hPa の風速も他の風速系列とスケールが異なるため、軸を分ける。
          <YAxis
            yAxisId="windSpeed925hPa"
            hide
            domain={[0, Math.max(windSpeed925hPa!.max ?? 0, 1) + 1]}
          />
        )}
        {showWindDirection925hPa && (
          // 925hPa の風向きも度数（0〜360）固定なので、他の風向き系列とは別軸にする。
          <YAxis yAxisId="windDirection925hPa" hide domain={[0, 360]} />
        )}
        {(showPressure || showSeaLevelPressure) && (
          // 気圧・海面気圧は他系列と単位・スケールが違うので、独立した軸にする。
          // 海面気圧は地上気圧（surface_pressure）と単位・スケールが近いため、
          // 軸は共有し、表示中の系列の min/max から範囲を決める。
          <YAxis
            yAxisId="pressure"
            hide
            domain={[
              Math.min(
                ...[showPressure ? pressure!.min : null, showSeaLevelPressure ? seaLevelPressure!.min : null].filter(
                  (v): v is number => v !== null && v !== undefined,
                ),
              ) - 1,
              Math.max(
                ...[showPressure ? pressure!.max : null, showSeaLevelPressure ? seaLevelPressure!.max : null].filter(
                  (v): v is number => v !== null && v !== undefined,
                ),
              ) + 1,
            ]}
          />
        )}
        {(showCloudCover || showCloudCoverLow || showCloudCoverMid || showCloudCoverHigh) && (
          // 雲量（全体・低層・中層・高層）は % 固定なので、降水確率と同じく
          // 0〜100 のスケールで軸を共有する。
          <YAxis yAxisId="cloudCover" hide domain={[0, 100]} />
        )}
        {showConvectiveInhibition && (
          // 対流抑制(CIN)は0以下の値を取るので、他系列とは別軸にする。
          <YAxis
            yAxisId="convectiveInhibition"
            hide
            domain={[(convectiveInhibition!.min ?? 0) - 1, Math.max(convectiveInhibition!.max ?? 0, 0)]}
          />
        )}
        {showBoundaryLayerHeight && (
          // 境界層の高さは m 単位で他系列よりスケールが大きく違うので、独立した軸にする。
          <YAxis
            yAxisId="boundaryLayerHeight"
            hide
            domain={[0, Math.max(boundaryLayerHeight!.max ?? 0, 1) + 50]}
          />
        )}
        {showVisibility && (
          // 視程は m 単位で他系列よりスケールが大きく違うので、独立した軸にする。
          <YAxis
            yAxisId="visibility"
            hide
            domain={[0, Math.max(visibility!.max ?? 0, 1) + 1]}
          />
        )}
        {showFreezingLevel && (
          // 凍結高度は m 単位で他系列よりスケールが大きく違うので、独立した軸にする。
          <YAxis
            yAxisId="freezingLevel"
            hide
            domain={[0, Math.max(freezingLevel!.max ?? 0, 1) + 50]}
          />
        )}
        {showShortwaveRadiation && (
          // 日射量（W/m²）も他系列と単位・スケールが違うので、独立した軸にする。
          <YAxis
            yAxisId="shortwaveRadiation"
            hide
            domain={[0, Math.max(shortwaveRadiation!.max ?? 0, 1) + 10]}
          />
        )}
        {showSnowDepth && (
          // 積雪の深さは m 単位で降雪量（cm）とスケールが違うので、独立した軸にする。
          <YAxis
            yAxisId="snowDepth"
            hide
            domain={[0, Math.max(snowDepth!.max ?? 0, 1) + 1]}
          />
        )}
        <Tooltip
          formatter={(v: number, name: string) => {
            const unit =
              name === "気温"
                ? temperatureUnit
                : name === "上空の気温(80m)"
                  ? temperature80m?.unit
                  : name === "上空の気温(120m)"
                    ? temperature120m?.unit
                    : name === "上空の気温(180m)"
                      ? temperature180m?.unit
                  : name === "925hPaの気温"
                    ? temperature925hPa?.unit
                  : name === "凍結高度"
                    ? freezingLevel?.unit
                  : name === "土の温度(地表)"
                    ? soilTemperature0cm?.unit
                  : name === "土の温度(6cm)"
                    ? soilTemperature6cm?.unit
                  : name === "土の温度(18cm)"
                    ? soilTemperature18cm?.unit
                  : name === "土の温度(54cm)"
                    ? soilTemperature54cm?.unit
                  : name === "体感温度"
                    ? apparentTemperature?.unit
                  : name === "露点温度"
                    ? dewPoint?.unit
                  : name === "湿球温度"
                    ? wetBulbTemperature?.unit
                  : name === "飽差(VPD)"
                    ? vaporPressureDeficit?.unit
                    : name === "湿度"
                    ? humidity?.unit
                    : name === "雨量"
                      ? rain?.unit
                      : name === "降雪量"
                        ? snow?.unit
                        : name === "降水確率"
                          ? precipitationProbability?.unit
                          : name === "蒸発散量"
                            ? evapotranspiration?.unit
                          : name === "気圧"
                            ? pressure?.unit
                            : name === "海面気圧"
                              ? seaLevelPressure?.unit
                            : name === "雲量"
                              ? cloudCover?.unit
                              : name === "雲量(低層)"
                                ? cloudCoverLow?.unit
                                : name === "雲量(中層)"
                                  ? cloudCoverMid?.unit
                                  : name === "雲量(高層)"
                                    ? cloudCoverHigh?.unit
                                    : name === "対流抑制(CIN)"
                                      ? convectiveInhibition?.unit
                                      : name === "境界層の高さ"
                                        ? boundaryLayerHeight?.unit
                              : name === "風速"
                                ? windSpeed?.unit
                                : name === "風向き"
                                  ? windDirection?.unit
                                  : name === "瞬間風速"
                                    ? windGusts?.unit
                                    : name === "700hPaの風速"
                                      ? windSpeed700hPa?.unit
                                      : name === "700hPaの風向き"
                                        ? windDirection700hPa?.unit
                                    : name === "上空の風速"
                                    ? upperWindSpeed?.unit
                                    : name === "上空の風向き"
                                      ? upperWindDirection?.unit
                                      : name === "上空の風速(80m)"
                                        ? upperWindSpeed80m?.unit
                                        : name === "上空の風向き(80m)"
                                          ? upperWindDirection80m?.unit
                                        : name === "上空の風速(120m)"
                                          ? upperWindSpeed120m?.unit
                                          : name === "上空の風向き(120m)"
                                            ? upperWindDirection120m?.unit
                                          : name === "上空の風速(180m)"
                                            ? upperWindSpeed180m?.unit
                                            : name === "上空の風向き(180m)"
                                              ? upperWindDirection180m?.unit
                                        : name === "925hPaの風速"
                                          ? windSpeed925hPa?.unit
                                          : name === "925hPaの風向き"
                                            ? windDirection925hPa?.unit
                                        : name === "視程"
                                          ? visibility?.unit
                                          : name === "積雪の深さ"
                                            ? snowDepth?.unit
                                            : name === "日照時間"
                                              ? sunshineDuration?.unit
                                              : name === "日射量"
                                                ? shortwaveRadiation?.unit
                                                : uvIndex?.unit;
            return [`${v}${unit ?? ""}`, name];
          }}
        />
        <Legend
          content={(props) => (
            <WrappingLegend
              payload={props.payload as LegendPayloadEntry[] | undefined}
              isNarrow={isNarrow}
              color={colors.tick}
            />
          )}
        />
        <Line
          yAxisId="temperature"
          type="monotone"
          dataKey="temperature"
          stroke={colors.temperature}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          name="気温"
        />
        {showTemperature80m && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="temperature80m"
            stroke="#4263eb"
            strokeDasharray="5 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="上空の気温(80m)"
            connectNulls
          />
        )}
        {showTemperature120m && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="temperature120m"
            stroke="#5c940d"
            strokeDasharray="5 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="上空の気温(120m)"
            connectNulls
          />
        )}
        {showTemperature180m && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="temperature180m"
            stroke="#ae3ec9"
            strokeDasharray="5 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="上空の気温(180m)"
            connectNulls
          />
        )}
        {showTemperature925hPa && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="temperature925hPa"
            stroke="#1c7ed6"
            strokeDasharray="3 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="925hPaの気温"
            connectNulls
          />
        )}
        {showFreezingLevel && (
          <Line
            yAxisId="freezingLevel"
            type="monotone"
            dataKey="freezingLevel"
            stroke="#4263eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="凍結高度"
            connectNulls
          />
        )}
        {showSoilTemperature0cm && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="soilTemperature0cm"
            stroke="#8d6e63"
            strokeDasharray="1 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="土の温度(地表)"
            connectNulls
          />
        )}
        {showSoilTemperature6cm && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="soilTemperature6cm"
            stroke="#a1662f"
            strokeDasharray="1 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="土の温度(6cm)"
            connectNulls
          />
        )}
        {showSoilTemperature18cm && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="soilTemperature18cm"
            stroke="#c1440e"
            strokeDasharray="1 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="土の温度(18cm)"
            connectNulls
          />
        )}
        {showSoilTemperature54cm && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="soilTemperature54cm"
            stroke="#6f4518"
            strokeDasharray="1 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="土の温度(54cm)"
            connectNulls
          />
        )}
        {showApparentTemperature && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="apparentTemperature"
            stroke={colors.apparentTemperature}
            strokeDasharray="4 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="体感温度"
          />
        )}
        {showDewPoint && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="dewPoint"
            stroke="#20c997"
            strokeDasharray="2 3"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="露点温度"
            connectNulls
          />
        )}
        {showWetBulbTemperature && (
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="wetBulbTemperature"
            stroke="#e8590c"
            strokeDasharray="6 2"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="湿球温度"
            connectNulls
          />
        )}
        {showVaporPressureDeficit && (
          <Line
            yAxisId="vaporPressureDeficit"
            type="monotone"
            dataKey="vaporPressureDeficit"
            stroke="#d6336c"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="飽差(VPD)"
            connectNulls
          />
        )}
        {showHumidity && (
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
        {showSnowDepth && (
          <Line
            yAxisId="snowDepth"
            type="monotone"
            dataKey="snowDepth"
            stroke="#364fc7"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="積雪の深さ"
            connectNulls
          />
        )}
        {showPrecipitationProbability && (
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
        {showEvapotranspiration && (
          <Line
            yAxisId="evapotranspiration"
            type="monotone"
            dataKey="evapotranspiration"
            stroke="#099268"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="蒸発散量"
            connectNulls
          />
        )}
        {showPressure && (
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
        {showSeaLevelPressure && (
          <Line
            yAxisId="pressure"
            type="monotone"
            dataKey="seaLevelPressure"
            stroke="#5f3dc4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="海面気圧"
            connectNulls
          />
        )}
        {showCloudCover && (
          <Line
            yAxisId="cloudCover"
            type="monotone"
            dataKey="cloudCover"
            stroke="#868e96"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="雲量"
            connectNulls
          />
        )}
        {showCloudCoverLow && (
          <Line
            yAxisId="cloudCover"
            type="monotone"
            dataKey="cloudCoverLow"
            stroke="#5c7cfa"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="雲量(低層)"
            connectNulls
          />
        )}
        {showCloudCoverMid && (
          <Line
            yAxisId="cloudCover"
            type="monotone"
            dataKey="cloudCoverMid"
            stroke="#adb5bd"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="雲量(中層)"
            connectNulls
          />
        )}
        {showCloudCoverHigh && (
          <Line
            yAxisId="cloudCover"
            type="monotone"
            dataKey="cloudCoverHigh"
            stroke="#343a40"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="雲量(高層)"
            connectNulls
          />
        )}
        {showConvectiveInhibition && (
          <Line
            yAxisId="convectiveInhibition"
            type="monotone"
            dataKey="convectiveInhibition"
            stroke="#862e9c"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="対流抑制(CIN)"
            connectNulls
          />
        )}
        {showBoundaryLayerHeight && (
          <Line
            yAxisId="boundaryLayerHeight"
            type="monotone"
            dataKey="boundaryLayerHeight"
            stroke="#099268"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="境界層の高さ"
            connectNulls
          />
        )}
        {/* 風速はかつて雨量と同じ色（#12b886）で重なると見分けがつかなかったため別の色にした（Issue #334）。 */}
        {showWindSpeed && (
          <Line
            yAxisId="windSpeed"
            type="monotone"
            dataKey="windSpeed"
            stroke="#e64980"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="風速"
            connectNulls
          />
        )}
        {showWindDirection && (
          <Line
            yAxisId="windDirection"
            type="monotone"
            dataKey="windDirection"
            stroke="#0ca678"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="風向き"
            connectNulls
          />
        )}
        {showWindGusts && (
          <Line
            yAxisId="windGusts"
            type="monotone"
            dataKey="windGusts"
            stroke="#f76707"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="瞬間風速"
            connectNulls
          />
        )}
        {showWindSpeed700hPa && (
          <Line
            yAxisId="windSpeed700hPa"
            type="monotone"
            dataKey="windSpeed700hPa"
            stroke="#c92a2a"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="700hPaの風速"
            connectNulls
          />
        )}
        {showWindDirection700hPa && (
          <Line
            yAxisId="windDirection700hPa"
            type="monotone"
            dataKey="windDirection700hPa"
            stroke="#5c7cfa"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="700hPaの風向き"
            connectNulls
          />
        )}
        {showUpperWindSpeed && (
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
        {showUpperWindDirection && (
          <Line
            yAxisId="upperWindDirection"
            type="monotone"
            dataKey="upperWindDirection"
            stroke="#1864ab"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="上空の風向き"
            connectNulls
          />
        )}
        {showUpperWindSpeed80m && (
          <Line
            yAxisId="upperWindSpeed80m"
            type="monotone"
            dataKey="upperWindSpeed80m"
            stroke="#9c36b5"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="上空の風速(80m)"
            connectNulls
          />
        )}
        {showUpperWindDirection80m && (
          <Line
            yAxisId="upperWindDirection80m"
            type="monotone"
            dataKey="upperWindDirection80m"
            stroke="#0c8599"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="上空の風向き(80m)"
            connectNulls
          />
        )}
        {showUpperWindSpeed120m && (
          <Line
            yAxisId="upperWindSpeed120m"
            type="monotone"
            dataKey="upperWindSpeed120m"
            stroke="#2b8a3e"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="上空の風速(120m)"
            connectNulls
          />
        )}
        {showUpperWindDirection120m && (
          <Line
            yAxisId="upperWindDirection120m"
            type="monotone"
            dataKey="upperWindDirection120m"
            stroke="#495057"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="上空の風向き(120m)"
            connectNulls
          />
        )}
        {showUpperWindSpeed180m && (
          <Line
            yAxisId="upperWindSpeed180m"
            type="monotone"
            dataKey="upperWindSpeed180m"
            stroke="#e8590c"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="上空の風速(180m)"
            connectNulls
          />
        )}
        {showUpperWindDirection180m && (
          <Line
            yAxisId="upperWindDirection180m"
            type="monotone"
            dataKey="upperWindDirection180m"
            stroke="#d6336c"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="上空の風向き(180m)"
            connectNulls
          />
        )}
        {showWindSpeed925hPa && (
          <Line
            yAxisId="windSpeed925hPa"
            type="monotone"
            dataKey="windSpeed925hPa"
            stroke="#f06595"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="925hPaの風速"
            connectNulls
          />
        )}
        {showWindDirection925hPa && (
          <Line
            yAxisId="windDirection925hPa"
            type="monotone"
            dataKey="windDirection925hPa"
            stroke="#0b7285"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="925hPaの風向き"
            connectNulls
          />
        )}
        {showUvIndex && (
          <Line
            yAxisId="uvIndex"
            type="monotone"
            dataKey="uvIndex"
            stroke="#ffd43b"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="紫外線指数"
            connectNulls
          />
        )}
        {showShortwaveRadiation && (
          <Line
            yAxisId="shortwaveRadiation"
            type="monotone"
            dataKey="shortwaveRadiation"
            stroke="#fd7e14"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="日射量"
            connectNulls
          />
        )}
        {showSunshineDuration && (
          <Line
            yAxisId="sunshineDuration"
            type="monotone"
            dataKey="sunshineDuration"
            stroke="#f59f00"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="日照時間"
            connectNulls
          />
        )}
        {showVisibility && (
          <Line
            yAxisId="visibility"
            type="monotone"
            dataKey="visibility"
            stroke="#1098ad"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="視程"
            connectNulls
          />
        )}
      </LineChart>
    </ResponsiveContainer>
    </>
  );
}
