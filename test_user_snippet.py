import os
from google import genai
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend directory
env_path = Path(__file__).parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

def test_user_snippet():
    # Use the key from .env as GOOGLE_API_KEY
    api_key = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)

    try:
        # Using the EXACT model name they provided in their prompt
        response = client.models.generate_content(
            model="gemini-3-flash-preview", 
            contents="Explain how AI works in a few words"
        )
        print("SUCCESS with gemini-3-flash-preview!")
        print(response.text)
    except Exception as e:
        print(f"FAILED with gemini-3-flash-preview: {e}")

if __name__ == "__main__":
    test_user_snippet()
