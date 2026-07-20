"""最小の FastAPI アプリ。ループが一周することの確認が目的。"""

from fastapi import FastAPI

from app.weather import fetch_forecast, format_forecast

app = FastAPI(title="loop-engineering-lab")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/weather")
def weather() -> dict:
    """現在の天気を返す。"""
    return format_forecast(fetch_forecast())
