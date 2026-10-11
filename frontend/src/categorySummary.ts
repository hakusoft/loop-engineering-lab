import type { DisplayCategory } from "./displayItems";
import type { WeatherResponse } from "./api";
import { formatTemperatureValue } from "./formatTemperatureValue";
import { formatTime } from "./SunTimes";

// カテゴリを閉じたままでも大まかな状況が分かるよう、見出しに添える代表値
// （Issue #562）。各表示コンポーネント（CurrentTemperature 等）の書式とは
// 独立した、見出し用の短い書式にする。
//
// 湿度は null になり得る（Humidity.tsx の formatHumidity と同じ理由）。
// 他の値は api.ts の型上は常に数値のため null チェックは不要。
export function categorySummaryValue(
  category: DisplayCategory,
  data: WeatherResponse,
): string | null {
  switch (category) {
    case "気温":
      return `${formatTemperatureValue(data.temperature.value)}${data.temperature.unit}`;
    case "風":
      return `${data.wind_speed.value.toFixed(1)}${data.wind_speed.unit}`;
    case "降水・湿度":
      if (data.humidity.value === null) {
        return null;
      }
      return `${Math.round(Math.min(data.humidity.value, 100))}${data.humidity.unit}`;
    case "環境":
      return `${Math.round(data.pressure.value * 10) / 10}${data.pressure.unit}`;
    case "日照・時刻":
      return `${formatTime(data.sunrise)}〜${formatTime(data.sunset)}`;
    default:
      return null;
  }
}
