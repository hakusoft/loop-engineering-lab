import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。HeatStrokeRisk.tsx の heatStrokeRiskLevel と同様。
//
// 一般に最低気温が 3℃ 前後まで下がると霜が降りやすくなり、0℃ 以下ではさらに
// 可能性が高まるとされる目安を参考にした簡易な3段階判定（Slack より依頼）。
export function frostRiskLevel(temperatureMin: number): string {
  if (temperatureMin <= 0) {
    return "可能性高い";
  }
  if (temperatureMin <= 3) {
    return "注意";
  }
  return "心配なさそう";
}

export function formatFrostRisk(data: WeatherResponse): string {
  const { value: temperatureMin } = data.temperature_min;
  return `霜の目安 ${frostRiskLevel(temperatureMin)}`;
}

// HeatStrokeRisk.tsx の heatStrokeRiskColor と同様、段階ごとに色を割り当てる。
export function frostRiskColor(level: string): string {
  switch (level) {
    case "可能性高い":
      return "#1864ab";
    case "注意":
      return "#1c7ed6";
    default:
      return "#2f9e44";
  }
}

export function FrostRisk({ data }: { data: WeatherResponse }) {
  const level = frostRiskLevel(data.temperature_min.value);
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
        霜の目安{" "}
        <span style={{ color: frostRiskColor(level), fontWeight: 600 }}>{level}</span>
      </p>
      <ItemDescription text="本日の最低気温をもとにした、霜が降りやすいかどうかの目安" />
    </>
  );
}
