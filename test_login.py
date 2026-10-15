import urllib.request
import json
import sys

data = json.dumps({"username": "admin", "password": "admin123"}).encode('utf-8')
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/auth/login",
    data=data,
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        res_data = json.loads(response.read().decode('utf-8'))
        print("Response:", res_data)
except Exception as e:
    print("FAILED to login:", e)
    if hasattr(e, 'read'):
        try:
            print("Server error output:", e.read().decode('utf-8'))
        except:
            pass
    sys.exit(1)
