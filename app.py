"""
Aurix AI — app.py
Author : Divyansh Singh
-------------------------------------------------
Flask backend that wraps the Anthropic Claude API
(or OpenAI — see comments below to switch).

Endpoints:
  POST /ask      → receive user message + history, return AI reply
  GET  /health   → simple uptime check

Setup:
  1. pip install -r requirements.txt
  2. Set ANTHROPIC_API_KEY (or OPENAI_API_KEY) in a .env file
  3. python app.py
-------------------------------------------------
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# ── Load .env (never commit your API keys!) ──────────────────
load_dotenv()

app = Flask(__name__)

# ── CORS ─────────────────────────────────────────────────────
# Allow requests from any origin so the frontend (GitHub Pages /
# local file / localhost) can reach this backend.
# In production you can restrict to your domain:
#   CORS(app, origins=["https://yourusername.github.io"])
CORS(app)

# ── Which AI provider to use ─────────────────────────────────
# Options: "anthropic" or "openai"
AI_PROVIDER = os.getenv("AI_PROVIDER", "anthropic").lower()

# ── Anthropic setup ──────────────────────────────────────────
if AI_PROVIDER == "anthropic":
    import anthropic
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    MODEL  = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")

# ── OpenAI setup (alternative) ───────────────────────────────
elif AI_PROVIDER == "openai":
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    MODEL  = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

else:
    raise ValueError(f"Unknown AI_PROVIDER: {AI_PROVIDER}")

# ── System prompt ─────────────────────────────────────────────
# Customise Aurix's personality here.
SYSTEM_PROMPT = """You are Aurix, a smart, concise, and friendly AI assistant built by Divyansh Singh.

Guidelines:
- Keep answers clear and to the point.
- Use markdown formatting for code (triple backticks with language tag).
- Use **bold** to highlight key terms.
- Be honest when you don't know something.
- Do NOT start every message with "Certainly!" or similar filler.
- If asked who you are, say you are Aurix AI, built by Divyansh Singh.
"""

# ── Maximum tokens per response ───────────────────────────────
MAX_TOKENS = int(os.getenv("MAX_TOKENS", 1024))

# ─────────────────────────────────────────────────────────────
# Route: POST /ask
# Body : { "message": "...", "history": [{role, content}, ...] }
# Returns: { "reply": "..." }
# ─────────────────────────────────────────────────────────────
@app.route("/ask", methods=["POST"])
def ask():
    """Receive a user message and return an AI response."""
    data = request.get_json(silent=True)

    if not data or "message" not in data:
        return jsonify({"error": "Request body must include 'message'."}), 400

    user_message = str(data["message"]).strip()
    if not user_message:
        return jsonify({"error": "Message cannot be empty."}), 400

    # Build conversation history for context (memory)
    # history is a list of {role: "user"|"assistant", content: "..."}
    history = data.get("history", [])

    # Sanitise history: keep only user / assistant roles, string content
    clean_history = []
    for turn in history:
        role    = turn.get("role", "")
        content = str(turn.get("content", "")).strip()
        if role in ("user", "assistant") and content:
            clean_history.append({"role": role, "content": content})

    # Append the latest user message
    clean_history.append({"role": "user", "content": user_message})

    # ── Call AI ──────────────────────────────────────────────
    try:
        reply = call_ai(clean_history)
    except Exception as e:
        # Return a friendly error rather than a raw 500
        print(f"[Aurix AI Error] {e}")
        return jsonify({"error": f"AI error: {str(e)}"}), 500

    return jsonify({"reply": reply})


def call_ai(messages: list) -> str:
    """Call the configured AI provider and return the response string."""

    if AI_PROVIDER == "anthropic":
        # Anthropic Claude
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        # The response content is a list of blocks; extract text
        return response.content[0].text

    elif AI_PROVIDER == "openai":
        # OpenAI ChatCompletion
        full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            messages=full_messages,
        )
        return response.choices[0].message.content

    return "No AI provider configured."


# ─────────────────────────────────────────────────────────────
# Route: GET /health
# Simple liveness check used by the frontend ping.
# ─────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    """Return a simple status response."""
    return jsonify({"status": "ok", "provider": AI_PROVIDER, "model": MODEL})


# ─────────────────────────────────────────────────────────────
# Run locally
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    print(f"🚀 Aurix AI backend starting on http://localhost:{port}")
    print(f"   Provider : {AI_PROVIDER}")
    print(f"   Model    : {MODEL}")
    app.run(host="0.0.0.0", port=port, debug=debug)
