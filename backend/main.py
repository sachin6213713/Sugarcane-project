from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import sentry_sdk

import os
import sys
from pyngrok import ngrok
from google import genai
from .database import supabase
from .models import UserCreate, UserResponse, UserUpdate, ChatCreate, ChatResponse

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize Sentry
sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        traces_sample_rate=1.0, # Adjust in production
        profiles_sample_rate=1.0,
    )

# Initialize Ngrok if enabled
use_ngrok = os.getenv("USE_NGROK", "false").lower() == "true"
ngrok_token = os.getenv("NGROK_AUTHTOKEN")

if use_ngrok and ngrok_token:
    try:
        ngrok.set_auth_token(ngrok_token)
        # Open a HTTP tunnel on port 8000
        public_url = ngrok.connect(8000).public_url
        print(f"\n🚀 Ngrok tunnel established at: {public_url}")
        print("💡 Update EXPO_PUBLIC_API_URL in frontend/.env.local with this URL.\n")
    except Exception as e:
        print(f"⚠️ Failed to start Ngrok: {e}")

# Configure Gemini Client
# The SDK automatically uses GOOGLE_API_KEY from environment if not passed
# But we'll pass it explicitly to be sure
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None
    print("WARNING: GOOGLE_API_KEY not found in environment")

app = FastAPI(
    title="Sugarcane API",
    description="FastAPI backend for the Sugarcane AI skin & food assistant app, backed by Supabase.",
    version="1.0.0",
)

# Allow requests from the Expo dev server and any local origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health ──────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health_check():
    """Returns OK if the server is running."""
    return {"status": "ok"}


# ─── Users ───────────────────────────────────────────────────────────────────

@app.get("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def get_user(user_id: str):
    """Fetch a user profile by ID."""
    result = supabase.table("users").select("*").eq("id", user_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found.")

    return result.data


@app.patch("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def update_user(user_id: str, payload: UserUpdate):
    """Update a user's profile."""
    # Build dictionary of only provided fields
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    result = supabase.table("users").update(update_data).eq("id", user_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found or update failed.")

    return result.data[0]


@app.get("/users", response_model=List[UserResponse], tags=["Users"])
def list_users():
    """List all users."""
    result = supabase.table("users").select("*").order("created_at", desc=True).execute()
    return result.data or []


# ─── Chats ───────────────────────────────────────────────────────────────────

@app.post("/chats", response_model=ChatResponse, status_code=201, tags=["Chats"])
def create_chat_message(payload: ChatCreate):
    """Save user message and optionally generate/save Gemini AI response."""
    # 1. Save the incoming message (User or Assistant)
    result = supabase.table("chats").insert({
        "user_id": str(payload.user_id),
        "role": payload.role,
        "message": payload.message,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to save chat message.")
    
    saved_msg = result.data[0]

    # 2. If it's a user message, trigger Gemini AI
    if payload.role == "user" and client:
        try:
            # System instruction for short and crisp answers
            prompt = (
                f"You are a helpful digital Food & Skin Assistant. "
                f"Answer the following user question in a short, crisp, and helpful manner. "
                f"Question: {payload.message}"
            )
            
            response = client.models.generate_content(
                model="gemini-3-flash-preview", 
                contents=prompt
            )
            ai_text = response.text.strip() if response.text else "I'm sorry, I couldn't generate an answer."

            # 3. Save Gemini's response to the database
            ai_result = supabase.table("chats").insert({
                "user_id": str(payload.user_id),
                "role": "assistant",
                "message": ai_text,
            }).execute()

            if ai_result.data:
                # Return the AI response to the frontend so it can display it immediately
                return ai_result.data[0]
            
        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Fallback or error return
            raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    return saved_msg


@app.get("/chats/{user_id}", response_model=List[ChatResponse], tags=["Chats"])
def get_chat_history(user_id: str):
    """Fetch all chat messages for a given user, oldest first."""
    result = (
        supabase.table("chats")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data or []


@app.delete("/chats/{user_id}", tags=["Chats"])
def clear_chat_history(user_id: str):
    """Delete all chat messages for a given user."""
    supabase.table("chats").delete().eq("user_id", user_id).execute()
    return {"message": f"Chat history for user {user_id} cleared."}
