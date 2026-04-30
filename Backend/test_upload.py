import urllib.request
import urllib.parse
import json

url = 'http://127.0.0.1:8000/api/upload/'

data = json.dumps({
    "name": "Anush"
}).encode('utf-8')

req = urllib.request.Request(url, data=data, method='POST')
req.add_header('Content-Type', 'application/json')
req.add_header('Origin', 'http://localhost:5173')

try:
    resp = urllib.request.urlopen(req)
    print("SUCCESS:", resp.status)
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print("BODY:", e.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", e)
