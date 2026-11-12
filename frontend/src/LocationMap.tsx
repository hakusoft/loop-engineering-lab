import type { SeriesResponse } from "./api";

// 地点を小さい地図ピンで見たいという声を受け、OpenStreetMap の embed.html を
// 小さな iframe として埋め込む（Issue #696）。API キー不要で最小の実装になる
// ため、依頼者の了承を得てこの方式を採用した。表示ロジックは Coordinates.tsx /
// LocationName.tsx と同様、純関数に切り出す。

// ピンの周囲にどれだけの範囲を表示するか（度数）。狙いは「小さいピンだけ」
// なので、広域の地図ではなく地点周辺だけが見える程度の狭さにする。
const BBOX_MARGIN_DEGREES = 0.01;

export function formatMapEmbedUrl(data: SeriesResponse): string {
  const { latitude, longitude } = data.coordinates;
  const bbox = [
    longitude - BBOX_MARGIN_DEGREES,
    latitude - BBOX_MARGIN_DEGREES,
    longitude + BBOX_MARGIN_DEGREES,
    latitude + BBOX_MARGIN_DEGREES,
  ].join(",");
  const marker = `${latitude},${longitude}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

export function LocationMap({ data }: { data: SeriesResponse }) {
  return (
    <iframe
      title="地点の地図"
      src={formatMapEmbedUrl(data)}
      width={90}
      height={70}
      style={{ border: 0, borderRadius: 4, marginLeft: 8, verticalAlign: "middle" }}
      loading="lazy"
    />
  );
}
