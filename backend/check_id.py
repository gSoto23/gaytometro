import os
from supabase import create_client

supabase = create_client(
    "https://uirmcrtzfgmguutcrmpv.supabase.co",
    "sb_publishable_Pcptwu5kv5EON0P112oh9Q_o3sAqoSr"
)

response = supabase.table("photos").select("id").eq("id", "4a435676-5ed6-4ea1-8d7d-996ea8f6ca04").execute()
print("Found photo:", response.data)
