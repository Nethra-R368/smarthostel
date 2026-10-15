import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def check_db(url, label):
    print(f"\n==========================================")
    print(f"=== CHECKING {label} ===")
    print(f"==========================================")
    try:
        conn = psycopg2.connect(url, connect_timeout=5)
        cur = conn.cursor()
        
        # 1. Tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = [r[0] for r in cur.fetchall()]
        print(f"\n[1] Tables Count: {len(tables)}")
        for idx, t in enumerate(tables, 1):
            print(f"  {idx}. {t}")
        
        # 2. Triggers
        cur.execute("""
            SELECT event_object_table, trigger_name, event_manipulation, action_timing
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name;
        """)
        triggers = cur.fetchall()
        print(f"\n[2] Triggers Count: {len(triggers)}")
        for t in triggers:
            print(f"  - On table '{t[0]}': {t[1]} ({t[3]} {t[2]})")
            
        # 3. Procedures & Functions
        cur.execute("""
            SELECT routine_name, routine_type
            FROM information_schema.routines
            WHERE routine_schema = 'public'
            ORDER BY routine_type, routine_name;
        """)
        routines = cur.fetchall()
        print(f"\n[3] Stored Procedures & Functions Count: {len(routines)}")
        for r in routines:
            print(f"  - {r[1]}: {r[0]}")
            
        # 4. Total row count across all tables
        total_rows = 0
        table_counts = {}
        for tbl in tables:
            cur.execute(f'SELECT COUNT(*) FROM "{tbl}"')
            cnt = cur.fetchone()[0]
            table_counts[tbl] = cnt
            total_rows += cnt
        print(f"\n[4] Total Rows across all tables: {total_rows}")
        print("Breakdown per table:")
        for tbl, cnt in table_counts.items():
            print(f"  - {tbl}: {cnt} rows")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Connection/Query error for {label}: {e}")

if __name__ == "__main__":
    local_url = os.getenv("DATABASE_URL")
    check_db(local_url, "LOCAL POSTGRESQL (localhost:5432/smarthostel)")

    azure_url = os.getenv("AZURE_DATABASE_URL", "postgresql://dbadmin:<your_password>@dbhostel.postgres.database.azure.com:5432/smarthostel?sslmode=require")
    if "<your_password>" not in azure_url:
        check_db(azure_url, "AZURE POSTGRESQL (dbhostel.postgres.database.azure.com)")
    else:
        print("\n[INFO] AZURE_DATABASE_URL not configured. Skipping Azure check.")
