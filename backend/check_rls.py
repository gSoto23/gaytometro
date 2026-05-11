import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

client = create_client(SUPABASE_URL, SUPABASE_KEY)
# Intenta hacer un insert con un usuario anonimo de prueba
resp = client.auth.sign_in_anonymously()
user_id = resp.user.id
print(f"User ID: {user_id}")

photos_resp = client.table('photos').select('id').limit(1).execute()
photo_id = photos_resp.data[0]['id']

try:
    report_resp = client.table('reports').insert({
        'photo_id': photo_id,
        'reporter_id': user_id
    }).execute()
    print("Report OK")
except Exception as e:
    print(f"Report Error: {e}")
