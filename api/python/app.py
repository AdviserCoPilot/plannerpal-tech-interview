import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.classes import router as classes_router
from routes.parents import router as parents_router
from routes.registrations import router as registrations_router

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(classes_router)
app.include_router(parents_router)
app.include_router(registrations_router)

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 4000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
