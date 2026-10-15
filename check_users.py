import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))
from app.database import SessionLocal
from app import models

try:
    db = SessionLocal()
    users = db.query(models.User).all()
    print("SUCCESS: Connected to DB!")
    print(f"Total Users in DB: {len(users)}")
    for u in users[:10]:
        print(f"  Username: '{u.username}' | Role: '{u.role}'")
    db.close()
except Exception as e:
    print(f"FAILED to query users: {e}")
