"""format_forecast のテスト。ネットワークには触らない。

スタブは Open-Meteo が実際に返す形をそのまま写したもの。
"""

import json
from pathlib import Path

from app.weather import (
    summarize_day,
    thunderstorm_hours,
    CURRENT_FIELDS,
    DAILY_FIELDS,
    HOURLY_FIELDS,
    _compass_direction,
    _daylight_duration_hours,
    _round_coordinate,
    _round_pressure,
    _round_wind_speed,
    _seconds_to_hours,
    _weather_description,
    format_forecast,
    format_hourly_series,
)

STUB_RESPONSE = {
    "latitude": 35.68,
    "longitude": 139.76,
    "elevation": 40.0,
    "current_units": {
        "time": "iso8601",
        "temperature_2m": "°C",
        "relative_humidity_2m": "%",
        "wind_speed_10m": "km/h",
        "wind_direction_10m": "°",
        "wind_gusts_10m": "km/h",
        "apparent_temperature": "°C",
        "precipitation": "mm",
        "rain": "mm",
        "showers": "mm",
        "snowfall": "cm",
        "surface_pressure": "hPa",
        "pressure_msl": "hPa",
        "cloud_cover": "%",
        "cloud_cover_low": "%",
        "cloud_cover_mid": "%",
        "cloud_cover_high": "%",
        "visibility": "m",
        "freezing_level_height": "m",
        "dew_point_2m": "°C",
        "soil_temperature_0cm": "°C",
        "soil_moisture_0_to_1cm": "m³/m³",
        "soil_moisture_1_to_3cm": "m³/m³",
        "shortwave_radiation": "W/m²",
        "snow_depth": "m",
        "uv_index": "",
    },
    "current": {
        "time": "2026-07-21T09:00",
        "temperature_2m": 28.4,
        "relative_humidity_2m": 71,
        "wind_speed_10m": 12.3,
        "wind_direction_10m": 250,
        "wind_gusts_10m": 24.8,
        "apparent_temperature": 33.1,
        "precipitation": 0.0,
        "rain": 0.0,
        "showers": 0.0,
        "snowfall": 0.0,
        "surface_pressure": 1008.2,
        "pressure_msl": 1012.6,
        "cloud_cover": 40,
        "cloud_cover_low": 10,
        "cloud_cover_mid": 20,
        "cloud_cover_high": 30,
        "weather_code": 1,
        "is_day": 1,
        "visibility": 24140.0,
        "freezing_level_height": 4800.0,
        "dew_point_2m": 22.6,
        "soil_temperature_0cm": 30.5,
        "soil_moisture_0_to_1cm": 0.28,
        "soil_moisture_1_to_3cm": 0.31,
        "shortwave_radiation": 412.0,
        "snow_depth": 0.0,
        "uv_index": 5.2,
    },
    "daily_units": {
        "time": "iso8601",
        "uv_index_max": "",
        "shortwave_radiation_sum": "MJ/m²",
        "sunrise": "iso8601",
        "sunset": "iso8601",
        "temperature_2m_max": "°C",
        "temperature_2m_min": "°C",
        "precipitation_probability_max": "%",
        "sunshine_duration": "s",
        "et0_fao_evapotranspiration": "mm",
        "precipitation_hours": "h",
        "precipitation_sum": "mm",
        "rain_sum": "mm",
        "showers_sum": "mm",
        "snowfall_sum": "cm",
        "wind_speed_10m_max": "km/h",
        "wind_direction_10m_dominant": "°",
        "apparent_temperature_max": "°C",
        "apparent_temperature_min": "°C",
        "wind_gusts_10m_max": "km/h",
        "relative_humidity_2m_max": "%",
        "relative_humidity_2m_min": "%",
    },
    "daily": {
        "time": ["2026-07-21"],
        "uv_index_max": [7.8],
        "shortwave_radiation_sum": [23.4],
        "sunrise": ["2026-07-21T04:44"],
        "sunset": ["2026-07-21T18:47"],
        "temperature_2m_max": [33.2],
        "temperature_2m_min": [24.7],
        "precipitation_probability_max": [20],
        "sunshine_duration": [36420.0],
        "et0_fao_evapotranspiration": [4.33],
        "precipitation_hours": [3.0],
        "precipitation_sum": [12.5],
        "rain_sum": [12.5],
        "showers_sum": [1.5],
        "snowfall_sum": [0.0],
        "wind_speed_10m_max": [18.4],
        "wind_direction_10m_dominant": [250],
        "apparent_temperature_max": [36.9],
        "apparent_temperature_min": [26.1],
        "wind_gusts_10m_max": [42.6],
        "relative_humidity_2m_max": [85],
        "relative_humidity_2m_min": [55],
    },
}


def test_format_forecast_maps_values_and_units():
    result = format_forecast(STUB_RESPONSE)

    assert result["observed_at"] == "2026-07-21T09:00"
    assert result["temperature"] == {"value": 28.4, "unit": "°C"}
    assert result["apparent_temperature"] == {"value": 33.1, "unit": "°C"}
    assert result["dew_point"] == {"value": 22.6, "unit": "°C"}
    assert result["soil_temperature"] == {"value": 30.5, "unit": "°C"}
    assert result["soil_moisture"] == {"value": 0.28, "unit": "m³/m³"}
    assert result["soil_moisture_deep"] == {"value": 0.31, "unit": "m³/m³"}
    assert result["humidity"] == {"value": 71, "unit": "%"}
    assert result["wind_speed"] == {"value": 12.3, "unit": "km/h"}
    assert result["wind_direction"] == {"value": 250, "unit": "°", "compass": "西南西"}
    assert result["wind_gusts"] == {"value": 24.8, "unit": "km/h"}
    assert result["precipitation"] == {"value": 0.0, "unit": "mm"}
    assert result["rain"] == {"value": 0.0, "unit": "mm"}
    assert result["showers"] == {"value": 0.0, "unit": "mm"}
    assert result["snowfall"] == {"value": 0.0, "unit": "cm"}
    assert result["pressure"] == {"value": 1008.2, "unit": "hPa"}
    assert result["sea_level_pressure"] == {"value": 1012.6, "unit": "hPa"}
    assert result["cloud_cover"] == {"value": 40, "unit": "%"}
    assert result["cloud_cover_low"] == {"value": 10, "unit": "%"}
    assert result["cloud_cover_mid"] == {"value": 20, "unit": "%"}
    assert result["cloud_cover_high"] == {"value": 30, "unit": "%"}
    assert result["visibility"] == {"value": 24140.0, "unit": "m"}
    assert result["freezing_level_height"] == {"value": 4800.0, "unit": "m"}
    assert result["solar_radiation"] == {"value": 412.0, "unit": "W/m²"}
    assert result["solar_radiation_sum"] == {"value": 23.4, "unit": "MJ/m²"}
    assert result["snow_depth"] == {"value": 0.0, "unit": "m"}
    assert result["uv_index"] == {"value": 5.2, "unit": ""}
    assert result["uv_index_max"] == {"value": 7.8, "unit": ""}
    assert result["temperature_max"] == {"value": 33.2, "unit": "°C"}
    assert result["temperature_min"] == {"value": 24.7, "unit": "°C"}
    assert result["apparent_temperature_max"] == {"value": 36.9, "unit": "°C"}
    assert result["apparent_temperature_min"] == {"value": 26.1, "unit": "°C"}
    assert result["humidity_max"] == {"value": 85, "unit": "%"}
    assert result["humidity_min"] == {"value": 55, "unit": "%"}
    assert result["precipitation_probability"] == {"value": 20, "unit": "%"}
    assert result["sunshine_duration"] == {"value": 36420.0 / 3600, "unit": "h"}
    assert result["evapotranspiration"] == {"value": 4.33, "unit": "mm"}
    assert result["precipitation_hours"] == {"value": 3.0, "unit": "h"}
    assert result["precipitation_sum"] == {"value": 12.5, "unit": "mm"}
    assert result["rain_sum"] == {"value": 12.5, "unit": "mm"}
    assert result["showers_sum"] == {"value": 1.5, "unit": "mm"}
    assert result["snowfall_sum"] == {"value": 0.0, "unit": "cm"}
    assert result["wind_speed_max"] == {"value": 18.4, "unit": "km/h"}
    assert result["wind_gusts_max"] == {"value": 42.6, "unit": "km/h"}
    assert result["wind_direction_dominant"] == {
        "value": 250,
        "unit": "°",
        "compass": "西南西",
    }
    assert result["sunrise"] == "2026-07-21T04:44"
    assert result["sunset"] == "2026-07-21T18:47"
    assert result["daylight_duration"] == {"value": 14.05, "unit": "h"}
    assert result["is_day"] is True
    assert result["condition"] == {"code": 1, "description": "晴れ"}
    assert result["coordinates"] == {"latitude": 35.68, "longitude": 139.76}
    assert result["location_name"] == "東京"
    assert result["elevation"] == {"value": 40.0, "unit": "m"}


def test_format_forecast_groups_location_and_precipitation_fields():
    """地点名・観測時刻は先頭に、降水関連の項目はまとめて連続させる。"""
    result = format_forecast(STUB_RESPONSE)
    keys = list(result.keys())

    assert keys.index("location_name") < keys.index("temperature")
    assert keys.index("observed_at") < keys.index("temperature")

    precipitation_keys = [
        "precipitation",
        "precipitation_probability",
        "precipitation_hours",
        "precipitation_sum",
    ]
    positions = sorted(keys.index(k) for k in precipitation_keys)
    assert positions[-1] - positions[0] == len(precipitation_keys) - 1


def test_format_forecast_groups_temperature_and_humidity_fields():
    """気温系・湿度系は、現在値と本日の最高・最低が隣接するようにまとめる。"""
    result = format_forecast(STUB_RESPONSE)
    keys = list(result.keys())

    temperature_keys = [
        "temperature",
        "apparent_temperature",
        "dew_point",
        "temperature_max",
        "temperature_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
    ]
    positions = sorted(keys.index(k) for k in temperature_keys)
    assert positions[-1] - positions[0] == len(temperature_keys) - 1

    humidity_keys = ["humidity", "humidity_max", "humidity_min"]
    positions = sorted(keys.index(k) for k in humidity_keys)
    assert positions[-1] - positions[0] == len(humidity_keys) - 1


def test_compass_direction_maps_cardinal_points():
    assert _compass_direction(0) == "北"
    assert _compass_direction(90) == "東"
    assert _compass_direction(180) == "南"
    assert _compass_direction(270) == "西"


def test_compass_direction_maps_boundary_values():
    assert _compass_direction(11.24) == "北"
    assert _compass_direction(11.25) == "北北東"


def test_compass_direction_wraps_around_north():
    assert _compass_direction(348.74) == "北北西"
    assert _compass_direction(348.75) == "北"
    assert _compass_direction(349) == "北"
    assert _compass_direction(360) == "北"


STUB_SERIES = {
    "latitude": 35.68,
    "longitude": 139.76,
    "hourly_units": {
        "time": "iso8601",
        "weather_code": "wmo code",
        "cloud_cover": "%",
        "temperature_2m": "°C",
        "apparent_temperature": "°C",
        "relative_humidity_2m": "%",
        "rain": "mm",
        "snowfall": "cm",
        "precipitation_probability": "%",
        "surface_pressure": "hPa",
        "wind_speed_10m": "km/h",
        "wind_direction_10m": "°",
        "wind_speed_850hPa": "km/h",
        "uv_index": "",
    },
    "hourly": {
        "time": ["2026-07-21T00:00", "2026-07-21T01:00", "2026-07-21T02:00"],
        "weather_code": [0, 3, 61],
        "cloud_cover": [20, 55, 90],
        "temperature_2m": [26.1, 25.4, 24.9],
        "apparent_temperature": [27.3, 26.5, 25.8],
        "relative_humidity_2m": [78, 81, 85],
        "rain": [0.0, 0.5, 1.2],
        "snowfall": [0.0, 0.0, 0.0],
        "precipitation_probability": [10, 30, 60],
        "surface_pressure": [1008.2, 1008.0, 1007.6],
        "wind_speed_10m": [8.1, 9.4, 10.2],
        "wind_direction_10m": [200.0, 210.0, 220.0],
        "wind_speed_850hPa": [24.5, 26.1, 28.3],
        "uv_index": [0.2, 1.5, 3.1],
    },
}


def test_series_shares_one_timeline():
    result = format_hourly_series(STUB_SERIES)

    assert result["timestamps"] == STUB_SERIES["hourly"]["time"]
    for series in result["series"]:
        assert len(series["values"]) == len(result["timestamps"])


def test_series_keeps_units_separate_for_split_axes():
    """気温と湿度は単位が違うので、系列ごとに unit を持つ。"""
    result = format_hourly_series(STUB_SERIES)
    by_label = {s["label"]: s for s in result["series"]}
    temperature = by_label["気温"]
    apparent_temperature = by_label["体感温度"]
    humidity = by_label["湿度"]
    rain = by_label["雨量"]
    snow = by_label["降雪量"]
    precipitation_probability = by_label["降水確率"]
    pressure = by_label["気圧"]
    cloud_cover = by_label["雲量"]
    wind_direction = by_label["風向き"]
    uv_index = by_label["紫外線指数"]

    assert temperature["label"] == "気温"
    assert temperature["unit"] == "°C"
    assert apparent_temperature["label"] == "体感温度"
    assert apparent_temperature["unit"] == "°C"
    assert humidity["label"] == "湿度"
    assert humidity["unit"] == "%"
    assert rain["label"] == "雨量"
    assert rain["unit"] == "mm"
    assert snow["label"] == "降雪量"
    assert snow["unit"] == "cm"
    assert precipitation_probability["label"] == "降水確率"
    assert precipitation_probability["unit"] == "%"
    assert pressure["label"] == "気圧"
    assert pressure["unit"] == "hPa"
    assert cloud_cover["label"] == "雲量"
    assert cloud_cover["unit"] == "%"
    assert wind_direction["label"] == "風向き"
    assert wind_direction["unit"] == "°"
    assert uv_index["label"] == "紫外線指数"
    assert uv_index["unit"] == ""


def test_series_exposes_min_max_for_axis_scaling():
    """軸を分けて描けるよう、系列ごとに範囲を持つ。"""
    result = format_hourly_series(STUB_SERIES)
    by_label = {s["label"]: s for s in result["series"]}
    temperature = by_label["気温"]
    apparent_temperature = by_label["体感温度"]
    humidity = by_label["湿度"]
    rain = by_label["雨量"]
    snow = by_label["降雪量"]
    precipitation_probability = by_label["降水確率"]
    pressure = by_label["気圧"]
    cloud_cover = by_label["雲量"]
    wind_direction = by_label["風向き"]
    uv_index = by_label["紫外線指数"]

    assert (temperature["min"], temperature["max"]) == (24.9, 26.1)
    assert (apparent_temperature["min"], apparent_temperature["max"]) == (25.8, 27.3)
    assert (humidity["min"], humidity["max"]) == (78, 85)
    assert (rain["min"], rain["max"]) == (0.0, 1.2)
    assert (snow["min"], snow["max"]) == (0.0, 0.0)
    assert (precipitation_probability["min"], precipitation_probability["max"]) == (10, 60)
    assert (pressure["min"], pressure["max"]) == (1007.6, 1008.2)
    assert (cloud_cover["min"], cloud_cover["max"]) == (20, 90)
    assert (wind_direction["min"], wind_direction["max"]) == (200.0, 220.0)
    assert (uv_index["min"], uv_index["max"]) == (0.2, 3.1)


def test_series_tolerates_missing_values():
    """Open-Meteo は欠測を null で返すことがある。範囲計算で落ちない。

    降水確率は過去分（past_days）で null になることがある。
    """
    # 要求項目が増えてもこのテストを直さずに済むよう、スタブのキーから組み立てる。
    # 欠測の扱いを見たいので値は None にし、気温と雨量だけ 1 点だけ値を入れる。
    hourly = {
        key: [None, None] for key in STUB_SERIES["hourly"] if key not in ("time", "weather_code")
    }
    hourly["time"] = ["2026-07-21T00:00", "2026-07-21T01:00"]
    hourly["weather_code"] = [0, 3]
    hourly["temperature_2m"] = [26.1, None]
    hourly["rain"] = [0.0, None]
    raw = {**STUB_SERIES, "hourly": hourly}

    result = format_hourly_series(raw)
    by_label = {s["label"]: s for s in result["series"]}
    temperature = by_label["気温"]
    apparent_temperature = by_label["体感温度"]
    humidity = by_label["湿度"]
    rain = by_label["雨量"]
    snow = by_label["降雪量"]
    precipitation_probability = by_label["降水確率"]
    pressure = by_label["気圧"]
    uv_index = by_label["紫外線指数"]

    assert temperature["min"] == 26.1
    assert apparent_temperature["min"] is None  # 全欠測でも例外にしない
    assert humidity["min"] is None  # 全欠測でも例外にしない
    assert len(humidity["values"]) == 2
    assert rain["min"] == 0.0
    assert snow["min"] is None
    assert precipitation_probability["min"] is None
    assert pressure["min"] is None
    assert uv_index["min"] is None


def test_format_forecast_falls_back_when_units_missing():
    """current_units / daily_units が欠けても既定の単位で返す。"""
    raw = {k: v for k, v in STUB_RESPONSE.items() if k not in ("current_units", "daily_units")}

    result = format_forecast(raw)

    assert result["temperature"] == {"value": 28.4, "unit": "°C"}
    assert result["wind_speed"] == {"value": 12.3, "unit": "km/h"}
    assert result["wind_gusts"] == {"value": 24.8, "unit": "km/h"}
    assert result["cloud_cover"] == {"value": 40, "unit": "%"}
    assert result["uv_index_max"] == {"value": 7.8, "unit": ""}
    assert result["temperature_max"] == {"value": 33.2, "unit": "°C"}
    assert result["precipitation_probability"] == {"value": 20, "unit": "%"}
    assert result["sunshine_duration"] == {"value": 36420.0 / 3600, "unit": "h"}
    assert result["precipitation_hours"] == {"value": 3.0, "unit": "h"}
    assert result["precipitation_sum"] == {"value": 12.5, "unit": "mm"}
    assert result["rain_sum"] == {"value": 12.5, "unit": "mm"}
    assert result["showers_sum"] == {"value": 1.5, "unit": "mm"}
    assert result["snowfall_sum"] == {"value": 0.0, "unit": "cm"}
    assert result["wind_speed_max"] == {"value": 18.4, "unit": "km/h"}
    assert result["wind_gusts_max"] == {"value": 42.6, "unit": "km/h"}
    assert result["visibility"] == {"value": 24140.0, "unit": "m"}
    assert result["sea_level_pressure"] == {"value": 1012.6, "unit": "hPa"}
    assert result["solar_radiation"] == {"value": 412.0, "unit": "W/m²"}
    assert result["dew_point"] == {"value": 22.6, "unit": "°C"}
    assert result["location_name"] == "東京"
    assert result["elevation"] == {"value": 40.0, "unit": "m"}


def test_format_forecast_maps_is_day_false_at_night():
    """Open-Meteo は is_day を 1/0 の整数で返すので、真偽値に変換する。"""
    raw = {**STUB_RESPONSE, "current": {**STUB_RESPONSE["current"], "is_day": 0}}

    result = format_forecast(raw)

    assert result["is_day"] is False


def test_weather_description_maps_representative_codes():
    assert _weather_description(0) == "快晴"
    assert _weather_description(3) == "曇り"
    assert _weather_description(63) == "雨"
    assert _weather_description(73) == "雪"
    assert _weather_description(95) == "雷雨"


def test_weather_description_falls_back_for_unknown_code():
    assert _weather_description(1234) == "不明"


def test_round_coordinate_rounds_to_two_decimal_places():
    assert _round_coordinate(35.700001) == 35.7
    assert _round_coordinate(139.759999) == 139.76


def test_format_forecast_rounds_coordinates():
    raw = {**STUB_RESPONSE, "latitude": 35.700001, "longitude": 139.759999}

    result = format_forecast(raw)

    assert result["coordinates"] == {"latitude": 35.7, "longitude": 139.76}


def test_format_hourly_series_rounds_coordinates():
    raw = {**STUB_SERIES, "latitude": 35.700001, "longitude": 139.759999}

    result = format_hourly_series(raw)

    assert result["coordinates"] == {"latitude": 35.7, "longitude": 139.76}


def test_round_pressure_rounds_to_one_decimal_place():
    assert _round_pressure(1013.943127843) == 1013.9
    assert _round_pressure(998.153) == 998.2


def test_round_pressure_passes_through_none():
    """欠測（None）は丸めずにそのまま返す。round(None, 1) は TypeError になるため。"""
    assert _round_pressure(None) is None


def test_format_forecast_tolerates_missing_pressure():
    """current の気圧が欠測（None）でも例外にしない。"""
    raw = {
        **STUB_RESPONSE,
        "current": {
            **STUB_RESPONSE["current"],
            "surface_pressure": None,
            "pressure_msl": None,
        },
    }

    result = format_forecast(raw)

    assert result["pressure"]["value"] is None
    assert result["sea_level_pressure"]["value"] is None


def test_format_forecast_tolerates_missing_soil_moisture_deep():
    """soil_moisture_1_to_3cm が current に無くても KeyError にしない。

    この項目は実 API での応答を確認できないまま追加した（PR #267 のレビュー
    参照）。Open-Meteo が実際にはこのキーを返さない可能性を排除できないため、
    #164 / #67-#68 と同型の KeyError を避けて None を返す。
    """
    raw = {
        **STUB_RESPONSE,
        "current": {
            k: v for k, v in STUB_RESPONSE["current"].items() if k != "soil_moisture_1_to_3cm"
        },
    }

    result = format_forecast(raw)

    assert result["soil_moisture_deep"]["value"] is None


def test_format_forecast_rounds_pressure():
    """気圧は Open-Meteo が桁の長い小数を返すことがあるため、小数第1位に丸める。"""
    raw = {
        **STUB_RESPONSE,
        "current": {
            **STUB_RESPONSE["current"],
            "surface_pressure": 1008.243127,
            "pressure_msl": 1012.649999,
        },
    }

    result = format_forecast(raw)

    assert result["pressure"] == {"value": 1008.2, "unit": "hPa"}
    assert result["sea_level_pressure"] == {"value": 1012.6, "unit": "hPa"}


def test_round_wind_speed_rounds_to_one_decimal_place():
    assert _round_wind_speed(12.349999) == 12.3
    assert _round_wind_speed(24.849999) == 24.8


def test_round_wind_speed_passes_through_none():
    """欠測（None）は丸めずにそのまま返す。round(None, 1) は TypeError になるため。"""
    assert _round_wind_speed(None) is None


def test_format_forecast_rounds_wind_speed():
    """風速・突風は Open-Meteo が桁の長い小数を返すことがあるため、小数第1位に丸める。"""
    raw = {
        **STUB_RESPONSE,
        "current": {
            **STUB_RESPONSE["current"],
            "wind_speed_10m": 12.349999,
            "wind_gusts_10m": 24.849999,
        },
        "daily": {
            **STUB_RESPONSE["daily"],
            "wind_speed_10m_max": [18.449999],
            "wind_gusts_10m_max": [42.649999],
        },
    }

    result = format_forecast(raw)

    assert result["wind_speed"] == {"value": 12.3, "unit": "km/h"}
    assert result["wind_gusts"] == {"value": 24.8, "unit": "km/h"}
    assert result["wind_speed_max"] == {"value": 18.4, "unit": "km/h"}
    assert result["wind_gusts_max"] == {"value": 42.6, "unit": "km/h"}


def test_daylight_duration_hours_computes_difference_in_hours():
    assert _daylight_duration_hours("2026-07-21T04:44", "2026-07-21T18:47") == 14.05


def test_format_forecast_includes_daylight_duration():
    result = format_forecast(STUB_RESPONSE)

    assert result["daylight_duration"] == {"value": 14.05, "unit": "h"}


def test_seconds_to_hours_passes_through_none():
    assert _seconds_to_hours(None) is None


def test_seconds_to_hours_converts_seconds_to_hours():
    assert _seconds_to_hours(36420.0) == 36420.0 / 3600


def test_format_forecast_handles_missing_sunshine_duration():
    """Open-Meteo が sunshine_duration に null を返すことがある（PR #215 で退行）。"""
    raw = {**STUB_RESPONSE, "daily": {**STUB_RESPONSE["daily"], "sunshine_duration": [None]}}

    result = format_forecast(raw)

    assert result["sunshine_duration"] == {"value": None, "unit": "h"}


def test_format_forecast_reads_pressure_from_requested_field():
    """地上気圧（pressure）は surface_pressure キーで読む。

    current には海面気圧（pressure_msl）も含まれるが、取り違えて
    読むと KeyError になる（LOOP-ENGINEERING-LAB-4 の再発防止）。
    """
    result = format_forecast(STUB_RESPONSE)

    assert result["pressure"] == {"value": 1008.2, "unit": "hPa"}
    assert result["sea_level_pressure"] == {"value": 1012.6, "unit": "hPa"}


def test_format_forecast_reads_cloud_cover_from_requested_field():
    """雲量は fetch_forecast が要求する cloud_cover キーで読む。

    cloudcover は要求していないので current に含まれない。
    別のキー名で読むと KeyError になる（LOOP-ENGINEERING-LAB-5 の再発防止）。
    """
    result = format_forecast(STUB_RESPONSE)

    assert result["cloud_cover"] == {"value": 40, "unit": "%"}


def test_format_forecast_reads_visibility_from_requested_field():
    """視程は fetch_forecast が要求する visibility キーで読む。

    visibility_m は要求していないので current に含まれない。
    別のキー名で読むと KeyError になる（LOOP-ENGINEERING-LAB-8 の再発防止）。
    """
    result = format_forecast(STUB_RESPONSE)

    assert result["visibility"] == {"value": 24140.0, "unit": "m"}


def test_requested_fields_have_no_empty_or_duplicated_names():
    """要求する項目名が空でなく、重複もしていないこと。

    以前はカンマ区切りの文字列を暗黙の連結で組み立てていたため、行を
    足すときにカンマを落とすと "aaabbb" のような 1 つの項目名になり、
    構文エラーにもテストの失敗にもならず実 API でだけ壊れていた。
    リスト化した今その事故は起きないが、項目名そのものの取り違えを
    ここで止める。
    """
    for name, fields in [
        ("current", CURRENT_FIELDS),
        ("daily", DAILY_FIELDS),
        ("hourly", HOURLY_FIELDS),
    ]:
        assert fields, f"{name} の項目が空"
        assert all(f.strip() == f for f in fields), f"{name} に前後の空白を含む項目がある"
        assert all("," not in f for f in fields), f"{name} にカンマを含む項目がある"
        assert len(fields) == len(set(fields)), f"{name} に重複した項目がある"


def test_stub_current_matches_requested_current_fields():
    """スタブの current が、実際に要求している項目と一致していること。

    format_forecast は current の値を読むが、スタブが要求項目とずれて
    いると、実装とスタブが同じ誤りを共有したまま緑になる。実際 #164 は
    snow_depth を要求しながら snow_depth_cm を読み、スタブも同じキーに
    していたため CI をすり抜けて本番で KeyError になった。
    """
    stub_keys = set(STUB_RESPONSE["current"]) - {"time", "interval"}

    assert stub_keys == set(CURRENT_FIELDS)


# 実 API の応答を記録したもの。値ではなく「キーの形」を固定するのが目的。
# 手書きのスタブは実装と同じ誤りを共有しうるが、これは Open-Meteo が実際に
# 返したものなので、キー名の取り違えをここで止められる。
# 更新するときは fetch_forecast() / fetch_hourly_series() の戻り値を
# そのまま書き出す（時系列は先頭 3 点に間引いてよい）。
FIXTURES = Path(__file__).parent / "fixtures"


def _load_fixture(name: str) -> dict:
    with (FIXTURES / name).open() as f:
        return json.load(f)


def _fixture_with_stub_defaults(name: str) -> dict:
    """フィクスチャを読み、足りないキーをスタブの値で補って返す。

    フィクスチャは実 API を叩けるときにしか更新できない。項目を足した直後は
    フィクスチャが古く、そのまま渡すと新しいキーで KeyError になる。ここで
    見たいのは「フィクスチャに在るキーを実装が正しく読めるか」なので、
    足りない分だけ補う。フィクスチャに在るキーは実応答の値がそのまま残るため、
    #164 のようなキー名の取り違えは引き続き検出できる。
    """
    raw = _load_fixture(name)
    if "hourly" in raw:
        length = len(raw["hourly"]["time"])
        for key, value in STUB_SERIES["hourly"].items():
            if key not in raw["hourly"]:
                raw["hourly"][key] = [value[0] if isinstance(value, list) else value] * length
    else:
        for section, stub in (
            ("current", STUB_RESPONSE["current"]),
            ("daily", STUB_RESPONSE["daily"]),
        ):
            for key, value in stub.items():
                raw[section].setdefault(key, value)
    return raw


def test_format_forecast_works_against_real_api_shape():
    """実 API の応答の形で format_forecast が通ること。

    手書きのスタブは、実装がキー名を間違えるとスタブも同じ間違いになり、
    テストが緑のまま通ってしまう。#164 は snow_depth を要求しながら
    snow_depth_cm を読み、スタブも snow_depth_cm だったため CI をすり抜け、
    本番で KeyError になった。記録した実応答なら同じ誤りを共有できない。
    """
    # フィクスチャは実 API を叩けるときにしか更新できない。項目を足した直後は
    # フィクスチャが古く、format_forecast が新しいキーを読んで KeyError になる。
    # ここで見たいのは「フィクスチャに在るキーを実装が正しく読めるか」なので、
    # 足りないキーはスタブの値で補ってから通す。補った時点で実応答由来では
    # なくなるが、フィクスチャに在るキーは実応答の値がそのまま残るため、
    # #164 のようなキー名の取り違えは引き続き検出できる。
    result = format_forecast(_fixture_with_stub_defaults("forecast.json"))

    # 値は取得時点のものなので、キーが揃っていることだけを見る。
    assert result["snow_depth"]["unit"] == "m"
    assert set(result) >= {
        "temperature",
        "pressure",
        "sea_level_pressure",
        "cloud_cover",
        "visibility",
        "solar_radiation",
        "snow_depth",
        "uv_index",
    }


def test_format_hourly_series_works_against_real_api_shape():
    """実 API の応答の形で format_hourly_series が通ること。

    forecast 側と同じく、項目を足した直後はフィクスチャが古い。足りないキーは
    スタブの値で補ってから通す（詳細は format_forecast 側のテストのコメント）。
    """
    result = format_hourly_series(_fixture_with_stub_defaults("hourly_series.json"))

    # 系列が増えてもこのテストを直さずに済むよう、包含で見る。並び順そのものは
    # グラフの重ね順に関わるだけで、ここで守りたいのは「実応答の形で通ること」。
    assert set(s["label"] for s in result["series"]) >= {
        "気温",
        "体感温度",
        "湿度",
        "雨量",
        "降雪量",
        "降水確率",
        "気圧",
        "紫外線指数",
    }


def test_fixture_current_fields_are_all_requested():
    """記録した実応答の current にあるキーが、全て要求項目に含まれること。

    包含であって一致ではない。要求項目を増やしても、フィクスチャを
    更新するまではフィクスチャ側が古いままになる。フィクスチャの更新には
    実 API を叩く必要があり、外部通信ができない環境では実行できないため、
    厳密一致にすると「項目を足したいがテストが通せない」という行き止まりが
    できる（実際 #193 以降のバックログがこれで止まった）。

    守りたいのはキー名の取り違えの検出（#164）で、それには
    「実応答にあるキーは必ず要求している」方向だけで足りる。
    """
    fixture_keys = set(_load_fixture("forecast.json")["current"]) - {"time", "interval"}

    assert fixture_keys <= set(CURRENT_FIELDS)


def test_fixture_hourly_fields_are_all_requested():
    """記録した実応答の hourly にあるキーが、全て要求項目に含まれること。"""
    fixture_keys = set(_load_fixture("hourly_series.json")["hourly"]) - {"time"}

    assert fixture_keys <= set(HOURLY_FIELDS)


def test_stub_and_fixture_agree_on_shared_current_keys():
    """手書きのスタブと記録した実応答が、両方にあるキーで食い違わないこと。

    既存のテストは読みやすさのため手書きのスタブを使っている。実応答と
    突き合わせておけば、スタブだけが古くなったり、実装に合わせて誤った
    キーに書き換えられたりしたときに気づける。

    ここも包含で見る。新しい項目はスタブに先に入り、フィクスチャは
    実 API を叩けるときに追いつく。#164 のようなキー名の取り違えは
    「フィクスチャにあるキーがスタブにも在る」ことだけで検出できる。
    """
    stub_keys = set(STUB_RESPONSE["current"]) - {"time", "interval"}
    fixture_keys = set(_load_fixture("forecast.json")["current"]) - {"time", "interval"}

    assert fixture_keys <= stub_keys


def test_hourly_series_are_all_requested_fields():
    """系列として出している項目が、全て hourly の要求項目に含まれること。

    要求していない項目を読もうとすれば実 API で KeyError になる。逆向き
    （要求したのに使っていない）は許す。降水量（precipitation）は雨量と
    降雪量に分けて出しているため系列にしておらず、また新しい項目を
    要求してから系列に足すまでの間もここを通れるようにしておく。
    """
    result = format_hourly_series(_fixture_with_stub_defaults("hourly_series.json"))
    labels_to_keys = {
        "気温": "temperature_2m",
        "体感温度": "apparent_temperature",
        "湿度": "relative_humidity_2m",
        "雨量": "rain",
        "降雪量": "snowfall",
        "降水確率": "precipitation_probability",
        "気圧": "surface_pressure",
        "雲量": "cloud_cover",
        "風速": "wind_speed_10m",
        "風向き": "wind_direction_10m",
        "上空の風速": "wind_speed_850hPa",
        "紫外線指数": "uv_index",
    }
    used = {labels_to_keys[s["label"]] for s in result["series"] if s["label"] in labels_to_keys}

    assert used <= set(HOURLY_FIELDS)


def test_summarize_day_reports_a_single_weather_plainly():
    """一日ずっと同じ天気なら、余計な言い回しをつけない。"""
    timestamps = [f"2026-08-26T{h:02d}:00" for h in range(24)]

    assert summarize_day(timestamps, [0] * 24) == "晴れ"


def test_summarize_day_mentions_the_second_most_common_weather():
    """混ざっているときは「A 時々 B」と並べる。"""
    timestamps = [f"2026-08-26T{h:02d}:00" for h in range(24)]
    codes = [0, 0, 0, 3, 0, 0, 3, 0] * 3

    assert summarize_day(timestamps, codes) == "晴れ時々曇り"


def test_summarize_day_mentions_when_the_weather_changes():
    """後半で変わって戻らないなら、変わり始めの時間帯を添える。"""
    timestamps = [f"2026-08-26T{h:02d}:00" for h in range(24)]
    codes = [0] * 16 + [61] * 8

    assert summarize_day(timestamps, codes) == "晴れ、夕方から雨"


def test_summarize_day_avoids_repeating_the_same_weather():
    """「時々」の相手と変化先が同じなら、重複しないよう「時々」を落とす。

    「晴れ時々雨、夕方から雨」のように同じ語が二度出るのを避ける。
    """
    timestamps = [f"2026-08-26T{h:02d}:00" for h in range(24)]
    codes = [0] * 14 + [61] * 10
    summary = summarize_day(timestamps, codes)

    assert summary == "晴れ、昼から雨"
    assert summary.count("雨") == 1


def test_summarize_day_handles_empty_input():
    """データが無いときも落ちない。"""
    assert summarize_day([], []) == "天気の情報がありません"


def test_thunderstorm_hours_lists_hours_with_thunder():
    """雷を伴うコード（95/96/99）の時刻を返す。"""
    timestamps = [f"2026-08-26T{h:02d}:00" for h in range(24)]
    codes = [0] * 14 + [95, 96, 99] + [0] * 7

    assert thunderstorm_hours(timestamps, codes) == [
        "2026-08-26T14:00",
        "2026-08-26T15:00",
        "2026-08-26T16:00",
    ]


def test_thunderstorm_hours_is_empty_without_thunder():
    """雷が無ければ空。画面では何も出さない。"""
    timestamps = [f"2026-08-26T{h:02d}:00" for h in range(24)]

    assert thunderstorm_hours(timestamps, [0, 3, 61] * 8) == []
