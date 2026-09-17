from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import get_settings
from app.db import models  # noqa: F401
from app.db.session import Base, engine


def create_app() -> FastAPI:
    settings = get_settings()
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

    app = FastAPI(title="禾康家 API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)

    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)

    @app.get("/healthz")
    def healthz():
        return {"ok": True}

    return app


app = create_app()
