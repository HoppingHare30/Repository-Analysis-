from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Repo Explorer API")

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/graph")
async def get_graph():
    return {"status": "ok"}

@app.get("/api/summary")
async def get_summary():
    return {"status": "ok"}

@app.get("/api/metrics")
async def get_metrics():
    return {"status": "ok"}
