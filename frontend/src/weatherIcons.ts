// WMO Weather interpretation codes（Open-Meteo の weather_code）→ アイコン（絵文字）。
// app/weather.py の WEATHER_CODES と対になる表記。未知のコードはアイコンなし。
export const CONDITION_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌦️",
  56: "🌦️",
  57: "🌦️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  66: "🌧️",
  67: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "🌨️",
  77: "🌨️",
  80: "🌦️",
  81: "🌦️",
  82: "🌦️",
  85: "🌨️",
  86: "🌨️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

// 天気コードからアイコンを引く。未知のコードは null。
export function iconForWeatherCode(code: number): string | null {
  return CONDITION_ICONS[code] ?? null;
}
