import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers import projects, qa, submissions, templates

logger = logging.getLogger("cybermanaiger")

app = FastAPI(title="CyberManAIger API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(templates.router)
app.include_router(submissions.router)
app.include_router(qa.router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Without this, an unhandled exception skips CORSMiddleware on the way out,
    # so the browser sees a response with no CORS headers and reports it as a
    # generic "Failed to fetch" instead of the real error.
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.get("/health")
def health():
    return {"status": "ok"}
