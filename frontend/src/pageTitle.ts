import type { WeatherResponse } from "./api";
import { formatConditionIcon } from "./Condition";
import { formatTemperature } from "./CurrentTemperature";

// 複数タブで開いているとどれが天気のタブか見分けにくいという声を受け、
// 今の気温をタブ名に入れる（Issue #632）。表示ロジックを純関数に切り出し、App.tsx からは
// document.title への反映だけを行う（favicon.ts の faviconHrefForWeather と同じ方針）。
export function pageTitleForWeather(data: WeatherResponse): string {
  const icon = formatConditionIcon(data);
  const temperature = formatTemperature(data);
  return icon
    ? `${icon} ${temperature} ・ loop-engineering-lab`
    : `${temperature} ・ loop-engineering-lab`;
}
