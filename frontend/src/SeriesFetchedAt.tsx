import type { SeriesResponse } from "./api";

// /weather/series がいつ取得したデータか分からないという声を受けて追加する
// （Issue #650）。observed_at_display と異なり Open-Meteo 側の値ではなく、
// サーバーがレスポンスを作った時点の日本時間をそのまま表示する。
export function SeriesFetchedAt({ data }: { data: SeriesResponse }) {
  return (
    <p style={{ color: "var(--text-tertiary)", fontSize: 14, margin: "0 0 8px" }}>
      取得日時: {data.fetched_at_display}
    </p>
  );
}
