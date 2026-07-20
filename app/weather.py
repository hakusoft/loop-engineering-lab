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
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
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

    return {
        "observed_at": current["time"],
        "temperature": {
            "value": current["temperature_2m"],
            "unit": units.get("temperature_2m", "°C"),
        },
        "humidity": {
            "value": current["relative_humidity_2m"],
            "unit": units.get("relative_humidity_2m", "%"),
        },
        "wind_speed": {
            "value": current["wind_speed_10m"],
            "unit": units.get("wind_speed_10m", "km/h"),
        },
        "coordinates": {
            "latitude": raw["latitude"],
            "longitude": raw["longitude"],
        },
    }
