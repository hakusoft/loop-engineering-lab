import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。HeatStrokeRisk.tsx の heatStrokeRiskLevel と同様。
//
// 雲量(%)が低いほど星が見やすいという単純な前提の3段階判定（Slack より依頼）。
// 月明かりなど他の要因は考慮しない簡易な目安。
export function stargazingOutlookLevel(cloudCover: number): string {
  if (cloudCover <= 30) {
    return "見えやすそう";
  }
  if (cloudCover <= 70) {
    return "ところどころ雲あり";
  }
  return "雲が多そう";
}

export function formatStargazingOutlook(data: WeatherResponse): string {
  const { value: cloudCover } = data.cloud_cover;
  return `星の見やすさ ${stargazingOutlookLevel(cloudCover)}`;
}

// HeatStrokeRisk.tsx の heatStrokeRiskColor と同様、段階ごとに色を割り当てる。
export function stargazingOutlookColor(level: string): string {
  switch (level) {
    case "見えやすそう":
      return "#2f9e44";
    case "ところどころ雲あり":
      return "#f08c00";
    default:
      return "#868e96";
  }
}

export function StargazingOutlook({ data }: { data: WeatherResponse }) {
  const level = stargazingOutlookLevel(data.cloud_cover.value);
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
        星の見やすさ{" "}
        <span style={{ color: stargazingOutlookColor(level), fontWeight: 600 }}>{level}</span>
      </p>
      <ItemDescription text="現在の雲量をもとにした、夜に星が見やすそうかの目安（月明かりなどは考慮しない）" />
    </>
  );
}
