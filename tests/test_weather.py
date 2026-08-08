"""format_forecast のテスト。ネットワークには触らない。

スタブは Open-Meteo が実際に返す形をそのまま写したもの。
"""

import json
from pathlib import Path

from app.weather import (
    CURRENT_FIELDS,
    DAILY_FIELDS,
    HOURLY_FIELDS,
    _compass_direction,
    _daylight_duration_hours,
    _round_coordinate,
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
        "snowfall": "cm",
        "surface_pressure": "hPa",
        "pressure_msl": "hPa",
        "cloud_cover": "%",
        "visibility": "m",
        "dew_point_2m": "°C",
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
        "snowfall": 0.0,
        "surface_pressure": 1008.2,
        "pressure_msl": 1012.6,
        "cloud_cover": 40,
        "weather_code": 1,
        "is_day": 1,
        "visibility": 24140.0,
        "dew_point_2m": 22.6,
        "shortwave_radiation": 412.0,
        "snow_depth": 0.0,
        "uv_index": 5.2,
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
        "apparent_temperature_max": "°C",
        "apparent_temperature_min": "°C",
        "wind_gusts_10m_max": "km/h",
        "relative_humidity_2m_max": "%",
        "relative_humidity_2m_min": "%",
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
    assert result["humidity"] == {"value": 71, "unit": "%"}
    assert result["wind_speed"] == {"value": 12.3, "unit": "km/h"}
    assert result["wind_direction"] == {"value": 250, "unit": "°", "compass": "西南西"}
    assert result["wind_gusts"] == {"value": 24.8, "unit": "km/h"}
    assert result["precipitation"] == {"value": 0.0, "unit": "mm"}
    assert result["rain"] == {"value": 0.0, "unit": "mm"}
    assert result["snowfall"] == {"value": 0.0, "unit": "cm"}
    assert result["pressure"] == {"value": 1008.2, "unit": "hPa"}
    assert result["sea_level_pressure"] == {"value": 1012.6, "unit": "hPa"}
    assert result["cloud_cover"] == {"value": 40, "unit": "%"}
    assert result["visibility"] == {"value": 24140.0, "unit": "m"}
    assert result["solar_radiation"] == {"value": 412.0, "unit": "W/m²"}
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
        "apparent_temperature": "°C",
        "relative_humidity_2m": "%",
        "rain": "mm",
        "snowfall": "cm",
        "precipitation_probability": "%",
        "uv_index": "",
    },
    "hourly": {
        "time": ["2026-07-21T00:00", "2026-07-21T01:00", "2026-07-21T02:00"],
        "temperature_2m": [26.1, 25.4, 24.9],
        "apparent_temperature": [27.3, 26.5, 25.8],
        "relative_humidity_2m": [78, 81, 85],
        "rain": [0.0, 0.5, 1.2],
        "snowfall": [0.0, 0.0, 0.0],
        "precipitation_probability": [10, 30, 60],
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
    temperature, apparent_temperature, humidity, rain, snow, precipitation_probability, uv_index = result[
        "series"
    ]

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
    assert uv_index["label"] == "紫外線指数"
    assert uv_index["unit"] == ""


def test_series_exposes_min_max_for_axis_scaling():
    """軸を分けて描けるよう、系列ごとに範囲を持つ。"""
    result = format_hourly_series(STUB_SERIES)
    temperature, apparent_temperature, humidity, rain, snow, precipitation_probability, uv_index = result[
        "series"
    ]

    assert (temperature["min"], temperature["max"]) == (24.9, 26.1)
    assert (apparent_temperature["min"], apparent_temperature["max"]) == (25.8, 27.3)
    assert (humidity["min"], humidity["max"]) == (78, 85)
    assert (rain["min"], rain["max"]) == (0.0, 1.2)
    assert (snow["min"], snow["max"]) == (0.0, 0.0)
    assert (precipitation_probability["min"], precipitation_probability["max"]) == (10, 60)
    assert (uv_index["min"], uv_index["max"]) == (0.2, 3.1)


def test_series_tolerates_missing_values():
    """Open-Meteo は欠測を null で返すことがある。範囲計算で落ちない。

    降水確率は過去分（past_days）で null になることがある。
    """
    raw = {
        **STUB_SERIES,
        "hourly": {
            "time": ["2026-07-21T00:00", "2026-07-21T01:00"],
            "temperature_2m": [26.1, None],
            "apparent_temperature": [None, None],
            "relative_humidity_2m": [None, None],
            "rain": [0.0, None],
            "snowfall": [None, None],
            "precipitation_probability": [None, None],
            "uv_index": [None, None],
        },
    }

    result = format_hourly_series(raw)
    temperature, apparent_temperature, humidity, rain, snow, precipitation_probability, uv_index = result[
        "series"
    ]

    assert temperature["min"] == 26.1
    assert apparent_temperature["min"] is None  # 全欠測でも例外にしない
    assert humidity["min"] is None  # 全欠測でも例外にしない
    assert len(humidity["values"]) == 2
    assert rain["min"] == 0.0
    assert snow["min"] is None
    assert precipitation_probability["min"] is None
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
    assert result["sunshine_duration"] == {"value": 36420.0, "unit": "s"}
    assert result["precipitation_hours"] == {"value": 3.0, "unit": "h"}
    assert result["precipitation_sum"] == {"value": 12.5, "unit": "mm"}
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


def test_daylight_duration_hours_computes_difference_in_hours():
    assert _daylight_duration_hours("2026-07-21T04:44", "2026-07-21T18:47") == 14.05


def test_format_forecast_includes_daylight_duration():
    result = format_forecast(STUB_RESPONSE)

    assert result["daylight_duration"] == {"value": 14.05, "unit": "h"}


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


def test_format_forecast_works_against_real_api_shape():
    """実 API の応答の形で format_forecast が通ること。

    手書きのスタブは、実装がキー名を間違えるとスタブも同じ間違いになり、
    テストが緑のまま通ってしまう。#164 は snow_depth を要求しながら
    snow_depth_cm を読み、スタブも snow_depth_cm だったため CI をすり抜け、
    本番で KeyError になった。記録した実応答なら同じ誤りを共有できない。
    """
    result = format_forecast(_load_fixture("forecast.json"))

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
    """実 API の応答の形で format_hourly_series が通ること。"""
    result = format_hourly_series(_load_fixture("hourly_series.json"))

    assert [s["label"] for s in result["series"]] == [
        "気温",
        "体感温度",
        "湿度",
        "雨量",
        "降雪量",
        "降水確率",
        "紫外線指数",
    ]


def test_fixture_current_matches_requested_current_fields():
    """記録した実応答の current が、要求している項目と一致すること。

    ずれていたら、要求から漏れた項目を読んでいるか、逆に要求したまま
    使っていない項目があるということ。フィクスチャが古い可能性もある。
    """
    fixture_keys = set(_load_fixture("forecast.json")["current"]) - {"time", "interval"}

    assert fixture_keys == set(CURRENT_FIELDS)


def test_fixture_hourly_matches_requested_hourly_fields():
    """記録した実応答の hourly が、要求している項目と一致すること。"""
    fixture_keys = set(_load_fixture("hourly_series.json")["hourly"]) - {"time"}

    assert fixture_keys == set(HOURLY_FIELDS)


def test_stub_and_fixture_agree_on_current_keys():
    """手書きのスタブと記録した実応答で、current のキーが一致すること。

    既存のテストは読みやすさのため手書きのスタブを使っている。実応答と
    突き合わせておけば、スタブだけが古くなったり、実装に合わせて誤った
    キーに書き換えられたりしたときに気づける。
    """
    stub_keys = set(STUB_RESPONSE["current"]) - {"time", "interval"}
    fixture_keys = set(_load_fixture("forecast.json")["current"]) - {"time", "interval"}

    assert stub_keys == fixture_keys


def test_hourly_fields_are_all_used_by_format_hourly_series():
    """要求した hourly の項目が、全て系列として使われていること。

    使わない項目を要求し続けても壊れはしないが、要求と実装がずれている
    合図なので気づけるようにする。降水量（precipitation）は雨量（rain）と
    降雪量（snowfall）に分けて出しているため、系列としては使っていない。
    """
    result = format_hourly_series(_load_fixture("hourly_series.json"))
    used = {
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "rain",
        "snowfall",
        "precipitation_probability",
        "uv_index",
    }

    assert len(result["series"]) == len(used)
    assert set(HOURLY_FIELDS) - used == {"precipitation"}
