"""format_forecast のテスト。ネットワークには触らない。

スタブは Open-Meteo が実際に返す形をそのまま写したもの。
"""

from app.weather import format_forecast, format_hourly_series

STUB_RESPONSE = {
    "latitude": 35.68,
    "longitude": 139.76,
    "current_units": {
        "time": "iso8601",
        "temperature_2m": "°C",
        "relative_humidity_2m": "%",
        "wind_speed_10m": "km/h",
        "apparent_temperature": "°C",
    },
    "current": {
        "time": "2026-07-21T09:00",
        "temperature_2m": 28.4,
        "relative_humidity_2m": 71,
        "wind_speed_10m": 12.3,
        "apparent_temperature": 33.1,
    },
}


def test_format_forecast_maps_values_and_units():
    result = format_forecast(STUB_RESPONSE)

    assert result["observed_at"] == "2026-07-21T09:00"
    assert result["temperature"] == {"value": 28.4, "unit": "°C"}
    assert result["apparent_temperature"] == {"value": 33.1, "unit": "°C"}
    assert result["humidity"] == {"value": 71, "unit": "%"}
    assert result["wind_speed"] == {"value": 12.3, "unit": "km/h"}
    assert result["coordinates"] == {"latitude": 35.68, "longitude": 139.76}


STUB_SERIES = {
    "latitude": 35.68,
    "longitude": 139.76,
    "hourly_units": {
        "time": "iso8601",
        "temperature_2m": "°C",
        "relative_humidity_2m": "%",
    },
    "hourly": {
        "time": ["2026-07-21T00:00", "2026-07-21T01:00", "2026-07-21T02:00"],
        "temperature_2m": [26.1, 25.4, 24.9],
        "relative_humidity_2m": [78, 81, 85],
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
    temperature, humidity = result["series"]

    assert temperature["label"] == "気温"
    assert temperature["unit"] == "°C"
    assert humidity["label"] == "湿度"
    assert humidity["unit"] == "%"


def test_series_exposes_min_max_for_axis_scaling():
    """軸を分けて描けるよう、系列ごとに範囲を持つ。"""
    result = format_hourly_series(STUB_SERIES)
    temperature, humidity = result["series"]

    assert (temperature["min"], temperature["max"]) == (24.9, 26.1)
    assert (humidity["min"], humidity["max"]) == (78, 85)


def test_series_tolerates_missing_values():
    """Open-Meteo は欠測を null で返すことがある。範囲計算で落ちない。"""
    raw = {
        **STUB_SERIES,
        "hourly": {
            "time": ["2026-07-21T00:00", "2026-07-21T01:00"],
            "temperature_2m": [26.1, None],
            "relative_humidity_2m": [None, None],
        },
    }

    result = format_hourly_series(raw)
    temperature, humidity = result["series"]

    assert temperature["min"] == 26.1
    assert humidity["min"] is None  # 全欠測でも例外にしない
    assert len(humidity["values"]) == 2


def test_format_forecast_falls_back_when_units_missing():
    """current_units が欠けても既定の単位で返す。"""
    raw = {k: v for k, v in STUB_RESPONSE.items() if k != "current_units"}

    result = format_forecast(raw)

    assert result["temperature"] == {"value": 28.4, "unit": "°C"}
    assert result["wind_speed"] == {"value": 12.3, "unit": "km/h"}
