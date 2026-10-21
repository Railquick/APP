from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import trains, catalog, orders, auth

app = FastAPI(
    title="RailQuick Core Backend API",
    description="Real-time in-train essentials delivery system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trains.router)
app.include_router(catalog.router)
app.include_router(orders.router)
app.include_router(auth.router)

@app.get("/")
def health_check():
    return {"status": "online", "service": "RailQuick Engine", "version": "1.0.0"} 