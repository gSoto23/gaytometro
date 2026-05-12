import os
from supabase import create_client

supabase = create_client(
    "https://uirmcrtzfgmguutcrmpv.supabase.co",
    "sb_publishable_Pcptwu5kv5EON0P112oh9Q_o3sAqoSr"
)

response = supabase.table("photos").select("id, url").eq("url", "https://loremflickr.com/cache/resized/65535_51786368038_0a8003b187_h_1080_1080_nofilter.jpg").execute()
print(f"Found: {len(response.data)}")
for p in response.data:
    print(p)
