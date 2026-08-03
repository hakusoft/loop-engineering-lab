import { useEffect, useState } from "react";
import { fetchSeries, fetchWeather, type SeriesResponse, type WeatherResponse } from "./api";
import { Condition } from "./Condition";
import { CurrentTemperature } from "./CurrentTemperature";
import { DewPoint } from "./DewPoint";
import { Elevation } from "./Elevation";
import { Humidity } from "./Humidity";
import { LocationName } from "./LocationName";
import { ObservedAt } from "./ObservedAt";
import { PrecipitationProbability } from "./PrecipitationProbability";
import { Pressure } from "./Pressure";
import { SunTimes } from "./SunTimes";
import { SunshineDuration } from "./SunshineDuration";
import { TemperatureChart } from "./TemperatureChart";
import { TemperatureRange } from "./TemperatureRange";
import { UvIndex } from "./UvIndex";
import { Wind } from "./Wind";

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
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>東京の気温（48時間）</h1>
        {weatherState.status === "ready" && state.status === "ready" && (
          <LocationName data={weatherState.data} />
        )}
      </div>
      <p style={{ color: "#666", marginTop: 0, fontSize: 14 }}>
        loop-engineering-lab / <code>/weather/series</code>
      </p>

      {weatherState.status === "ready" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <Condition data={weatherState.data} />
          <CurrentTemperature data={weatherState.data} />
          <Humidity data={weatherState.data} />
          <DewPoint data={weatherState.data} />
          <Pressure data={weatherState.data} />
          <Wind data={weatherState.data} />
          <Elevation data={weatherState.data} />
          <ObservedAt data={weatherState.data} />
          <TemperatureRange data={weatherState.data} />
          <UvIndex data={weatherState.data} />
          <PrecipitationProbability data={weatherState.data} />
          <SunTimes data={weatherState.data} />
          <SunshineDuration data={weatherState.data} />
        </div>
      )}

      {state.status === "loading" && <p>読み込み中…</p>}
      {state.status === "error" && (
        <p style={{ color: "#c00" }}>読み込みに失敗しました: {state.message}</p>
      )}
      {state.status === "ready" && <TemperatureChart data={state.data} />}
    </main>
  );
}
