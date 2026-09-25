// 各表示項目に添える短い説明文の共通スタイル。ホバー/タップ操作だと
// 気づきにくいという声を受け、常時見える小さい注記として表示する
// （Issue #461、依頼のスコープを気温カテゴリのみに絞った回答）。
export function ItemDescription({ text }: { text: string }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 12, opacity: 0.8, margin: "0 0 8px" }}>
      {text}
    </p>
  );
}
