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

// カテゴリの開閉状態を保存するキーの接頭辞。カテゴリ名ごとに分けて保存する。
const CATEGORY_OPEN_STORAGE_PREFIX = "loop-engineering-lab:category-open:";

// localStorage が使えない環境（プライベートブラウジング等）でも落ちないようにする。
function readStoredCategoryOpen(title: string): boolean | undefined {
  try {
    const stored = localStorage.getItem(CATEGORY_OPEN_STORAGE_PREFIX + title);
    return stored === null ? undefined : stored === "true";
  } catch {
    return undefined;
  }
}

function writeStoredCategoryOpen(title: string, open: boolean) {
  try {
    localStorage.setItem(CATEGORY_OPEN_STORAGE_PREFIX + title, String(open));
  } catch {
    // 保存できなくても表示は続行する。
  }
}

// 表示項目をカテゴリごとに区切る。値・表示ロジックは各コンポーネントのまま変えない。
// 項目が増えて画面が縦に長くなり全体を把握しづらいという要望を受け、カテゴリごとに
// 折りたたみ表示にする（Issue #222）。開閉状態は localStorage に保存し、保存が無い
// カテゴリは先頭カテゴリ（気温）だけ初期状態で開く（Issue #255）。
function CategoryGroup({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(() => readStoredCategoryOpen(title) ?? defaultOpen);

  return (
    <details
      open={open}
      onToggle={(e) => {
        const isOpen = (e.target as HTMLDetailsElement).open;
        setOpen(isOpen);
        writeStoredCategoryOpen(title, isOpen);
      }}
    >
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

// カテゴリを開いても項目が多すぎてどれが大事か分かりにくいという声を受け、
// 主要項目（primary）だけを初期表示し、残りは「もっと見る」で展開する（Issue #274）。
// カテゴリの開閉（CategoryGroup）とは別の状態として持ち、カテゴリごとにリセットされる
// （開閉状態のように localStorage には保存しない）。
function ExpandableItems({
  primary,
  more,
}: {
  primary: ReactNode[];
  more: ReactNode[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {primary}
      {expanded && more}
      {more.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            alignSelf: "flex-start",
            background: "none",
            border: "none",
            color: "var(--text-tertiary)",
            fontSize: 13,
            cursor: "pointer",
            padding: "2px 0",
          }}
        >
          {expanded ? "閉じる" : `もっと見る（${more.length}件）`}
        </button>
      )}
    </>
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

function themeFor(isDay: boolean | undefined, forceDark: boolean) {
  return forceDark || isDay === false ? NIGHT_THEME : DAY_THEME;
}

// 昼夜自動判定とは別に、目が疲れている時など任意のタイミングで暗めの配色に
// 切り替えたいという要望を受け、手動トグルを追加する（Issue #294）。
// 状態は CategoryGroup の開閉状態と同様、localStorage に保存して次回訪問時も引き継ぐ。
const DARK_MODE_OVERRIDE_STORAGE_KEY = "loop-engineering-lab:dark-mode-override";

function readStoredDarkModeOverride(): boolean {
  try {
    return localStorage.getItem(DARK_MODE_OVERRIDE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeStoredDarkModeOverride(value: boolean) {
  try {
    localStorage.setItem(DARK_MODE_OVERRIDE_STORAGE_KEY, String(value));
  } catch {
    // 保存できなくても表示は続行する。
  }
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

  const [forceDark, setForceDark] = useState(() => readStoredDarkModeOverride());

  const effectiveIsDay = forceDark
    ? false
    : weatherState.status === "ready"
      ? weatherState.data.is_day
      : undefined;
  const theme = themeFor(effectiveIsDay, forceDark);

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
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <h1 style={{ fontSize: 20, marginBottom: 4 }}>東京の気温（48時間）</h1>
          {weatherState.status === "ready" && state.status === "ready" && (
            <LocationName data={weatherState.data} />
          )}
        </div>
        <label
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          <input
            type="checkbox"
            checked={forceDark}
            onChange={(e) => {
              const next = e.target.checked;
              setForceDark(next);
              writeStoredDarkModeOverride(next);
            }}
            style={{ marginRight: 6 }}
          />
          暗めの表示
        </label>
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
            const primary = items
              .filter((item) => (item.tier ?? "primary") === "primary")
              .map(({ component: Item }, i) => <Item key={`primary-${i}`} data={weatherState.data} />);
            const more = items
              .filter((item) => item.tier === "more")
              .map(({ component: Item }, i) => <Item key={`more-${i}`} data={weatherState.data} />);
            return (
              <CategoryGroup key={category} title={category} defaultOpen={categoryIndex === 0}>
                <ExpandableItems primary={primary} more={more} />
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
          <TemperatureChart data={state.data} isDay={effectiveIsDay} />
          <HourlyConditions data={state.data} />
        </>
      )}
    </main>
  );
}
