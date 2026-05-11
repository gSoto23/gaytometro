import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

client = create_client(SUPABASE_URL, SUPABASE_KEY)
auth_response = client.auth.sign_in_anonymously()
print(auth_response.user.is_anonymous)
