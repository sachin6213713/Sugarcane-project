import os
from google import genai
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

def test_final():
    api_key = os.getenv("GEMINI_API_KEY")
    # Explicitly use the Generative AI (Google AI Studio) client
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})
    
    models_to_try = ["gemini-1.5-flash", "models/gemini-1.5-flash", "gemini-1.5-flash-latest"]
    
    for m in models_to_try:
        try:
            print(f"Trying {m}...")
            response = client.models.generate_content(model=m, contents="Hi")
            print(f"SUCCESS with {m}: {response.text}")
            return
        except Exception as e:
            print(f"FAILED with {m}: {e}")

if __name__ == "__main__":
    test_final()
