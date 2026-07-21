"""Lambda のエントリポイント。

Mangum が API Gateway のイベントを ASGI に変換するので、
FastAPI のアプリをそのまま載せられる。ローカルでは uvicorn、
Lambda では Mangum、という違いだけで app 側は共通。
"""

from mangum import Mangum

from app.main import app

handler = Mangum(app, lifespan="off")
