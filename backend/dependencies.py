import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

# Intentar usar las variables de entorno, usando las de Next.js como fallback si estamos probando local
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_KEY.")

security = HTTPBearer()

def get_supabase_client(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Client:
    """
    Creates a Supabase client configured with the user's JWT token.
    This ensures RLS policies are applied to all DB queries automatically.
    """
    token = credentials.credentials
    
    try:
        # Crear un cliente con el token en los headers para que PostgREST aplique RLS
        options = ClientOptions(headers={"Authorization": f"Bearer {token}"})
        client: Client = create_client(SUPABASE_URL, SUPABASE_KEY, options=options)
        setattr(client, "auth_token", token)
        return client
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )
