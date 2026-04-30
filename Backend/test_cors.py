import urllib.request
req = urllib.request.Request('http://127.0.0.1:8000/api/upload/', method='POST')
req.add_header('Origin', 'http://localhost:5173')
try:
    resp = urllib.request.urlopen(req)
    print("SUCCESS")
except Exception as e:
    print("ERROR")
    if hasattr(e, 'headers'):
        print("HEADERS:")
        print(e.headers)
