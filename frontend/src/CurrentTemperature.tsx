import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。値の丸め・単位の組み立てだけなのでテスト基盤は不要だが、
// コンポーネントから分離しておくと後から検証しやすい。
export function formatTemperature(data: WeatherResponse): string {
  const { value, unit } = data.temperature;
  return `${Math.round(value * 10) / 10}${unit}`;
}

// 摂氏だけでなく華氏でも見たいという声を受けて併記する（Issue #427）。
// Wind.tsx の formatWindSpeed が km/h と m/s を併記しているのと同じ方針で、
// メインの表示（摂氏）は変えずに小さく添える。
export function formatTemperatureFahrenheit(data: WeatherResponse): string {
  const { value } = data.temperature;
  const fahrenheit = Math.round(((value * 9) / 5 + 32) * 10) / 10;
  return `${fahrenheit}°F`;
}

export function CurrentTemperature({ data }: { data: WeatherResponse }) {
  // スマホで下までスクロールすると今の気温を見失うという声を受け、画面上部に
  // 固定表示されるようにする（Issue #337）。下にスクロールしてきた他の項目と
  // 重なっても読めるよう背景色を敷くが、`data.is_day` から直接決めると手動
  // ダークモード（Issue #294 の forceDark）と食い違う組み合わせで判読不能に
  // なるため、App.tsx が実効テーマから設定する `--surface-background` を
  // 参照する（レビュー指摘）。
  return (
    <>
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
        <span style={{ fontSize: 28, fontWeight: 400, color: "var(--text-secondary)", marginLeft: 8 }}>
          {formatTemperatureFahrenheit(data)}
        </span>
      </p>
      <ItemDescription text="現在の気温（右上の小さい数字は華氏換算）" />
    </>
  );
}
