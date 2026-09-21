// 度数(0〜360) → 16方位の短い英字略号。app/weather.py の _compass_direction と
// 同じ22.5°刻みのマッピング（度数だけの表示だとパッと見て分からないという
// 声を受けて追加。Issue #437）。
const COMPASS_ABBREVIATIONS = [
  "N", "NNE", "NE", "ENE",
  "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW",
  "W", "WNW", "NW", "NNW",
];

export function compassAbbreviation(degrees: number): string {
  const index = Math.floor((degrees + 11.25) / 22.5) % COMPASS_ABBREVIATIONS.length;
  return COMPASS_ABBREVIATIONS[index];
}
