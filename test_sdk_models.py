import os
from google import genai
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend directory
env_path = Path(__file__).parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

def test_model():
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    
    # Try gemini-1.5-flash specifically
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash", 
            contents="Say hello!"
        )
        print(f"Success with gemini-1.5-flash: {response.text}")
    except Exception as e:
        print(f"Failed with gemini-1.5-flash: {e}")

    # Try gemini-2.0-flash
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents="Say hello!"
        )
        print(f"Success with gemini-2.0-flash: {response.text}")
    except Exception as e:
        print(f"Failed with gemini-2.0-flash: {e}")

if __name__ == "__main__":
    test_model()
