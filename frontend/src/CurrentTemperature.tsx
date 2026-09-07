import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。値の丸め・単位の組み立てだけなのでテスト基盤は不要だが、
// コンポーネントから分離しておくと後から検証しやすい。
export function formatTemperature(data: WeatherResponse): string {
  const { value, unit } = data.temperature;
  return `${Math.round(value * 10) / 10}${unit}`;
}

export function CurrentTemperature({ data }: { data: WeatherResponse }) {
  // スマホで下までスクロールすると今の気温を見失うという声を受け、画面上部に
  // 固定表示されるようにする（Issue #337）。下にスクロールしてきた他の項目と
  // 重なっても読めるよう背景色を敷くが、`data.is_day` から直接決めると手動
  // ダークモード（Issue #294 の forceDark）と食い違う組み合わせで判読不能に
  // なるため、App.tsx が実効テーマから設定する `--surface-background` を
  // 参照する（レビュー指摘）。
  return (
    <p
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        background: "var(--surface-background)",
        fontSize: 96,
        fontWeight: 700,
        margin: "8px 0",
        lineHeight: 1,
      }}
    >
      {formatTemperature(data)}
    </p>
  );
}
