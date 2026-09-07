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
  // 重なっても読めるよう、昼夜のテーマに合わせた背景色を敷く。
  const background = data.is_day ? "#ffffff" : "#1a1a2e";
  return (
    <p
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        background,
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
