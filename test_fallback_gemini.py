import os
from google import genai
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

def test_fallback():
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    
    try:
        response = client.models.generate_content(model="gemini-1.0-pro", contents="Hi")
        print(f"SUCCESS with gemini-1.0-pro: {response.text}")
    except Exception as e:
        print(f"FAILED with gemini-1.0-pro: {e}")

if __name__ == "__main__":
    test_fallback()
