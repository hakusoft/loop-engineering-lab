"""Open-Meteo から天気を取得し、API レスポンスの形に整える。

取得（fetch_forecast）と整形（format_forecast）を分けてある。
整形はネットワークに触らない純関数なので、スタブ入力だけでテストできる。
CI が赤いとき「外部 API が落ちた」ではなく「コードが壊れた」と読めるようにするため。
"""

from typing import Any

import httpx

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# 東京。題材が固定でよい段階なので定数で持つ。
DEFAULT_LATITUDE = 35.68
DEFAULT_LONGITUDE = 139.76

# 度数 → 16 方位。北を境界の中心（348.75°〜11.25°）として 22.5° 刻みで割り当てる。
COMPASS_POINTS = [
    "北", "北北東", "北東", "東北東",
    "東", "東南東", "南東", "南南東",
    "南", "南南西", "南西", "西南西",
    "西", "西北西", "北西", "北北西",
]


def _compass_direction(degrees: float) -> str:
    """度数（0〜360）を 16 方位の方角表記に変換する。"""
    index = int((degrees + 11.25) / 22.5) % len(COMPASS_POINTS)
    return COMPASS_POINTS[index]


# WMO Weather interpretation codes（Open-Meteo の weather_code）→ 日本語表記。
# https://open-meteo.com/en/docs で定義されているコード表に基づく。
WEATHER_CODES = {
    0: "快晴",
    1: "晴れ",
    2: "薄曇り",
    3: "曇り",
    45: "霧",
    48: "霧（着氷性）",
    51: "霧雨（弱い）",
    53: "霧雨",
    55: "霧雨（強い）",
    56: "霧雨（着氷性・弱い）",
    57: "霧雨（着氷性・強い）",
    61: "雨（弱い）",
    63: "雨",
    65: "雨（強い）",
    66: "雨（着氷性・弱い）",
    67: "雨（着氷性・強い）",
    71: "雪（弱い）",
    73: "雪",
    75: "雪（強い）",
    77: "雪（霧状）",
    80: "にわか雨（弱い）",
    81: "にわか雨",
    82: "にわか雨（強い）",
    85: "にわか雪（弱い）",
    86: "にわか雪（強い）",
    95: "雷雨",
    96: "雷雨（ひょうを伴う・弱い）",
    99: "雷雨（ひょうを伴う・強い）",
}


def _weather_description(code: int) -> str:
    """WMO Weather code を日本語の天気表記に変換する。未知のコードは不明として返す。"""
    return WEATHER_CODES.get(code, "不明")


def fetch_forecast(
    latitude: float = DEFAULT_LATITUDE,
    longitude: float = DEFAULT_LONGITUDE,
    timeout: float = 10.0,
) -> dict[str, Any]:
    """Open-Meteo を叩いて生の JSON を返す。ここだけがネットワークに触る。"""
    response = httpx.get(
        OPEN_METEO_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,
            "current": (
                "temperature_2m,relative_humidity_2m,wind_speed_10m,"
                "wind_direction_10m,apparent_temperature,"
                "precipitation,surface_pressure,cloud_cover,weather_code"
            ),
            "daily": "uv_index_max,sunrise,sunset",
            "timezone": "Asia/Tokyo",
            "forecast_days": 1,
        },
        timeout=timeout,
    )
    response.raise_for_status()
    return response.json()


def fetch_hourly_series(
    latitude: float = DEFAULT_LATITUDE,
    longitude: float = DEFAULT_LONGITUDE,
    past_days: int = 1,
    timeout: float = 10.0,
) -> dict[str, Any]:
    """気温と湿度の時系列を取得する。ここだけがネットワークに触る。"""
    response = httpx.get(
        OPEN_METEO_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,
            "hourly": "temperature_2m,relative_humidity_2m",
            "past_days": past_days,
            "forecast_days": 1,
        },
        timeout=timeout,
    )
    response.raise_for_status()
    return response.json()


def format_forecast(raw: dict[str, Any]) -> dict[str, Any]:
    """Open-Meteo の生 JSON を、API が返す形に整える。

    生の JSON は値と単位が current / current_units に分かれているので、
    利用側が扱いやすいよう 1 つの辞書にまとめ直す。
    """
    current = raw["current"]
    units = raw.get("current_units", {})
    daily = raw["daily"]
    daily_units = raw.get("daily_units", {})

    return {
        "observed_at": current["time"],
        "temperature": {
            "value": current["temperature_2m"],
            "unit": units.get("temperature_2m", "°C"),
        },
        "apparent_temperature": {
            "value": current["apparent_temperature"],
            "unit": units.get("apparent_temperature", "°C"),
        },
        "humidity": {
            "value": current["relative_humidity_2m"],
            "unit": units.get("relative_humidity_2m", "%"),
        },
        "wind_speed": {
            "value": current["wind_speed_10m"],
            "unit": units.get("wind_speed_10m", "km/h"),
        },
        "wind_direction": {
            "value": current["wind_direction_10m"],
            "unit": units.get("wind_direction_10m", "°"),
            "compass": _compass_direction(current["wind_direction_10m"]),
        },
        "precipitation": {
            "value": current["precipitation"],
            "unit": units.get("precipitation", "mm"),
        },
        "pressure": {
            "value": current["surface_pressure"],
            "unit": units.get("surface_pressure", "hPa"),
        },
        "cloud_cover": {
            "value": current["cloud_cover"],
            "unit": units.get("cloud_cover", "%"),
        },
        "uv_index_max": {
            "value": daily["uv_index_max"][0],
            "unit": daily_units.get("uv_index_max", ""),
        },
        "sunrise": daily["sunrise"][0],
        "sunset": daily["sunset"][0],
        "condition": {
            "code": current["weather_code"],
            "description": _weather_description(current["weather_code"]),
        },
        "coordinates": {
            "latitude": raw["latitude"],
            "longitude": raw["longitude"],
        },
    }


def format_hourly_series(raw: dict[str, Any]) -> dict[str, Any]:
    """時系列の生 JSON を、1 つのチャートに重ねられる形に整える。

    気温(°C)と湿度(%)は単位もスケールも違うので、同じ軸には載せられない。
    系列ごとに unit と min/max を持たせ、利用側が軸を分けて描けるようにする。
    時刻は共通の 1 本（timestamps）にまとめ、系列側は値の配列だけを持つ。
    """
    hourly = raw["hourly"]
    units = raw.get("hourly_units", {})
    timestamps = hourly["time"]

    def _series(key: str, label: str, default_unit: str) -> dict[str, Any]:
        values = hourly[key]
        present = [v for v in values if v is not None]
        return {
            "label": label,
            "unit": units.get(key, default_unit),
            "values": values,
            "min": min(present) if present else None,
            "max": max(present) if present else None,
        }

    return {
        "timestamps": timestamps,
        "series": [
            _series("temperature_2m", "気温", "°C"),
            _series("relative_humidity_2m", "湿度", "%"),
        ],
        "coordinates": {
            "latitude": raw["latitude"],
            "longitude": raw["longitude"],
        },
    }
