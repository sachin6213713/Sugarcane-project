# Sugarcane Project 🎋

A full-stack AI-powered skin & food assistant app. The project consists of a **FastAPI** backend and an **Expo (React Native)** frontend.

## 📁 Project Structure

```text
Sugarcane/
├── backend/            # FastAPI Backend
│   ├── .venv/          # Python Virtual Environment
│   ├── main.py         # API Endpoints & Logic
│   ├── models.py       # Pydantic Data Models
│   ├── database.py     # Supabase Connection
│   └── .env            # Backend Environment Variables
├── frontend/           # Expo Frontend
│   ├── app/            # Expo Router Pages
│   ├── utils/          # API & Helper functions
│   └── .env.local      # Frontend Environment Variables
└── .gitignore          # Root Git Ignore
```

---

## 🚀 Getting Started

### 1. Prerequisites
*   [Python 3.10+](https://www.python.org/downloads/)
*   [Node.js & npm](https://nodejs.org/)
*   [Expo Go](https://expo.dev/go) app on your mobile device.

---

### 2. Backend Setup (FastAPI)

1.  **Navigate to backend folder:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    ..\backend\.venv\Scripts\pip install -r requirements.txt
    ```
3.  **Configure `.env`:**
    Create a `.env` file in the `backend/` directory with the following:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    GOOGLE_API_KEY=your_gemini_api_key
    SENTRY_DSN=your_sentry_dsn
    NGROK_AUTHTOKEN=your_ngrok_token
    USE_NGROK=false
    ```
4.  **Run the Server (from project root):**
    ```bash
    .\backend\.venv\Scripts\python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
    ```

---

### 3. Frontend Setup (Expo)

1.  **Navigate to frontend folder:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure `.env.local`:**
    Create a `.env.local` file in the `frontend/` directory:
    ```env
    EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```
4.  **Run the App:**
    ```bash
    npm run android  # or npm run ios / npm start
    ```

---

## 🛠 Features

### 📡 Public Tunneling (Ngrok)
If you are testing on a physical device and don't want to use local IP addresses, you can enable Ngrok:
1.  Set `USE_NGROK=true` in `backend/.env`.
2.  Provide your `NGROK_AUTHTOKEN`.
3.  The backend will print a public URL on startup. 
4.  Update `EXPO_PUBLIC_API_URL` in `frontend/.env.local` with that URL.

### 🛡 Monitoring (Sentry)
The backend is integrated with Sentry. 
*   Provide your `SENTRY_DSN` in the backend `.env`.
*   Any crashes or performance issues will be logged automatically.

### 🤖 AI Assistant
Powered by **Google Gemini AI** for skin and food analysis.

---

## 📦 Deployment
The backend is designed to be easily deployable to platforms like Render, Railway, or AWS. Ensure you set the environment variables in your production environment.

## 🤝 Contributing
Feel free to open issues or submit pull requests!

## 📄 License
MIT
