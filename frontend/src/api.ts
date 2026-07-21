// API のベース URL。ビルド時に VITE_API_BASE で差し替えられる。
// 未指定なら本番の API Gateway を叩く（デモ用途のデフォルト）。
const API_BASE =
  import.meta.env.VITE_API_BASE ??
  "https://9sa9pqvlsc.execute-api.ap-northeast-1.amazonaws.com";

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

export async function fetchSeries(): Promise<SeriesResponse> {
  const res = await fetch(`${API_BASE}/weather/series`);
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  return res.json();
}
