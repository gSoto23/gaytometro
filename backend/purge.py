import os
from supabase import create_client

supabase = create_client(
    "https://uirmcrtzfgmguutcrmpv.supabase.co",
    "sb_publishable_Pcptwu5kv5EON0P112oh9Q_o3sAqoSr" # Using the public anon key to delete from public tables (Rls allows this? Wait, if RLS is enabled, we need the service role key)
)

response = supabase.table("photos").select("id, url").execute()
deleted_count = 0
for photo in response.data:
    if "loremflickr" in photo['url'] or "unsplash" in photo['url']:
        # If RLS allows anonymous deletes, this works. Otherwise we need the service role key.
        res = supabase.table("photos").delete().eq("id", photo["id"]).execute()
        print(f"Deleted {photo['url']}")
        deleted_count += 1
print(f"Total deleted: {deleted_count}")
