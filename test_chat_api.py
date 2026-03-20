import requests
import json

def test_chat_api():
    url = "http://localhost:8000/chats"
    payload = {
        "user_id": "24683eef-61a1-473f-a799-aa5960c048c9",
        "role": "user",
        "message": "Hi, what's a good snack for skin health?"
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 201:
            print("Response Data:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_chat_api()
