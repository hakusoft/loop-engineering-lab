import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";
import { formatTime } from "./SunTimes";

const MOONRISE_ICON = "🌙";
const MOONSET_ICON = "🌃";

// 表示ロジックを純関数に切り出す。SunTimes.tsx と同様。
//
// moonrise / moonset / moon_phase は実 API での応答確認ができていない項目
// （app/weather.py 参照）。欠測時に項目ごと消してしまうと「壊れているのでは」
// という不安につながるという指摘があった（Issue #333、Issue #402、Issue #447）ため、
// TemperatureDiffGroundAloft.tsx と同じ方針で、行自体は残し取得できないことを伝える。
export function formatMoonTimes(data: WeatherResponse): string {
  const moonrise = data.moonrise !== null ? formatTime(data.moonrise) : "現在取得できません";
  const moonset = data.moonset !== null ? formatTime(data.moonset) : "現在取得できません";
  return `${MOONRISE_ICON} 月の出 ${moonrise} ・ ${MOONSET_ICON} 月の入り ${moonset}`;
}

export function formatMoonPhase(data: WeatherResponse): string {
  const { value, unit } = data.moon_phase;
  if (value === null) {
    return "月相 現在取得できません";
  }
  return `月相 ${value}${unit}`;
}

export function MoonTimes({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
        {formatMoonTimes(data)}
      </p>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
        {formatMoonPhase(data)}
      </p>
      <ItemDescription text="Open-Meteoが実際にこれらのキーを返すかはまだ確認できていないため、取得できない場合は「現在取得できません」と表示されます" />
    </>
  );
}
