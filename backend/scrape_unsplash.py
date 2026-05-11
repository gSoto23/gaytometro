import requests
import re
import json

url = "https://unsplash.com/napi/search/photos?query=latino%20portrait&per_page=30"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
data = resp.json()

urls = []
for result in data['results']:
    urls.append(result['urls']['regular'])

print(urls)
