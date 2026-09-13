import type { WeatherResponse } from "./api";
import { iconForWeatherCode } from "./weatherIcons";

// 天気アイコン（絵文字）をSVGに描画し、favicon用のdata URIとして組み立てる。
function svgDataUriForEmoji(emoji: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text x="16" y="24" font-size="28" text-anchor="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// 現在の天気に応じたfaviconのhrefを返す。未知の天気コードならnull（favicon変更なし）。
export function faviconHrefForWeather(data: WeatherResponse): string | null {
  const icon = iconForWeatherCode(data.condition.code);
  if (!icon) {
    return null;
  }
  return svgDataUriForEmoji(icon);
}
