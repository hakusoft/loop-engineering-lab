import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { fetchSeries, fetchWeather, type SeriesResponse, type WeatherResponse } from "./api";
import { CATEGORY_ORDER, DISPLAY_ITEMS } from "./displayItems";
import { LocationName } from "./LocationName";
import { DailySummary } from "./DailySummary";
import { HourlyConditions } from "./HourlyConditions";
import { ThunderstormOutlook } from "./ThunderstormOutlook";
import { TemperatureChart } from "./TemperatureChart";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SeriesResponse };

type WeatherState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: WeatherResponse };

// 表示項目をカテゴリごとに区切る。値・表示ロジックは各コンポーネントのまま変えない。
// 項目が増えて画面が縦に長くなり全体を把握しづらいという要望を受け、カテゴリごとに
// 折りたたみ表示にする（Issue #222）。先頭カテゴリ（気温）だけは初期状態で開いておく。
function CategoryGroup({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen}>
      <summary
        style={{ color: "var(--text-tertiary)", fontSize: 12, fontWeight: 600, margin: "0 0 6px", cursor: "pointer" }}
      >
        {title}
      </summary>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {children}
      </div>
    </details>
  );
}

// /weather の is_day を基準に、昼夜で背景・文字色を切り替える。
// OS のダークモード設定とは連動せず、あくまで観測地点の昼夜だけを見る。
//
// 各表示コンポーネントの補助テキストは固定の #666 / #999 を使っていたが、
// 夜間の暗い背景（#1a1a2e）に対してコントラストが低く読みにくいという
// 指摘があった（Issue #256）。CSS カスタムプロパティとして昼夜で値を
// 切り替え、各コンポーネントはそれを参照するだけで済むようにする。
const DAY_THEME = {
  background: "#ffffff",
  color: "#111111",
  textSecondary: "#666666",
  textTertiary: "#999999",
};
const NIGHT_THEME = {
  background: "#1a1a2e",
  color: "#e8e8e8",
  textSecondary: "#b8b8d0",
  textTertiary: "#9a9ac0",
};

function themeFor(isDay: boolean | undefined) {
  return isDay === false ? NIGHT_THEME : DAY_THEME;
}

export default function App() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [weatherState, setWeatherState] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    fetchSeries()
      .then((data) => alive && setState({ status: "ready", data }))
      .catch((e) =>
        alive && setState({ status: "error", message: String(e.message ?? e) }),
      );
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    fetchWeather()
      .then((data) => alive && setWeatherState({ status: "ready", data }))
      .catch(() => alive && setWeatherState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  const theme = themeFor(weatherState.status === "ready" ? weatherState.data.is_day : undefined);

  return (
    <main
      style={
        {
          maxWidth: 880,
          minHeight: "100vh",
          margin: "0 auto",
          padding: "24px 16px",
          fontFamily: "system-ui, sans-serif",
          background: theme.background,
          color: theme.color,
          "--text-secondary": theme.textSecondary,
          "--text-tertiary": theme.textTertiary,
        } as CSSProperties
      }
    >
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>東京の気温（48時間）</h1>
        {weatherState.status === "ready" && state.status === "ready" && (
          <LocationName data={weatherState.data} />
        )}
      </div>
      <p style={{ color: "var(--text-secondary)", marginTop: 0, fontSize: 14 }}>
        loop-engineering-lab / <code>/weather/series</code>
      </p>

      {state.status === "ready" && <DailySummary data={state.data} />}
      {state.status === "ready" && <ThunderstormOutlook data={state.data} />}

      {weatherState.status === "ready" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 16 }}>
          {CATEGORY_ORDER.map((category, categoryIndex) => {
            const items = DISPLAY_ITEMS.filter((item) => item.category === category);
            if (items.length === 0) return null;
            return (
              <CategoryGroup key={category} title={category} defaultOpen={categoryIndex === 0}>
                {items.map(({ component: Item }, i) => (
                  <Item key={i} data={weatherState.data} />
                ))}
              </CategoryGroup>
            );
          })}
        </div>
      )}

      {state.status === "loading" && <p>読み込み中…</p>}
      {state.status === "error" && (
        <p style={{ color: "#c00" }}>読み込みに失敗しました: {state.message}</p>
      )}
      {state.status === "ready" && (
        <>
          <TemperatureChart
            data={state.data}
            isDay={weatherState.status === "ready" ? weatherState.data.is_day : undefined}
          />
          <HourlyConditions data={state.data} />
        </>
      )}
    </main>
  );
}
