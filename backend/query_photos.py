import os
from supabase import create_client

supabase = create_client(
    "https://uirmcrtzfgmguutcrmpv.supabase.co",
    "sb_publishable_Pcptwu5kv5EON0P112oh9Q_o3sAqoSr" # Using the public anon key for a simple read
)

response = supabase.table("photos").select("id, url").execute()
for photo in response.data:
    print(photo['url'])
