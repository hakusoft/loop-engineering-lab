import { useEffect, useState } from "react";
import { fetchSeries, fetchWeather, type SeriesResponse, type WeatherResponse } from "./api";
import { CurrentTemperature } from "./CurrentTemperature";
import { TemperatureChart } from "./TemperatureChart";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SeriesResponse };

type WeatherState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: WeatherResponse };

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

  return (
    <main
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "24px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>東京の気温（48時間）</h1>
      <p style={{ color: "#666", marginTop: 0, fontSize: 14 }}>
        loop-engineering-lab / <code>/weather/series</code>
      </p>

      {weatherState.status === "ready" && <CurrentTemperature data={weatherState.data} />}

      {state.status === "loading" && <p>読み込み中…</p>}
      {state.status === "error" && (
        <p style={{ color: "#c00" }}>読み込みに失敗しました: {state.message}</p>
      )}
      {state.status === "ready" && <TemperatureChart data={state.data} />}
    </main>
  );
}
