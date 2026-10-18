import { useEffect, useState } from "react";

// 残り分数の表示を進めるための再描画間隔。1分ぴったりでなくても、
// 分の表示が大きくズレない程度の粒度でよい。
const TICK_MS = 15 * 1000;

// 表示ロジックを純関数に切り出す。マウント時刻（mountedAt）を基準に、
// REFRESH_INTERVAL_MS（App.tsx）おきに自動更新が走るスケジュールに対して、
// 次の自動更新までの残り分数を計算する。手動更新（「今すぐ更新」）は
// このスケジュール自体には影響しない（App.tsx の既存の挙動と同じ）。
//
// 「自動更新が10分ごとなのは知っているが、次の更新まであと何分か分かると
// 助かる」という声を受けて追加する。
export function formatNextAutoRefreshIn(
  mountedAt: number,
  intervalMs: number,
  now: number = Date.now(),
): string {
  const elapsedInCycle = ((now - mountedAt) % intervalMs + intervalMs) % intervalMs;
  const remainingMs = intervalMs - elapsedInCycle;
  const minutes = Math.ceil(remainingMs / 60000);
  return `次の自動更新まであと${minutes}分`;
}

export function AutoRefreshStatus({
  mountedAt,
  intervalMs,
  refreshing,
}: {
  mountedAt: number;
  intervalMs: number;
  refreshing: boolean;
}) {
  // 残り分数は時間の経過で変わるため、定期的に再描画する。
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{ fontSize: 12, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
      {refreshing ? "自動更新中…" : formatNextAutoRefreshIn(mountedAt, intervalMs)}
    </span>
  );
}
