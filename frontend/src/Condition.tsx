import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。天気状況の文字表記をそのまま返す。
export function formatCondition(data: WeatherResponse): string {
  return data.condition.description;
}

// WMO Weather interpretation codes（Open-Meteo の weather_code）→ アイコン（絵文字）。
// app/weather.py の WEATHER_CODES と対になる表記。未知のコードはアイコンなし。
const CONDITION_ICONS: Record<number, string> = {
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

export function formatConditionIcon(data: WeatherResponse): string | null {
  return CONDITION_ICONS[data.condition.code] ?? null;
}

export function Condition({ data }: { data: WeatherResponse }) {
  const icon = formatConditionIcon(data);
  return (
    <p style={{ fontSize: 20, margin: "0 0 8px" }}>
      {icon && <span aria-hidden="true">{icon} </span>}
      {formatCondition(data)}
    </p>
  );
}
