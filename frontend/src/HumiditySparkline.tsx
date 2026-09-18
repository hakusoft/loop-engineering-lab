import { useEffect, useState } from "react";
import { fetchSeries, type SeriesResponse, type WeatherResponse } from "./api";

// 湿度の数字だけだと一日の推移が分からず物足りないという声を受け、気温グラフと
// 同じように小さな推移グラフ（スパークライン）を添える（Issue #399）。
// bot が選択肢を提示して確認した結果、まずは湿度だけに絞って追加することになった
// （依頼者との合意: 「今の画面のままで少しずつ増やしてもらえれば十分」）。
// 他の項目（気圧など）への展開は今回のスコープ外。
//
// DISPLAY_ITEMS の各コンポーネントは data: WeatherResponse（単発スナップショット）
// しか受け取らず、時系列データ（SeriesResponse）は App.tsx の外に出ていない。
// App.tsx や DISPLAY_ITEMS の型を変えると影響範囲が広がる（Issue #399 の調査メモ）
// ため、このコンポーネントは自前で /weather/series を取得する
// （App.tsx が TemperatureChart 用に取得しているものとは別リクエストになる）。

// 表示ロジックを純関数に切り出す。HourlyConditions.tsx の toHourlyConditionCells と同様。
export function humiditySeriesValues(data: SeriesResponse): (number | null)[] | null {
  const series = data.series.find((s) => s.label === "湿度");
  return series ? series.values : null;
}

// values を width x height の折れ線の座標列（SVG polyline の points 属性用）に変換する。
// 欠測（null）は取り除いた上で、残った点を元のインデックス間隔を保ったまま並べる。
// 有効な点が2つ未満のときは線を引けないため null を返す。
export function sparklinePoints(
  values: (number | null)[],
  width: number,
  height: number,
): string | null {
  const defined = values
    .map((v, i) => (v === null ? null : { i, v }))
    .filter((p): p is { i: number; v: number } => p !== null);
  if (defined.length < 2) return null;

  const indices = defined.map((p) => p.i);
  const minIndex = Math.min(...indices);
  const maxIndex = Math.max(...indices);
  const indexRange = maxIndex - minIndex || 1;

  const vs = defined.map((p) => p.v);
  const min = Math.min(...vs);
  const max = Math.max(...vs);
  const range = max - min;

  return defined
    .map(({ i, v }) => {
      const x = ((i - minIndex) / indexRange) * width;
      const y = range === 0 ? height / 2 : height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const WIDTH = 120;
const HEIGHT = 28;

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; points: string | null };

export function HumiditySparkline({ data: _data }: { data: WeatherResponse }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    fetchSeries()
      .then((series) => {
        if (!alive) return;
        const values = humiditySeriesValues(series);
        setState({
          status: "ready",
          points: values ? sparklinePoints(values, WIDTH, HEIGHT) : null,
        });
      })
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.status !== "ready" || state.points === null) {
    return null;
  }

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ display: "block", margin: "-4px 0 8px" }}
      aria-hidden="true"
    >
      <polyline points={state.points} fill="none" stroke="var(--text-tertiary)" strokeWidth={1.5} />
    </svg>
  );
}
