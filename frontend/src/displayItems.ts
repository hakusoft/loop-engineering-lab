import type { ComponentType } from "react";
import type { WeatherResponse } from "./api";
import { ApparentTemperature } from "./ApparentTemperature";
import { ApparentTemperatureRange } from "./ApparentTemperatureRange";
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
import { SoilTemperature } from "./SoilTemperature";
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
import { SolarRadiationSum } from "./SolarRadiationSum";
import { SunTimes } from "./SunTimes";
import { SunshineDuration } from "./SunshineDuration";
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

export type DisplayItem = {
  category: DisplayCategory;
  component: ComponentType<{ data: WeatherResponse }>;
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
  { category: "気温", component: Condition },
  { category: "気温", component: CurrentTemperature },
  { category: "気温", component: ApparentTemperature },
  { category: "気温", component: ApparentTemperatureRange },
  { category: "気温", component: TemperatureRange },
  { category: "気温", component: DewPoint },

  { category: "風", component: Wind },

  { category: "降水・湿度", component: Humidity },
  { category: "降水・湿度", component: HumidityRange },
  { category: "降水・湿度", component: Precipitation },
  { category: "降水・湿度", component: PrecipitationType },
  { category: "降水・湿度", component: Showers },
  { category: "降水・湿度", component: PrecipitationProbability },
  { category: "降水・湿度", component: PrecipitationHours },
  { category: "降水・湿度", component: PrecipitationSum },
  { category: "降水・湿度", component: PrecipitationSumByType },
  { category: "降水・湿度", component: SnowDepth },
  { category: "降水・湿度", component: LaundryDryness },
  { category: "降水・湿度", component: SoilTemperature },
  { category: "降水・湿度", component: GardenWatering },

  { category: "環境", component: Pressure },
  { category: "環境", component: SeaLevelPressure },
  { category: "環境", component: CloudCover },
  { category: "環境", component: CloudCoverLayers },
  { category: "環境", component: Visibility },
  { category: "環境", component: FreezingLevel },
  { category: "環境", component: SolarRadiation },
  { category: "環境", component: SolarRadiationSum },
  { category: "環境", component: UvIndex },
  { category: "環境", component: Elevation },

  { category: "日照・時刻", component: SunTimes },
  { category: "日照・時刻", component: DaylightDuration },
  { category: "日照・時刻", component: SunshineDuration },
  { category: "日照・時刻", component: ObservedAt },
];
