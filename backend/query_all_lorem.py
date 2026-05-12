import os
from supabase import create_client

supabase = create_client(
    "https://uirmcrtzfgmguutcrmpv.supabase.co",
    "sb_publishable_Pcptwu5kv5EON0P112oh9Q_o3sAqoSr"
)
supabase.auth.sign_in_anonymously()

# Fetch photos using like operator to bypass pagination if possible, or just fetch all
response = supabase.table("photos").select("id, url").like("url", "%lorem%").execute()
print(f"Found loremflickr: {len(response.data)}")

for p in response.data:
    supabase.table("photos").delete().eq("id", p["id"]).execute()

response2 = supabase.table("photos").select("id, url").like("url", "%unsplash%").execute()
print(f"Found unsplash: {len(response2.data)}")
for p in response2.data:
    supabase.table("photos").delete().eq("id", p["id"]).execute()
