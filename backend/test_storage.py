import os
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

client = create_client(SUPABASE_URL, SUPABASE_KEY)
resp = client.auth.sign_in_anonymously()

# Download a tiny dummy image to test upload
dummy_img = requests.get("https://loremflickr.com/100/100").content

try:
    res = client.storage.from_('photos').upload("test_upload.jpg", dummy_img, {"content-type": "image/jpeg"})
    print("Upload Result:", res)
    public_url = client.storage.from_('photos').get_public_url("test_upload.jpg")
    print("Public URL:", public_url)
except Exception as e:
    print("Upload failed:", e)

