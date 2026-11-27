import type { WeatherResponse } from "./api";
import { umbrellaGuidance } from "./ActionGuidance";

// 「傘いるかな」が一番知りたいのに、降水関連の項目を見てもパッと分からない
// という声を受け、既存の判定ロジック（ActionGuidance.tsx の umbrellaGuidance、
// 新しい閾値は作らない）を降水関連の主要項目のそばに表示する（Issue #686）。
// ActionGuidance 自体（上着・日焼け止めとまとめた「もっと見る」内の表示）は
// そのまま残す。
// 判定結果（必要/折りたたみ傘があると安心/不要）だけでは、何を根拠にした判定か
// 分かりにくいという声を受け、判定に使った降水確率の数字も一緒に表示する
// （Issue #715）。
export function formatUmbrellaAdvice(data: WeatherResponse): string {
  const { value, unit } = data.precipitation_probability;
  const guidance = umbrellaGuidance(value, data.precipitation_sum.value);
  return `傘の目安: ${guidance}（降水確率 ${Math.round(value)}${unit}）`;
}

export function UmbrellaAdvice({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "2px 0 8px" }}>
      {formatUmbrellaAdvice(data)}
    </p>
  );
}
