import { lazy, type ComponentType } from "react";
import type { WeatherResponse } from "./api";
import { ApparentTemperature } from "./ApparentTemperature";
import { CloudCover } from "./CloudCover";
import { Condition } from "./Condition";
import { CurrentTemperature } from "./CurrentTemperature";
import { Humidity } from "./Humidity";
import { HumiditySparkline } from "./HumiditySparkline";
import { ObservedAt } from "./ObservedAt";
import { Precipitation } from "./Precipitation";
import { PrecipitationProbability } from "./PrecipitationProbability";
import { Pressure } from "./Pressure";
import { SunTimes } from "./SunTimes";
import { TemperatureRange } from "./TemperatureRange";
import { Visibility } from "./Visibility";
import { Wind } from "./Wind";

// 表示項目の一覧。App.tsx はこれを読んで描くだけで、項目そのものは持たない。
//
// 以前は App.tsx が「画面の構造」と「表示する項目の一覧」の両方を持っていたため、
// 項目を足す変更も構造を変える変更も同じブロックを編集することになり、
// 項目追加の PR 同士が競合していた。分けたことで、項目の追加はこのファイルへの
// 1 行の挿入だけで済む。
//
// 並び順はこの配列の順。カテゴリの並びは CATEGORY_ORDER で決める。

export type DisplayCategory = "気温" | "風" | "降水・湿度" | "環境" | "日照・時刻";

// カテゴリ内での表示優先度。項目が増えて何が大事か分かりにくいという声を受け、
// primary はカテゴリを開いたときに常に表示し、more は「もっと見る」で展開する
// （Issue #274）。省略時は primary 扱い。
export type DisplayTier = "primary" | "more";

export type DisplayItem = {
  category: DisplayCategory;
  component: ComponentType<{ data: WeatherResponse }>;
  tier?: DisplayTier;
};

// tier: "more" の項目は、カテゴリを開いた直後は画面に出ないにもかかわらず、
// primary と同じ初回バンドルに含めると開いた瞬間の読み込みを重くする一因になる
// （Issue #513。#308 で TemperatureChart だけ別チャンクにした後、項目数が
// 数十件規模で増え、同じ問題が再発した）。実体は moreDisplayItems.ts に
// まとめ、ここでは同じ import("./moreDisplayItems") から React.lazy で
// 読み込む。呼び出しごとに別チャンクへ分割されるのではなく、同じ動的
// import 先はバンドラが1つのチャンクにまとめるため、「もっと見る」を
// 開いたときの追加リクエストは1回で済む。
type MoreItemName = keyof typeof import("./moreDisplayItems");

function lazyMoreItem(name: MoreItemName): ComponentType<{ data: WeatherResponse }> {
  return lazy(() =>
    import("./moreDisplayItems").then((mod) => ({
      default: mod[name] as ComponentType<{ data: WeatherResponse }>,
    })),
  );
}

// 画面に出るカテゴリの並び。
export const CATEGORY_ORDER: DisplayCategory[] = [
  "気温",
  "風",
  "降水・湿度",
  "環境",
  "日照・時刻",
];

export const DISPLAY_ITEMS: DisplayItem[] = [
  { category: "気温", component: Condition, tier: "primary" },
  { category: "気温", component: CurrentTemperature, tier: "primary" },
  { category: "気温", component: ApparentTemperature, tier: "primary" },
  { category: "気温", component: lazyMoreItem("HeatStrokeRisk"), tier: "more" },
  { category: "気温", component: lazyMoreItem("ApparentTemperatureRange"), tier: "more" },
  { category: "気温", component: lazyMoreItem("ApparentTemperatureMean"), tier: "more" },
  { category: "気温", component: TemperatureRange, tier: "primary" },
  { category: "気温", component: lazyMoreItem("TemperatureMean"), tier: "more" },
  { category: "気温", component: lazyMoreItem("DewPoint"), tier: "more" },
  { category: "気温", component: lazyMoreItem("WetBulbTemperature"), tier: "more" },
  { category: "気温", component: lazyMoreItem("TemperatureDiffGroundAloft"), tier: "more" },

  { category: "風", component: Wind, tier: "primary" },

  { category: "降水・湿度", component: Humidity, tier: "primary" },
  { category: "降水・湿度", component: HumiditySparkline, tier: "primary" },
  { category: "降水・湿度", component: lazyMoreItem("HumidityRange"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("HumidityMean"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("HumidityDiffGroundAloft"), tier: "more" },
  { category: "降水・湿度", component: Precipitation, tier: "primary" },
  { category: "降水・湿度", component: lazyMoreItem("PrecipitationType"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("Showers"), tier: "more" },
  { category: "降水・湿度", component: PrecipitationProbability, tier: "primary" },
  { category: "降水・湿度", component: lazyMoreItem("PrecipitationProbabilityMean"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("PrecipitationProbabilityMin"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("PrecipitationHours"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("PrecipitationSum"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("PrecipitationSumByType"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SnowDepth"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("LaundryDryness"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SoilTemperature"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SoilTemperatureDeep"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SoilTemperatureDeeper"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SoilTemperatureDeepest"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SoilMoisture"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SoilMoistureDeep"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SoilMoistureDeeper"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SoilMoistureDeepest"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("SoilMoistureBedrock"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("Evapotranspiration"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("VaporPressureDeficit"), tier: "more" },
  { category: "降水・湿度", component: lazyMoreItem("GardenWatering"), tier: "more" },

  { category: "環境", component: Pressure, tier: "primary" },
  { category: "環境", component: lazyMoreItem("SeaLevelPressure"), tier: "more" },
  { category: "環境", component: CloudCover, tier: "primary" },
  { category: "環境", component: lazyMoreItem("CloudCoverLayers"), tier: "more" },
  { category: "環境", component: Visibility, tier: "primary" },
  { category: "環境", component: lazyMoreItem("FreezingLevel"), tier: "more" },
  { category: "環境", component: lazyMoreItem("SolarRadiation"), tier: "more" },
  { category: "環境", component: lazyMoreItem("SolarRadiationDirect"), tier: "more" },
  { category: "環境", component: lazyMoreItem("SolarRadiationDiffuse"), tier: "more" },
  { category: "環境", component: lazyMoreItem("SolarRadiationDirectNormal"), tier: "more" },
  { category: "環境", component: lazyMoreItem("SolarRadiationSum"), tier: "more" },
  { category: "環境", component: lazyMoreItem("UvIndex"), tier: "more" },
  { category: "環境", component: lazyMoreItem("Elevation"), tier: "more" },

  { category: "日照・時刻", component: SunTimes, tier: "primary" },
  { category: "日照・時刻", component: lazyMoreItem("SunTimesRelative"), tier: "more" },
  { category: "日照・時刻", component: lazyMoreItem("DaylightDuration"), tier: "more" },
  { category: "日照・時刻", component: lazyMoreItem("SunshineDuration"), tier: "more" },
  { category: "日照・時刻", component: ObservedAt, tier: "primary" },
];
