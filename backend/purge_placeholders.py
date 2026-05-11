import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

client = create_client(SUPABASE_URL, SUPABASE_KEY)
client.auth.sign_in_anonymously()

# Fetch all photos
response = client.table("photos").select("id, url").execute()
photos = response.data

# Delete loremflickr photos
deleted_count = 0
for p in photos:
    if "loremflickr" in p["url"] or "unsplash" in p["url"]:
        client.table("photos").delete().eq("id", p["id"]).execute()
        deleted_count += 1

print(f"Deleted {deleted_count} seeded photos from the database.")
