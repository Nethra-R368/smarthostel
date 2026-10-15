import sys
import os

# Add backend directory to system path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from dotenv import load_dotenv
load_dotenv()

print("ENV DATABASE_URL:", repr(os.environ.get("DATABASE_URL")))

from app.database import engine, DATABASE_URL
print("ENGINE URL:", repr(engine.url))
print("APP DATABASE_URL:", repr(DATABASE_URL))

try:
    print("Attempting connection to engine...")
    conn = engine.connect()
    print("SUCCESS: Engine connected!")
    conn.close()
except Exception as e:
    print("FAILED engine connection:", e)
