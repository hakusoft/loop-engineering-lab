import type { ComponentType } from "react";
import type { WeatherResponse } from "./api";
import { ApparentTemperature } from "./ApparentTemperature";
import { ApparentTemperatureRange } from "./ApparentTemperatureRange";
import { ApparentTemperatureMean } from "./ApparentTemperatureMean";
import { CloudCover } from "./CloudCover";
import { CloudCoverLayers } from "./CloudCoverLayers";
import { Condition } from "./Condition";
import { CurrentTemperature } from "./CurrentTemperature";
import { DaylightDuration } from "./DaylightDuration";
import { DewPoint } from "./DewPoint";
import { Elevation } from "./Elevation";
import { GardenWatering } from "./GardenWatering";
import { Humidity } from "./Humidity";
import { HumidityRange } from "./HumidityRange";
import { LaundryDryness } from "./LaundryDryness";
import { Evapotranspiration } from "./Evapotranspiration";
import { SoilTemperature } from "./SoilTemperature";
import { SoilTemperatureDeep } from "./SoilTemperatureDeep";
import { SoilTemperatureDeeper } from "./SoilTemperatureDeeper";
import { SoilMoisture } from "./SoilMoisture";
import { SoilMoistureDeep } from "./SoilMoistureDeep";
import { ObservedAt } from "./ObservedAt";
import { Precipitation } from "./Precipitation";
import { PrecipitationHours } from "./PrecipitationHours";
import { PrecipitationProbability } from "./PrecipitationProbability";
import { PrecipitationSum } from "./PrecipitationSum";
import { PrecipitationSumByType } from "./PrecipitationSumByType";
import { PrecipitationType } from "./PrecipitationType";
import { Showers } from "./Showers";
import { Pressure } from "./Pressure";
import { SeaLevelPressure } from "./SeaLevelPressure";
import { SnowDepth } from "./SnowDepth";
import { SolarRadiation } from "./SolarRadiation";
import { SolarRadiationDirect } from "./SolarRadiationDirect";
import { SolarRadiationDiffuse } from "./SolarRadiationDiffuse";
import { SolarRadiationSum } from "./SolarRadiationSum";
import { SunTimes } from "./SunTimes";
import { SunshineDuration } from "./SunshineDuration";
import { TemperatureDiffGroundAloft } from "./TemperatureDiffGroundAloft";
import { TemperatureMean } from "./TemperatureMean";
import { TemperatureRange } from "./TemperatureRange";
import { UvIndex } from "./UvIndex";
import { FreezingLevel } from "./FreezingLevel";
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
  { category: "気温", component: ApparentTemperature, tier: "more" },
  { category: "気温", component: ApparentTemperatureRange, tier: "more" },
  { category: "気温", component: ApparentTemperatureMean, tier: "more" },
  { category: "気温", component: TemperatureRange, tier: "primary" },
  { category: "気温", component: TemperatureMean, tier: "more" },
  { category: "気温", component: DewPoint, tier: "more" },
  { category: "気温", component: TemperatureDiffGroundAloft, tier: "more" },

  { category: "風", component: Wind, tier: "primary" },

  { category: "降水・湿度", component: Humidity, tier: "primary" },
  { category: "降水・湿度", component: HumidityRange, tier: "more" },
  { category: "降水・湿度", component: Precipitation, tier: "primary" },
  { category: "降水・湿度", component: PrecipitationType, tier: "more" },
  { category: "降水・湿度", component: Showers, tier: "more" },
  { category: "降水・湿度", component: PrecipitationProbability, tier: "primary" },
  { category: "降水・湿度", component: PrecipitationHours, tier: "more" },
  { category: "降水・湿度", component: PrecipitationSum, tier: "more" },
  { category: "降水・湿度", component: PrecipitationSumByType, tier: "more" },
  { category: "降水・湿度", component: SnowDepth, tier: "more" },
  { category: "降水・湿度", component: LaundryDryness, tier: "more" },
  { category: "降水・湿度", component: SoilTemperature, tier: "more" },
  { category: "降水・湿度", component: SoilTemperatureDeep, tier: "more" },
  { category: "降水・湿度", component: SoilTemperatureDeeper, tier: "more" },
  { category: "降水・湿度", component: SoilMoisture, tier: "more" },
  { category: "降水・湿度", component: SoilMoistureDeep, tier: "more" },
  { category: "降水・湿度", component: Evapotranspiration, tier: "more" },
  { category: "降水・湿度", component: GardenWatering, tier: "more" },

  { category: "環境", component: Pressure, tier: "primary" },
  { category: "環境", component: SeaLevelPressure, tier: "more" },
  { category: "環境", component: CloudCover, tier: "primary" },
  { category: "環境", component: CloudCoverLayers, tier: "more" },
  { category: "環境", component: Visibility, tier: "primary" },
  { category: "環境", component: FreezingLevel, tier: "more" },
  { category: "環境", component: SolarRadiation, tier: "more" },
  { category: "環境", component: SolarRadiationDirect, tier: "more" },
  { category: "環境", component: SolarRadiationDiffuse, tier: "more" },
  { category: "環境", component: SolarRadiationSum, tier: "more" },
  { category: "環境", component: UvIndex, tier: "more" },
  { category: "環境", component: Elevation, tier: "more" },

  { category: "日照・時刻", component: SunTimes, tier: "primary" },
  { category: "日照・時刻", component: DaylightDuration, tier: "more" },
  { category: "日照・時刻", component: SunshineDuration, tier: "more" },
  { category: "日照・時刻", component: ObservedAt, tier: "primary" },
];
