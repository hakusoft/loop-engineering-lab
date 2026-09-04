"""Open-Meteo から天気を取得し、API レスポンスの形に整える。

取得（fetch_forecast）と整形（format_forecast）を分けてある。
整形はネットワークに触らない純関数なので、スタブ入力だけでテストできる。
CI が赤いとき「外部 API が落ちた」ではなく「コードが壊れた」と読めるようにするため。
"""

from datetime import datetime
from typing import Any

import httpx

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# 東京。題材が固定でよい段階なので定数で持つ。
DEFAULT_LATITUDE = 35.68
DEFAULT_LONGITUDE = 139.76
DEFAULT_LOCATION_NAME = "東京"

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


COORDINATE_PRECISION = 2


def _round_coordinate(value: float) -> float:
    """緯度・経度を小数第2位に丸める。Open-Meteo はグリッドに合わせた長い小数を返すことがある。"""
    return round(value, COORDINATE_PRECISION)


PRESSURE_PRECISION = 1


def _round_pressure(value: float | None) -> float | None:
    """気圧を小数第1位に丸める。他の項目と桁数が揃うようにする。

    欠測（None）はそのまま返す。丸め処理を挟む前は current の値をそのまま
    返しており None でも問題なかったため、丸め処理側で欠測を吸収する。
    """
    return value if value is None else round(value, PRESSURE_PRECISION)


WIND_SPEED_PRECISION = 1


def _round_wind_speed(value: float | None) -> float | None:
    """風速を小数第1位に丸める。気圧と同じく、細かすぎる小数で返ってくることがある。

    欠測（None）はそのまま返す（_round_pressure と同じ方針）。
    """
    return value if value is None else round(value, WIND_SPEED_PRECISION)


HUMIDITY_PRECISION = 1


def _round_humidity(value: float | None) -> float | None:
    """湿度を小数第1位に丸める。他の項目と同じく、桁数が値によってばらつくことがある。

    欠測（None）はそのまま返す（_round_pressure / _round_wind_speed と同じ方針）。
    """
    return value if value is None else round(value, HUMIDITY_PRECISION)


def _daylight_duration_hours(sunrise: str, sunset: str) -> float:
    """sunrise / sunset（ISO8601）から可照時間を時間単位で計算する。"""
    return (datetime.fromisoformat(sunset) - datetime.fromisoformat(sunrise)).total_seconds() / 3600


def _seconds_to_hours(seconds: float | None) -> float | None:
    """秒を時間に変換する。Open-Meteo が値なしで null を返すことがあるため None を素通しする。"""
    return seconds / 3600 if seconds is not None else None


# Open-Meteo に要求する項目。1 項目 1 行で書く。
#
# 以前はカンマ区切りの文字列を暗黙の連結で組み立てていたが、項目を足す変更が
# 必ず同じ行の末尾を編集することになり、項目追加の PR 同士が毎回競合していた。
# さらに競合を「両方残す」で解決しようとすると、連結して
# "...shortwave_radiationvisibility,..." のような 1 つの項目名になってしまう。
# 構文エラーにならず既存のスタブでもテストが通るため、実際に API を叩くまで
# 気づけない。1 項目 1 行なら追加は行の挿入だけになり、どちらも起きない。
CURRENT_FIELDS = [
    "temperature_2m",
    "relative_humidity_2m",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "apparent_temperature",
    "precipitation",
    "rain",
    "showers",
    "snowfall",
    "surface_pressure",
    "pressure_msl",
    "cloud_cover",
    "cloud_cover_low",
    "cloud_cover_mid",
    "cloud_cover_high",
    "weather_code",
    "is_day",
    "visibility",
    "freezing_level_height",
    "dew_point_2m",
    "soil_temperature_0cm",
    "soil_temperature_6cm",
    "soil_temperature_18cm",
    "soil_moisture_0_to_1cm",
    "soil_moisture_1_to_3cm",
    "shortwave_radiation",
    "direct_radiation",
    "diffuse_radiation",
    "snow_depth",
    "uv_index",
]

DAILY_FIELDS = [
    "uv_index_max",
    "shortwave_radiation_sum",
    "sunrise",
    "sunset",
    "temperature_2m_max",
    "temperature_2m_min",
    "temperature_2m_mean",
    "precipitation_probability_max",
    "sunshine_duration",
    "et0_fao_evapotranspiration",
    "precipitation_hours",
    "precipitation_sum",
    "rain_sum",
    "showers_sum",
    "snowfall_sum",
    "wind_speed_10m_max",
    "wind_direction_10m_dominant",
    "wind_gusts_10m_max",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "apparent_temperature_mean",
    "relative_humidity_2m_max",
    "relative_humidity_2m_min",
]

HOURLY_FIELDS = [
    "weather_code",
    "cape",
    "cloud_cover",
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation",
    "rain",
    "snowfall",
    "precipitation_probability",
    "apparent_temperature",
    "surface_pressure",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_speed_850hPa",
    "wind_speed_80m",
    "uv_index",
    "visibility",
]


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
            "current": ",".join(CURRENT_FIELDS),
            "daily": ",".join(DAILY_FIELDS),
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
            "hourly": ",".join(HOURLY_FIELDS),
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
        "location_name": DEFAULT_LOCATION_NAME,
        "observed_at": current["time"],
        "coordinates": {
            "latitude": _round_coordinate(raw["latitude"]),
            "longitude": _round_coordinate(raw["longitude"]),
        },
        "temperature": {
            "value": current["temperature_2m"],
            "unit": units.get("temperature_2m", "°C"),
        },
        "apparent_temperature": {
            "value": current["apparent_temperature"],
            "unit": units.get("apparent_temperature", "°C"),
        },
        "dew_point": {
            "value": current["dew_point_2m"],
            "unit": units.get("dew_point_2m", "°C"),
        },
        "temperature_max": {
            "value": daily["temperature_2m_max"][0],
            "unit": daily_units.get("temperature_2m_max", "°C"),
        },
        "temperature_min": {
            "value": daily["temperature_2m_min"][0],
            "unit": daily_units.get("temperature_2m_min", "°C"),
        },
        "temperature_mean": {
            "value": daily["temperature_2m_mean"][0],
            "unit": daily_units.get("temperature_2m_mean", "°C"),
        },
        "apparent_temperature_max": {
            "value": daily["apparent_temperature_max"][0],
            "unit": daily_units.get("apparent_temperature_max", "°C"),
        },
        "apparent_temperature_min": {
            "value": daily["apparent_temperature_min"][0],
            "unit": daily_units.get("apparent_temperature_min", "°C"),
        },
        "apparent_temperature_mean": {
            "value": daily["apparent_temperature_mean"][0],
            "unit": daily_units.get("apparent_temperature_mean", "°C"),
        },
        "soil_temperature": {
            "value": current["soil_temperature_0cm"],
            "unit": units.get("soil_temperature_0cm", "°C"),
        },
        "soil_temperature_deep": {
            # soil_temperature_6cm は今回新規に要求した項目で、実 API での
            # 応答確認ができていない（フィクスチャ未更新）。実際にはこのキーで
            # 返らない可能性を排除できないため、他の項目と違い .get() で読み、
            # 無ければ None を返す（#164 / #67-#68 と同型の KeyError を避ける）。
            "value": current.get("soil_temperature_6cm"),
            "unit": units.get("soil_temperature_6cm", "°C"),
        },
        "soil_temperature_deeper": {
            # soil_temperature_18cm も同様に実 API での応答確認ができていないため
            # .get() で読む（soil_temperature_deep と同じ方針）。
            "value": current.get("soil_temperature_18cm"),
            "unit": units.get("soil_temperature_18cm", "°C"),
        },
        "soil_moisture": {
            "value": current["soil_moisture_0_to_1cm"],
            "unit": units.get("soil_moisture_0_to_1cm", "m³/m³"),
        },
        "soil_moisture_deep": {
            # soil_moisture_1_to_3cm は今回新規に要求した項目で、実 API での
            # 応答確認ができていない（フィクスチャ未更新）。実際にはこのキーで
            # 返らない可能性を排除できないため、他の項目と違い .get() で読み、
            # 無ければ None を返す（#164 / #67-#68 と同型の KeyError を避ける）。
            "value": current.get("soil_moisture_1_to_3cm"),
            "unit": units.get("soil_moisture_1_to_3cm", "m³/m³"),
        },
        "humidity": {
            "value": _round_humidity(current["relative_humidity_2m"]),
            "unit": units.get("relative_humidity_2m", "%"),
        },
        "humidity_max": {
            "value": _round_humidity(daily["relative_humidity_2m_max"][0]),
            "unit": daily_units.get("relative_humidity_2m_max", "%"),
        },
        "humidity_min": {
            "value": _round_humidity(daily["relative_humidity_2m_min"][0]),
            "unit": daily_units.get("relative_humidity_2m_min", "%"),
        },
        "wind_speed": {
            "value": _round_wind_speed(current["wind_speed_10m"]),
            "unit": units.get("wind_speed_10m", "km/h"),
        },
        "wind_direction": {
            "value": current["wind_direction_10m"],
            "unit": units.get("wind_direction_10m", "°"),
            "compass": _compass_direction(current["wind_direction_10m"]),
        },
        "wind_gusts": {
            "value": _round_wind_speed(current["wind_gusts_10m"]),
            "unit": units.get("wind_gusts_10m", "km/h"),
        },
        "wind_speed_max": {
            "value": _round_wind_speed(daily["wind_speed_10m_max"][0]),
            "unit": daily_units.get("wind_speed_10m_max", "km/h"),
        },
        "wind_gusts_max": {
            "value": _round_wind_speed(daily["wind_gusts_10m_max"][0]),
            "unit": daily_units.get("wind_gusts_10m_max", "km/h"),
        },
        "wind_direction_dominant": {
            "value": daily["wind_direction_10m_dominant"][0],
            "unit": daily_units.get("wind_direction_10m_dominant", "°"),
            "compass": _compass_direction(daily["wind_direction_10m_dominant"][0]),
        },
        "precipitation": {
            "value": current["precipitation"],
            "unit": units.get("precipitation", "mm"),
        },
        "precipitation_probability": {
            "value": daily["precipitation_probability_max"][0],
            "unit": daily_units.get("precipitation_probability_max", "%"),
        },
        "precipitation_hours": {
            "value": daily["precipitation_hours"][0],
            "unit": daily_units.get("precipitation_hours", "h"),
        },
        "precipitation_sum": {
            "value": daily["precipitation_sum"][0],
            "unit": daily_units.get("precipitation_sum", "mm"),
        },
        "rain_sum": {
            "value": daily["rain_sum"][0],
            "unit": daily_units.get("rain_sum", "mm"),
        },
        "showers_sum": {
            "value": daily["showers_sum"][0],
            "unit": daily_units.get("showers_sum", "mm"),
        },
        "snowfall_sum": {
            "value": daily["snowfall_sum"][0],
            "unit": daily_units.get("snowfall_sum", "cm"),
        },
        "rain": {
            "value": current["rain"],
            "unit": units.get("rain", "mm"),
        },
        "showers": {
            "value": current["showers"],
            "unit": units.get("showers", "mm"),
        },
        "snowfall": {
            "value": current["snowfall"],
            "unit": units.get("snowfall", "cm"),
        },
        "pressure": {
            "value": _round_pressure(current["surface_pressure"]),
            "unit": units.get("surface_pressure", "hPa"),
        },
        "sea_level_pressure": {
            "value": _round_pressure(current["pressure_msl"]),
            "unit": units.get("pressure_msl", "hPa"),
        },
        "cloud_cover": {
            "value": current["cloud_cover"],
            "unit": units.get("cloud_cover", "%"),
        },
        "cloud_cover_low": {
            "value": current["cloud_cover_low"],
            "unit": units.get("cloud_cover_low", "%"),
        },
        "cloud_cover_mid": {
            "value": current["cloud_cover_mid"],
            "unit": units.get("cloud_cover_mid", "%"),
        },
        "cloud_cover_high": {
            "value": current["cloud_cover_high"],
            "unit": units.get("cloud_cover_high", "%"),
        },
        "visibility": {
            "value": current["visibility"],
            "unit": units.get("visibility", "m"),
        },
        "freezing_level_height": {
            "value": current["freezing_level_height"],
            "unit": units.get("freezing_level_height", "m"),
        },
        "solar_radiation": {
            "value": current["shortwave_radiation"],
            "unit": units.get("shortwave_radiation", "W/m²"),
        },
        "solar_radiation_direct": {
            "value": current["direct_radiation"],
            "unit": units.get("direct_radiation", "W/m²"),
        },
        "solar_radiation_diffuse": {
            "value": current["diffuse_radiation"],
            "unit": units.get("diffuse_radiation", "W/m²"),
        },
        "solar_radiation_sum": {
            "value": daily["shortwave_radiation_sum"][0],
            "unit": daily_units.get("shortwave_radiation_sum", "MJ/m²"),
        },
        "snow_depth": {
            "value": current["snow_depth"],
            "unit": units.get("snow_depth", "m"),
        },
        "uv_index": {
            "value": current["uv_index"],
            "unit": units.get("uv_index", ""),
        },
        "uv_index_max": {
            "value": daily["uv_index_max"][0],
            "unit": daily_units.get("uv_index_max", ""),
        },
        "sunshine_duration": {
            "value": _seconds_to_hours(daily["sunshine_duration"][0]),
            "unit": "h",
        },
        "evapotranspiration": {
            "value": daily["et0_fao_evapotranspiration"][0],
            "unit": daily_units.get("et0_fao_evapotranspiration", "mm"),
        },
        "sunrise": daily["sunrise"][0],
        "sunset": daily["sunset"][0],
        "daylight_duration": {
            "value": _daylight_duration_hours(daily["sunrise"][0], daily["sunset"][0]),
            "unit": "h",
        },
        "is_day": bool(current["is_day"]),
        "condition": {
            "code": current["weather_code"],
            "description": _weather_description(current["weather_code"]),
        },
        "elevation": {
            "value": raw["elevation"],
            "unit": "m",
        },
    }


# 天気コードを、サマリーで使う粗い区分にまとめる。
# 「晴れ時々曇り」程度の粒度なので、コードの細かい差（弱い/強い）は落とす。
def _weather_group(code: int) -> str:
    if code in (0, 1):
        return "晴れ"
    if code in (2, 3):
        return "曇り"
    if code in (45, 48):
        return "霧"
    if code in (71, 73, 75, 77, 85, 86):
        return "雪"
    if code in (95, 96, 99):
        return "雷雨"
    return "雨"


# 時刻を「朝・昼・夕方・夜」に割り当てる。変化を伝えるときの言い回しに使う。
def _time_of_day(hour: int) -> str:
    if 5 <= hour < 11:
        return "朝"
    if 11 <= hour < 16:
        return "昼"
    if 16 <= hour < 19:
        return "夕方"
    return "夜"


def summarize_day(timestamps: list[str], codes: list[int]) -> str:
    """1 日の天気コードの推移を「晴れ時々曇り、夕方から雨」のような一言にする。

    多いものを主、次点を従として「A 時々 B」と並べ、後半で天気が変わるなら
    「〜から C」を足す。時系列の細部ではなく、一日の印象を伝えるのが目的。
    """
    groups = [_weather_group(c) for c in codes]
    if not groups:
        return "天気の情報がありません"

    counts: dict[str, int] = {}
    for g in groups:
        counts[g] = counts.get(g, 0) + 1
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], groups.index(kv[0])))

    main = ranked[0][0]

    # 天気が変わるなら、変わり始めの時間帯を添える。
    # 主たる天気と違う区分が現れ、そこから最後まで続く箇所を探す。
    changed_to = None
    for i in range(1, len(groups)):
        if groups[i] == main:
            continue
        if all(g != main for g in groups[i:]):
            changed_to = (groups[i], _time_of_day(int(timestamps[i][11:13])))
            break

    summary = main
    # 「時々」の相手が変化先と同じだと「晴れ時々雨、夕方から雨」と重複するので、
    # そのときは「時々」を省いて変化の言い回しだけにする。
    sub = ranked[1][0] if len(ranked) > 1 and ranked[1][1] >= max(2, len(groups) // 8) else None
    if sub and (changed_to is None or sub != changed_to[0]):
        summary = f"{main}時々{sub}"
    if changed_to:
        summary += f"、{changed_to[1]}から{changed_to[0]}"

    return summary


# 雷を伴う天気の WMO コード。95=雷雨、96/99=ひょうを伴う雷雨。
THUNDERSTORM_CODES = (95, 96, 99)


def thunderstorm_hours(timestamps: list[str], codes: list[int]) -> list[str]:
    """雷を伴う天気になる時刻を返す。無ければ空リスト。

    夕立が来そうかを知りたいという用途なので、時刻そのものを返して
    利用側で「何時ごろ」と伝えられるようにする。
    """
    return [t for t, c in zip(timestamps, codes) if c in THUNDERSTORM_CODES]


def cape_peak(timestamps: list[str], values: list[float | None]) -> dict[str, Any] | None:
    """CAPE（対流有効位置エネルギー）が最大になる時刻と値を返す。

    雷雨が来る時刻（thunderstorm_hours）に加え、どのくらい強まりそうかの
    目安として使う。値が全て欠測なら None。
    """
    best_index = None
    best_value = None
    for i, v in enumerate(values):
        if v is None:
            continue
        if best_value is None or v > best_value:
            best_value = v
            best_index = i
    if best_index is None:
        return None
    return {"time": timestamps[best_index], "value": best_value}


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

    # 天気コードは数値の大小に意味がなく、他の系列と同じ軸には載せられない。
    # グラフに重ねるのではなく時刻ごとのアイコンとして出すため、series とは別に返す。
    conditions = [
        {"code": code, "description": _weather_description(code)}
        for code in hourly["weather_code"]
    ]

    # サマリーは「今日一日」の話なので、末尾の日付（＝当日）の分だけを見る。
    # timestamps は past_days を含む 48 点あり、全体を平均すると前日が混ざる。
    today = timestamps[-1][:10]
    today_index = [i for i, t in enumerate(timestamps) if t[:10] == today]
    daily_summary = summarize_day(
        [timestamps[i] for i in today_index],
        [hourly["weather_code"][i] for i in today_index],
    )

    thunder_hours = thunderstorm_hours(
        [timestamps[i] for i in today_index],
        [hourly["weather_code"][i] for i in today_index],
    )

    cape_peak_today = cape_peak(
        [timestamps[i] for i in today_index],
        [hourly["cape"][i] for i in today_index],
    )

    return {
        "timestamps": timestamps,
        "conditions": conditions,
        "daily_summary": daily_summary,
        "thunderstorm_hours": thunder_hours,
        "cape_peak": cape_peak_today,
        "series": [
            _series("temperature_2m", "気温", "°C"),
            _series("apparent_temperature", "体感温度", "°C"),
            _series("relative_humidity_2m", "湿度", "%"),
            _series("rain", "雨量", "mm"),
            _series("snowfall", "降雪量", "cm"),
            _series("precipitation_probability", "降水確率", "%"),
            _series("surface_pressure", "気圧", "hPa"),
            _series("cloud_cover", "雲量", "%"),
            _series("wind_speed_10m", "風速", "km/h"),
            _series("wind_direction_10m", "風向き", "°"),
            _series("wind_speed_850hPa", "上空の風速", "km/h"),
            _series("wind_speed_80m", "上空の風速(80m)", "km/h"),
            _series("uv_index", "紫外線指数", ""),
            _series("visibility", "視程", "m"),
        ],
        "coordinates": {
            "latitude": _round_coordinate(raw["latitude"]),
            "longitude": _round_coordinate(raw["longitude"]),
        },
    }
