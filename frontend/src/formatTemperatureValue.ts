// toFixed(1) は値が -0.05〜-0.0 の範囲(四捨五入で 0.0 になるが符号は負)のとき
// "-0.0" を返す(例: (-0.04).toFixed(1) === "-0.0")。レビュー指摘を受け、
// 気温の表示では -0.0 を 0.0 に正規化する。
export function formatTemperatureValue(value: number): string {
  const fixed = value.toFixed(1);
  return fixed === "-0.0" ? "0.0" : fixed;
}
