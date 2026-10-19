import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from exceptions import ApiError
from routes.classes import router as classes_router
from routes.parents import router as parents_router
from routes.registrations import router as registrations_router


def run_migrations() -> None:
    from alembic import command
    from alembic.config import Config

    cfg = Config("alembic.ini")
    cfg.set_main_option(
        "sqlalchemy.url",
        os.environ.get("DATABASE_URL", "postgresql://atlas:atlas@localhost:5432/atlas_academy"),
    )
    command.upgrade(cfg, "head")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    run_migrations()
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ApiError)
async def api_error_handler(_request: Request, exc: ApiError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})


app.include_router(classes_router)
app.include_router(parents_router)
app.include_router(registrations_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 4000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
