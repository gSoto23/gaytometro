import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

client = create_client(SUPABASE_URL, SUPABASE_KEY)
try:
    resp = client.table('reports').select('*').limit(1).execute()
    print("Select ok")
except Exception as e:
    print(e)
