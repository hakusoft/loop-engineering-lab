"""最小の FastAPI アプリ。ループが一周することの確認が目的。"""

from fastapi import FastAPI

from app.observability import init_sentry
from app.weather import (
    fetch_forecast,
    fetch_hourly_series,
    format_forecast,
    format_hourly_series,
)

init_sentry()

app = FastAPI(title="loop-engineering-lab")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/weather")
def weather() -> dict:
    """現在の天気を返す。"""
    return format_forecast(fetch_forecast())


@app.get("/weather/series")
def weather_series() -> dict:
    """気温と湿度の時系列を返す。

    1 つのチャートに重ねて描ける形。系列ごとに unit と min/max を持つので、
    利用側で軸を分けられる。
    """
    return format_hourly_series(fetch_hourly_series())
