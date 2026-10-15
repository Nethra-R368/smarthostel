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

# Permissive CORS configuration for Render cloud deployments and local development
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
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
        from .database import engine, Base, SessionLocal
        from . import models
        from .seeder import seed_mock_data
        Base.metadata.create_all(bind=engine)
        print("Database tables verified on startup.")
        
        # Check if database has initial users
        db = SessionLocal()
        try:
            if db.query(models.User).count() == 0:
                print("Fresh database detected. Initializing base accounts and hostels...")
                result = seed_mock_data(db)
                print(f"Auto-seed completed: {result.get('message')}")
        finally:
            db.close()
    except Exception as e:
        err_type = type(e).__name__
        print(f"Database connection note during startup: {err_type} occurred. Verification skipped.")

@app.post("/api/common/seed-initial-data")
def trigger_seed():
    from .database import SessionLocal
    from .seeder import seed_mock_data
    db = SessionLocal()
    try:
        return seed_mock_data(db)
    finally:
        db.close()

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
