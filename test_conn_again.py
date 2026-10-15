import psycopg2

try:
    conn = psycopg2.connect(
        host='localhost',
        user='postgres',
        password='A9Ni2WB',
        dbname='postgres'
    )
    conn.close()
    print("SUCCESS")
except Exception as e:
    print("FAILED:", e)
