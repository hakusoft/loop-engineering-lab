import type { WeatherResponse } from "./api";

export function LocationName({ data }: { data: WeatherResponse }) {
  return (
    <span style={{ fontSize: 13, color: "#888", marginLeft: 8 }}>
      {data.location_name}
    </span>
  );
}
