from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.api import (
    auth_router,
    student_router,
    warden_router,
    accountant_router,
    admin_router,
    common_router
)

app = FastAPI(
    title="SmartHostel API",
    description="Backend API for SmartHostel Management System - 5th Sem DBMS Project",
    version="1.0.0"
)

import os

allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allowed_origins_env == "*" else origins,
    allow_origin_regex=r"https://.*(\.azurestaticapps\.net|\.vercel\.app|\.onrender\.com)" if not allowed_origins_env else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router, prefix="/api")
app.include_router(student_router, prefix="/api")
app.include_router(warden_router, prefix="/api")
app.include_router(accountant_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(common_router, prefix="/api")

@app.on_event("startup")
def on_startup():
    try:
        from .database import engine, Base
        from . import models
        Base.metadata.create_all(bind=engine)
        print("Database tables verified on startup.")
    except Exception as e:
        err_type = type(e).__name__
        print(f"Database connection note during startup: {err_type} occurred. Verification skipped.")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": "SmartHostel",
        "description": "DBMS Stored Procedures & Triggers backed API Layer"
    }
