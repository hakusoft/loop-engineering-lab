// API のベース URL。VITE_API_BASE を指定すればそれを最優先で使う。
//
// 未指定のとき:
// - 開発（dev サーバー）は "/api"。vite.config.ts のプロキシが本番へ中継する。
//   本番 API Gateway の CORS 有無に関わらずローカルで動く。
// - 本番ビルドは API Gateway を直接叩く。ブラウザから叩くので API 側の
//   CORS が要る（infra/apigateway.tf。apply 済みが前提）。
const PROD_API = "https://9sa9pqvlsc.execute-api.ap-northeast-1.amazonaws.com";
const API_BASE =
  import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "/api" : PROD_API);

// /weather/series のレスポンス。系列ごとに unit と min/max を持つ。
export type Series = {
  label: string;
  unit: string;
  values: (number | null)[];
  min: number | null;
  max: number | null;
};

export type HourlyCondition = { code: number; description: string };

export type SeriesResponse = {
  timestamps: string[];
  conditions: HourlyCondition[];
  daily_summary: string;
  thunderstorm_hours: string[];
  series: Series[];
  coordinates: { latitude: number; longitude: number };
};

// /weather のレスポンス。現在値の表示に使うのは temperature と sunrise/sunset のみ。
export type WeatherResponse = {
  temperature: { value: number; unit: string };
  apparent_temperature: { value: number; unit: string };
  apparent_temperature_max: { value: number; unit: string };
  apparent_temperature_min: { value: number; unit: string };
  temperature_max: { value: number; unit: string };
  temperature_min: { value: number; unit: string };
  temperature_mean: { value: number; unit: string };
  humidity: { value: number; unit: string };
  humidity_max: { value: number; unit: string };
  humidity_min: { value: number; unit: string };
  dew_point: { value: number; unit: string };
  soil_temperature: { value: number; unit: string };
  // 実 API での応答未確認の項目（PR #279 のレビュー参照）。取れないときは
  // value が null になるので、表示側で必ず null を扱う。
  soil_temperature_deep: { value: number | null; unit: string };
  soil_moisture: { value: number; unit: string };
  // 実 API での応答未確認の項目（PR #267 のレビュー参照）。取れないときは
  // value が null になるので、表示側で必ず null を扱う。
  soil_moisture_deep: { value: number | null; unit: string };
  pressure: { value: number; unit: string };
  sea_level_pressure: { value: number; unit: string };
  cloud_cover: { value: number; unit: string };
  cloud_cover_low: { value: number; unit: string };
  cloud_cover_mid: { value: number; unit: string };
  cloud_cover_high: { value: number; unit: string };
  visibility: { value: number; unit: string };
  freezing_level_height: { value: number; unit: string };
  snow_depth: { value: number; unit: string };
  uv_index: { value: number; unit: string };
  uv_index_max: { value: number; unit: string };
  precipitation: { value: number; unit: string };
  precipitation_probability: { value: number; unit: string };
  precipitation_hours: { value: number; unit: string };
  precipitation_sum: { value: number; unit: string };
  rain_sum: { value: number; unit: string };
  showers_sum: { value: number; unit: string };
  snowfall_sum: { value: number; unit: string };
  rain: { value: number; unit: string };
  showers: { value: number; unit: string };
  snowfall: { value: number; unit: string };
  solar_radiation: { value: number; unit: string };
  solar_radiation_sum: { value: number; unit: string };
  wind_speed: { value: number; unit: string };
  wind_direction: { value: number; unit: string; compass: string };
  wind_direction_dominant: { value: number; unit: string; compass: string };
  wind_speed_max: { value: number; unit: string };
  wind_gusts: { value: number; unit: string };
  wind_gusts_max: { value: number; unit: string };
  sunrise: string;
  sunset: string;
  sunshine_duration: { value: number; unit: string };
  evapotranspiration: { value: number; unit: string };
  daylight_duration: { value: number; unit: string };
  condition: { code: number; description: string };
  is_day: boolean;
  observed_at: string;
  location_name: string;
  elevation: { value: number; unit: string };
};

export async function fetchSeries(): Promise<SeriesResponse> {
  const res = await fetch(`${API_BASE}/weather/series`);
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  return res.json();
}

export async function fetchWeather(): Promise<WeatherResponse> {
  const res = await fetch(`${API_BASE}/weather`);
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  return res.json();
}
