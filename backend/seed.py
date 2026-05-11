import os
import asyncio
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

def get_loremflickr_photos(count=30):
    print("Buscando fotos en loremflickr...")
    urls = []
    headers = {"User-Agent": "Mozilla/5.0"}
    for i in range(1, count + 1):
        # Usar loremflickr para obtener fotos aleatorias de retratos latinos
        url = f"https://loremflickr.com/1080/1080/latino,portrait?random={i}"
        try:
            # Hacemos la petición para obtener la URL final redireccionada (para que sea persistente)
            resp = requests.head(url, headers=headers, allow_redirects=True)
            final_url = resp.url
            urls.append(final_url)
            print(f"Obtenida URL {i}: {final_url}")
        except Exception as e:
            print(f"Error obteniendo {url}: {e}")
            
    return urls

async def seed_photos():
    client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("Iniciando sesión anónima en Supabase...")
    auth_response = client.auth.sign_in_anonymously()
    
    user_id = auth_response.user.id
    print(f"Logueado como: {user_id}")
    
    urls = get_loremflickr_photos(30)
    
    print(f"Encontradas {len(urls)} URLs. Insertando en la base de datos...")
    
    inserted = 0
    for url in urls:
        try:
            client.table("photos").insert({
                "user_id": user_id,
                "url": url,
                "super_gay_votes": 0,
                "no_gay_votes": 0
            }).execute()
            inserted += 1
            print(f"Insertada [{inserted}/30]: {url[:60]}...")
        except Exception as e:
            print(f"Error insertando {url[:50]}: {e}")
            
    print(f"Proceso completado. Se insertaron {inserted} fotos correctamente.")

if __name__ == "__main__":
    asyncio.run(seed_photos())
