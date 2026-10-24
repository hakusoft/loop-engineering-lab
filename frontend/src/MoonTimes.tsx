import type { WeatherResponse } from "./api";
import { formatTime } from "./SunTimes";

// 表示ロジックを純関数に切り出す。SolarRadiationDirectNormal.tsx の
// formatSolarRadiationDirectNormal と同様、value は null になり得る
// （欠測時は行自体を残して伝える）。
export function formatMoonTimes(data: WeatherResponse): string {
  const { moonrise, moonset } = data;
  if (moonrise === null || moonset === null) {
    return "月の出・月の入り 現在取得できません";
  }
  return `🌙 月の出 ${formatTime(moonrise)} ・ 月の入り ${formatTime(moonset)}`;
}

// 月齢（moon_phase、0〜1の分数）を「新月」「満月」のような言葉にする。
// UV指数の言葉での表示（Issue #617）と同じ考え方で、8段階に分ける。
const MOON_PHASE_LABELS = [
  "新月",
  "三日月",
  "上弦の月",
  "満ちていく月",
  "満月",
  "欠けていく月",
  "下弦の月",
  "有明月",
];

export function formatMoonPhase(data: WeatherResponse): string {
  const { value } = data.moon_phase;
  if (value === null) {
    return "月齢 現在取得できません";
  }
  const index = Math.floor(((value % 1) + 1) % 1 * MOON_PHASE_LABELS.length) % MOON_PHASE_LABELS.length;
  return `月齢 ${MOON_PHASE_LABELS[index]}`;
}

export function MoonTimes({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatMoonTimes(data)}（{formatMoonPhase(data)}）
    </p>
  );
}
