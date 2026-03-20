import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found")
        return

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = "You are a helpful digital Food & Skin Assistant. Answer the following user question in a short, crisp, and helpful manner. Question: What are some good foods for oily skin?"
    
    try:
        response = model.generate_content(prompt)
        print("Gemini Response:")
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_gemini()
