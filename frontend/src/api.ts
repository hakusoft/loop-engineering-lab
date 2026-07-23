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

export type SeriesResponse = {
  timestamps: string[];
  series: Series[];
  coordinates: { latitude: number; longitude: number };
};

// /weather のレスポンス。現在値の表示に使うのは temperature のみ。
export type WeatherResponse = {
  temperature: { value: number; unit: string };
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
