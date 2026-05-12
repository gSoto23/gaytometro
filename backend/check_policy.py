import os
from supabase import create_client

supabase = create_client(
    "https://uirmcrtzfgmguutcrmpv.supabase.co",
    "sb_publishable_Pcptwu5kv5EON0P112oh9Q_o3sAqoSr"
)

# Test if anon key can read this specific row
response = supabase.table("photos").select("id, is_active").eq("id", "4a435676-5ed6-4ea1-8d7d-996ea8f6ca04").execute()
print("Anon can read photo?", len(response.data) > 0, response.data)
