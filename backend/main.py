from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import Client
import os
from dependencies import get_supabase_client

app = FastAPI(title="Gaytometro API")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Gaytometro API is running"}

class VoteCreate(BaseModel):
    photo_id: str
    is_super_gay: bool

class PhotoCreate(BaseModel):
    url: str

class ReportCreate(BaseModel):
    photo_id: str

@app.get("/api/photos/next")
def get_next_photos(client: Client = Depends(get_supabase_client)):
    try:
        response = client.rpc("get_unvoted_photos").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/photos/me")
def get_my_photos(client: Client = Depends(get_supabase_client)):
    try:
        # Recuperamos el usuario activo desde el token enviado
        user_response = client.auth.get_user(getattr(client, "auth_token"))
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        response = client.table("photos").select("*").eq("user_id", user_response.user.id).order('created_at', desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/photos")
def upload_photo(photo: PhotoCreate, client: Client = Depends(get_supabase_client)):
    try:
        user_response = client.auth.get_user(getattr(client, "auth_token"))
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        response = client.table("photos").insert({
            "url": photo.url,
            "user_id": user_response.user.id
        }).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/votes")
def cast_vote(vote: VoteCreate, client: Client = Depends(get_supabase_client)):
    try:
        user_response = client.auth.get_user(getattr(client, "auth_token"))
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        response = client.table("votes").insert({
            "photo_id": vote.photo_id,
            "user_id": user_response.user.id,
            "is_super_gay": vote.is_super_gay
        }).execute()
        return {"status": "success", "vote": response.data}
    except Exception as e:
        error_msg = str(e).lower()
        if "unique_violation" in error_msg or "duplicate key" in error_msg:
            raise HTTPException(status_code=400, detail="Already voted on this photo")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reports")
def report_photo(report: ReportCreate, client: Client = Depends(get_supabase_client)):
    try:
        user_response = client.auth.get_user(getattr(client, "auth_token"))
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        response = client.table("reports").insert({
            "photo_id": report.photo_id,
            "reporter_id": user_response.user.id
        }).execute()
        return {"status": "success", "report": response.data}
    except Exception as e:
        error_msg = str(e).lower()
        if "unique_violation" in error_msg or "duplicate key" in error_msg:
            raise HTTPException(status_code=400, detail="Already reported this photo")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/photos/{photo_id}")
def delete_photo(photo_id: str, client: Client = Depends(get_supabase_client)):
    try:
        user_response = client.auth.get_user(getattr(client, "auth_token"))
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Check ownership explicitly
        photo = client.table("photos").select("user_id").eq("id", photo_id).execute()
        if not photo.data or str(photo.data[0]["user_id"]) != str(user_response.user.id):
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this photo")

        # Manually cascade deletes to avoid foreign key constraint errors
        client.table("votes").delete().eq("photo_id", photo_id).execute()
        client.table("reports").delete().eq("photo_id", photo_id).execute()
        
        # Delete the photo
        response = client.table("photos").delete().eq("id", photo_id).execute()
        return {"status": "success", "message": "Photo deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
