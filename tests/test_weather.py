"""format_forecast のテスト。ネットワークには触らない。

スタブは Open-Meteo が実際に返す形をそのまま写したもの。
"""

from app.weather import format_forecast

STUB_RESPONSE = {
    "latitude": 35.68,
    "longitude": 139.76,
    "current_units": {
        "time": "iso8601",
        "temperature_2m": "°C",
        "relative_humidity_2m": "%",
        "wind_speed_10m": "km/h",
    },
    "current": {
        "time": "2026-07-21T09:00",
        "temperature_2m": 28.4,
        "relative_humidity_2m": 71,
        "wind_speed_10m": 12.3,
    },
}


def test_format_forecast_maps_values_and_units():
    result = format_forecast(STUB_RESPONSE)

    assert result["observed_at"] == "2026-07-21T09:00"
    assert result["temperature"] == {"value": 28.4, "unit": "°C"}
    assert result["humidity"] == {"value": 71, "unit": "%"}
    assert result["wind_speed"] == {"value": 12.3, "unit": "km/h"}
    assert result["coordinates"] == {"latitude": 35.68, "longitude": 139.76}


def test_format_forecast_falls_back_when_units_missing():
    """current_units が欠けても既定の単位で返す。"""
    raw = {k: v for k, v in STUB_RESPONSE.items() if k != "current_units"}

    result = format_forecast(raw)

    assert result["temperature"] == {"value": 28.4, "unit": "°C"}
    assert result["wind_speed"] == {"value": 12.3, "unit": "km/h"}
