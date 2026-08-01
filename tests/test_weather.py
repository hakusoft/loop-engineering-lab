"""format_forecast のテスト。ネットワークには触らない。

スタブは Open-Meteo が実際に返す形をそのまま写したもの。
"""

from app.weather import (
    _compass_direction,
    _daylight_duration_hours,
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
        "surface_pressure": "hPa",
        "cloud_cover": "%",
        "visibility": "m",
        "dew_point_2m": "°C",
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
        "surface_pressure": 1008.2,
        "cloud_cover": 40,
        "weather_code": 1,
        "is_day": 1,
        "visibility": 24140.0,
        "dew_point_2m": 22.6,
    },
    "daily_units": {
        "time": "iso8601",
        "uv_index_max": "",
        "sunrise": "iso8601",
        "sunset": "iso8601",
        "temperature_2m_max": "°C",
        "temperature_2m_min": "°C",
        "precipitation_probability_max": "%",
        "sunshine_duration": "s",
        "precipitation_hours": "h",
        "precipitation_sum": "mm",
        "wind_speed_10m_max": "km/h",
        "wind_direction_10m_dominant": "°",
        "wind_gusts_10m_max": "km/h",
    },
    "daily": {
        "time": ["2026-07-21"],
        "uv_index_max": [7.8],
        "sunrise": ["2026-07-21T04:44"],
        "sunset": ["2026-07-21T18:47"],
        "temperature_2m_max": [33.2],
        "temperature_2m_min": [24.7],
        "precipitation_probability_max": [20],
        "sunshine_duration": [36420.0],
        "precipitation_hours": [3.0],
        "precipitation_sum": [12.5],
        "wind_speed_10m_max": [18.4],
        "wind_direction_10m_dominant": [250],
        "wind_gusts_10m_max": [42.6],
    },
}


def test_format_forecast_maps_values_and_units():
    result = format_forecast(STUB_RESPONSE)

    assert result["observed_at"] == "2026-07-21T09:00"
    assert result["temperature"] == {"value": 28.4, "unit": "°C"}
    assert result["apparent_temperature"] == {"value": 33.1, "unit": "°C"}
    assert result["dew_point"] == {"value": 22.6, "unit": "°C"}
    assert result["humidity"] == {"value": 71, "unit": "%"}
    assert result["wind_speed"] == {"value": 12.3, "unit": "km/h"}
    assert result["wind_direction"] == {"value": 250, "unit": "°", "compass": "西南西"}
    assert result["wind_gusts"] == {"value": 24.8, "unit": "km/h"}
    assert result["precipitation"] == {"value": 0.0, "unit": "mm"}
    assert result["pressure"] == {"value": 1008.2, "unit": "hPa"}
    assert result["cloud_cover"] == {"value": 40, "unit": "%"}
    assert result["visibility"] == {"value": 24140.0, "unit": "m"}
    assert result["uv_index_max"] == {"value": 7.8, "unit": ""}
    assert result["temperature_max"] == {"value": 33.2, "unit": "°C"}
    assert result["temperature_min"] == {"value": 24.7, "unit": "°C"}
    assert result["precipitation_probability"] == {"value": 20, "unit": "%"}
    assert result["sunshine_duration"] == {"value": 36420.0, "unit": "s"}
    assert result["precipitation_hours"] == {"value": 3.0, "unit": "h"}
    assert result["precipitation_sum"] == {"value": 12.5, "unit": "mm"}
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
        "temperature_2m": "°C",
        "relative_humidity_2m": "%",
        "precipitation": "mm",
    },
    "hourly": {
        "time": ["2026-07-21T00:00", "2026-07-21T01:00", "2026-07-21T02:00"],
        "temperature_2m": [26.1, 25.4, 24.9],
        "relative_humidity_2m": [78, 81, 85],
        "precipitation": [0.0, 0.5, 1.2],
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
    temperature, humidity, precipitation = result["series"]

    assert temperature["label"] == "気温"
    assert temperature["unit"] == "°C"
    assert humidity["label"] == "湿度"
    assert humidity["unit"] == "%"
    assert precipitation["label"] == "降水量"
    assert precipitation["unit"] == "mm"


def test_series_exposes_min_max_for_axis_scaling():
    """軸を分けて描けるよう、系列ごとに範囲を持つ。"""
    result = format_hourly_series(STUB_SERIES)
    temperature, humidity, precipitation = result["series"]

    assert (temperature["min"], temperature["max"]) == (24.9, 26.1)
    assert (humidity["min"], humidity["max"]) == (78, 85)
    assert (precipitation["min"], precipitation["max"]) == (0.0, 1.2)


def test_series_tolerates_missing_values():
    """Open-Meteo は欠測を null で返すことがある。範囲計算で落ちない。"""
    raw = {
        **STUB_SERIES,
        "hourly": {
            "time": ["2026-07-21T00:00", "2026-07-21T01:00"],
            "temperature_2m": [26.1, None],
            "relative_humidity_2m": [None, None],
            "precipitation": [0.0, None],
        },
    }

    result = format_hourly_series(raw)
    temperature, humidity, precipitation = result["series"]

    assert temperature["min"] == 26.1
    assert humidity["min"] is None  # 全欠測でも例外にしない
    assert len(humidity["values"]) == 2
    assert precipitation["min"] == 0.0


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
    assert result["sunshine_duration"] == {"value": 36420.0, "unit": "s"}
    assert result["precipitation_hours"] == {"value": 3.0, "unit": "h"}
    assert result["precipitation_sum"] == {"value": 12.5, "unit": "mm"}
    assert result["wind_speed_max"] == {"value": 18.4, "unit": "km/h"}
    assert result["wind_gusts_max"] == {"value": 42.6, "unit": "km/h"}
    assert result["visibility"] == {"value": 24140.0, "unit": "m"}
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


def test_daylight_duration_hours_computes_difference_in_hours():
    assert _daylight_duration_hours("2026-07-21T04:44", "2026-07-21T18:47") == 14.05


def test_format_forecast_includes_daylight_duration():
    result = format_forecast(STUB_RESPONSE)

    assert result["daylight_duration"] == {"value": 14.05, "unit": "h"}


def test_format_forecast_reads_pressure_from_requested_field():
    """気圧は fetch_forecast が要求する surface_pressure キーで読む。

    pressure_msl は要求していないので current に含まれない。
    別のキー名で読むと KeyError になる（LOOP-ENGINEERING-LAB-4 の再発防止）。
    """
    result = format_forecast(STUB_RESPONSE)

    assert result["pressure"] == {"value": 1008.2, "unit": "hPa"}


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
