# ⬡ Aurix AI

**A modern, voice-enabled AI assistant that runs in your mobile browser.**

Built by **Divyansh Singh** · MIT License

![Aurix AI](https://img.shields.io/badge/Aurix_AI-v1.0.0-00d4ff?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Features

| Feature | Details |
|---|---|
| 💬 Chat interface | ChatGPT-style bubbles, typing animation, code formatting |
| 🎙 Voice input | Web Speech API — speak your question |
| 🔊 Voice output | Text-to-speech for every AI reply |
| 🧠 Memory | Conversation history sent on every request |
| 📱 Mobile-first | Fully responsive, safe-area support, Android tested |
| 🌙 Dark theme | Deep-space design with cyan-violet accent |
| 💾 Chat history | Auto-saved to localStorage, restorable from sidebar |
| ⚡ Fast | Lightweight frontend — no React, no build step |

---

## 📁 Project Structure

```
Aurix-AI/
│
├── frontend/
│   ├── index.html        ← Main UI
│   ├── style.css         ← Dark futuristic styles
│   └── script.js         ← Chat logic, voice, TTS, storage
│
├── backend/
│   ├── app.py            ← Flask REST API
│   ├── requirements.txt  ← Python dependencies
│   └── .env.example      ← Environment variable template
│
├── README.md
├── LICENSE               ← MIT
└── .gitignore
```

---

## 🚀 Quick Start (Local)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/Aurix-AI.git
cd Aurix-AI
```

### 2. Set up the backend

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy the env template and add your API key
cp .env.example .env
# Open .env and set ANTHROPIC_API_KEY (or OPENAI_API_KEY)

# Run the server
python app.py
# → http://localhost:5000
```

### 3. Open the frontend

Simply open `frontend/index.html` in your browser — no build step needed.

```bash
# Option A: Double-click index.html in your file explorer

# Option B: Use a local server (avoids some browser restrictions)
cd frontend
python -m http.server 8080
# → http://localhost:8080
```

> **Important:** Make sure the `BACKEND_URL` in `script.js` is set to `http://localhost:5000` for local development.

---

## 🔑 Getting an API Key

### Anthropic (Claude) — Recommended

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account → API Keys → Create Key
3. Paste the key into `backend/.env` as `ANTHROPIC_API_KEY`

### OpenAI (alternative)

1. Go to [platform.openai.com](https://platform.openai.com)
2. API Keys → Create new secret key
3. In `backend/.env`, set:
   ```
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_key_here
   ```

---

## 🌐 Deployment

### Frontend → GitHub Pages

1. Push your repo to GitHub
2. Go to **Settings → Pages**
3. Source: `main` branch → `/frontend` folder
4. Your site will be live at `https://YOUR_USERNAME.github.io/Aurix-AI/`
5. Update `BACKEND_URL` in `script.js` to your Render URL (see below)

### Backend → Render (free tier)

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Environment:** Python 3
5. Add environment variables in the Render dashboard:
   - `ANTHROPIC_API_KEY` = your key
   - `AI_PROVIDER` = `anthropic`
6. Deploy — Render gives you a URL like `https://aurix-ai.onrender.com`
7. Update `BACKEND_URL` in `frontend/script.js` to that URL

> **Note:** Render free tier spins down after 15 min of inactivity. First request after sleep may take ~30s.

---

## 🎙 Voice Features

### Voice Input
- Click the **microphone button** in the input bar
- Speak your question — it transcribes in real time
- Auto-sends when you stop speaking
- Requires microphone permission in the browser

### Voice Output
- Click the **🔊 button** (bottom-right) to toggle voice output on/off
- When on, every AI response is spoken aloud
- Click **"Speak"** on any individual message to replay it

> Voice features use the **Web Speech API** — available in Chrome, Edge, and Safari. Firefox has limited support.

---

## 🛠 Configuration

Edit `backend/.env` to customise:

| Variable | Default | Description |
|---|---|---|
| `AI_PROVIDER` | `anthropic` | `anthropic` or `openai` |
| `ANTHROPIC_MODEL` | `claude-3-5-haiku-20241022` | Claude model to use |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |
| `MAX_TOKENS` | `1024` | Max tokens per response |
| `PORT` | `5000` | Backend port |
| `FLASK_DEBUG` | `false` | Set `true` for dev |

Edit `frontend/script.js` line 1 to change `BACKEND_URL`.

---

## 🔒 Security Notes

- **Never commit `.env`** — it is in `.gitignore`
- The backend sanitises message history before sending to the AI
- CORS is open by default; restrict it to your domain in production:
  ```python
  # In app.py
  CORS(app, origins=["https://yourusername.github.io"])
  ```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE) © 2025 Divyansh Singh

---

*Built with ❤ and curiosity by Divyansh Singh*
