import uvicorn
import sys
import os

# Ensure the root directory is in sys.path so backend.main can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    from backend.main import app
    uvicorn.run(app, host="0.0.0.0", port=8000)
