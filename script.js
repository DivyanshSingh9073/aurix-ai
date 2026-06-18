/**
 * Aurix AI — script.js
 * Author : Divyansh Singh
 * -------------------------------------------------------
 * Handles:
 *  - Chat UI (send, render, clear)
 *  - Voice input  (Web Speech API — SpeechRecognition)
 *  - Voice output (Web Speech API — SpeechSynthesis)
 *  - Typing animation
 *  - Chat history (localStorage)
 *  - Sidebar toggle
 *  - Suggestion chips
 * -------------------------------------------------------
 *
 * BACKEND CONFIG:
 *   Change BACKEND_URL to your deployed backend URL.
 *   When running locally, keep it as shown below.
 */

// ─── Configuration ────────────────────────────────────────
// Local development  → "http://localhost:5000"
// Render deployment  → "https://your-app.onrender.com"
const BACKEND_URL = "http://localhost:5000";

// ─── DOM refs ─────────────────────────────────────────────
const chatArea        = document.getElementById("chatArea");
const messagesEl      = document.getElementById("messages");
const userInput       = document.getElementById("userInput");
const sendBtn         = document.getElementById("sendBtn");
const voiceBtn        = document.getElementById("voiceBtn");
const clearBtn        = document.getElementById("clearBtn");
const newChatBtn      = document.getElementById("newChatBtn");
const ttsToggle       = document.getElementById("ttsToggle");
const sidebar         = document.getElementById("sidebar");
const sidebarOverlay  = document.getElementById("sidebarOverlay");
const menuBtn         = document.getElementById("menuBtn");
const sidebarClose    = document.getElementById("sidebarClose");
const welcomeEl       = document.getElementById("welcome");
const chatHistoryList = document.getElementById("chatHistoryList");
const toastEl         = document.getElementById("toast");

// ─── App state ────────────────────────────────────────────
let conversationHistory = [];  // [{role:"user"|"assistant", content:"..."}]
let isLoading           = false;
let ttsEnabled          = false;
let isRecording         = false;
let recognition         = null;  // SpeechRecognition instance
let typingMessageId     = null;  // currently animating message

// ─── LocalStorage helpers ─────────────────────────────────
const LS_KEY = "aurix_chats";      // key for all saved chats
const LS_CURRENT = "aurix_current_chat";  // current session messages

/** Save current session to localStorage. */
function saveSession() {
  const rendered = [];
  document.querySelectorAll(".message").forEach((el) => {
    const role    = el.classList.contains("user") ? "user" : "ai";
    const content = el.querySelector(".bubble")?.innerText || "";
    rendered.push({ role, content });
  });

  const history = loadAllChats();
  if (rendered.length === 0) return;

  const title = rendered[0]?.content?.slice(0, 50) || "Untitled";
  const id    = Date.now().toString();

  // Avoid duplicate saves for same session by checking first message
  const existing = history.find((c) => c.id === window._currentChatId);
  if (existing) {
    existing.messages = rendered;
  } else {
    window._currentChatId = id;
    history.unshift({ id, title, messages: rendered });
    if (history.length > 30) history.pop();  // keep 30 chats max
  }

  localStorage.setItem(LS_KEY, JSON.stringify(history));
  renderSidebar();
}

/** Load all saved chats from localStorage. */
function loadAllChats() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

/** Render sidebar history list. */
function renderSidebar() {
  const chats = loadAllChats();
  chatHistoryList.innerHTML = "";

  if (chats.length === 0) {
    chatHistoryList.innerHTML = `<div style="padding:10px 12px;font-size:0.78rem;color:var(--text-muted)">No history yet.</div>`;
    return;
  }

  chats.forEach((chat) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.textContent = chat.title;
    item.addEventListener("click", () => loadChat(chat));
    chatHistoryList.appendChild(item);
  });
}

/** Restore a saved chat into the UI. */
function loadChat(chat) {
  clearMessages(false);  // clear without deleting from LS
  window._currentChatId = chat.id;
  chat.messages.forEach((m) => {
    appendMessage(m.role === "user" ? "user" : "ai", m.content, false);
  });
  closeSidebar();
  scrollToBottom();
}

// ─── Message rendering ────────────────────────────────────

/**
 * Append a message bubble to the chat.
 * @param {"user"|"ai"} role
 * @param {string}      content
 * @param {boolean}     animate - whether to run typing animation (AI only)
 * @returns {HTMLElement} the bubble element
 */
function appendMessage(role, content, animate = false) {
  hideWelcome();

  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "U" : "⬡";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const inner = document.createElement("div");
  inner.className = "bubble-text";

  if (animate && role === "ai") {
    // Will be filled by typing animation
    bubble.appendChild(inner);
    inner.classList.add("typing-cursor");
  } else {
    inner.innerHTML = formatContent(content);
    bubble.appendChild(inner);
  }

  // Per-message actions (copy, speak)
  if (role === "ai") {
    const actions = document.createElement("div");
    actions.className = "message-actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "msg-action-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(content).then(() => showToast("Copied!"));
    });

    const speakBtn = document.createElement("button");
    speakBtn.className = "msg-action-btn";
    speakBtn.textContent = "Speak";
    speakBtn.addEventListener("click", () => speakText(content));

    actions.appendChild(copyBtn);
    actions.appendChild(speakBtn);
    bubble.appendChild(actions);
  }

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  messagesEl.appendChild(msg);
  scrollToBottom();

  return inner;
}

/** Show typing dots loader. Returns the message div (call removeLoader to remove). */
function showLoader() {
  const msg = document.createElement("div");
  msg.className = "message ai";
  msg.id = "loader-msg";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "⬡";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  messagesEl.appendChild(msg);
  scrollToBottom();
}

function removeLoader() {
  document.getElementById("loader-msg")?.remove();
}

/** Animate AI response text character by character. */
async function animateText(el, text, speed = 12) {
  el.innerHTML = "";
  el.classList.add("typing-cursor");

  const formatted = formatContent(text);
  // Render as plain text with speed, then set final HTML
  // For simplicity + performance, stream chars on plain text then swap to formatted HTML
  let i = 0;
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (i >= text.length) {
        clearInterval(interval);
        el.classList.remove("typing-cursor");
        el.innerHTML = formatted;  // final render with HTML formatting
        resolve();
      } else {
        el.textContent = text.slice(0, i + 1);
        i++;
        scrollToBottom();
      }
    }, speed);
  });
}

/**
 * Format raw text: convert markdown-style ``` code blocks,
 * `inline code`, and **bold** to HTML.
 */
function formatContent(text) {
  if (!text) return "";

  // Escape HTML first (safety)
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Fenced code blocks
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // **bold**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // *italic*
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Line breaks
  html = html.replace(/\n/g, "<br/>");

  return html;
}

function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

function hideWelcome() {
  welcomeEl.style.display = "none";
}

function showWelcome() {
  welcomeEl.style.display = "";
}

function clearMessages(deleteFromLS = true) {
  messagesEl.innerHTML = "";
  conversationHistory = [];
  window._currentChatId = null;
  if (deleteFromLS) renderSidebar();  // refresh sidebar
  showWelcome();
}

// ─── API call ─────────────────────────────────────────────

/**
 * Send a message to the Flask backend and return the AI response.
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
async function fetchAIResponse(userMessage) {
  const response = await fetch(`${BACKEND_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userMessage,
      history: conversationHistory,  // send full session history for memory
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}

// ─── Send message flow ────────────────────────────────────

async function sendMessage(text) {
  text = text?.trim();
  if (!text || isLoading) return;

  isLoading = true;
  sendBtn.disabled = true;
  userInput.value = "";
  autoResizeInput();

  // Render user bubble
  appendMessage("user", text);

  // Add to conversation memory
  conversationHistory.push({ role: "user", content: text });

  // Show loader
  showLoader();

  try {
    const reply = await fetchAIResponse(text);

    removeLoader();

    // Render AI bubble with typing animation
    const bubbleInner = appendMessage("ai", reply, true);
    await animateText(bubbleInner, reply);

    // Add AI response to memory
    conversationHistory.push({ role: "assistant", content: reply });

    // Speak if TTS enabled
    if (ttsEnabled) speakText(reply);

    // Save session to localStorage
    saveSession();

  } catch (err) {
    removeLoader();
    const errMsg = `⚠️ ${err.message || "Could not reach the backend. Make sure it is running."}`;
    const bubbleInner = appendMessage("ai", errMsg, false);
    bubbleInner.innerHTML = formatContent(errMsg);
    bubbleInner.closest(".bubble").classList.add("error-bubble");
  }

  isLoading = false;
  sendBtn.disabled = false;
  userInput.focus();
}

// ─── Input auto-resize ────────────────────────────────────

function autoResizeInput() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
}

userInput.addEventListener("input", autoResizeInput);

// Send on Enter (Shift+Enter = newline)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(userInput.value);
  }
});

sendBtn.addEventListener("click", () => sendMessage(userInput.value));

// ─── Voice Input (Speech Recognition) ────────────────────

// Check browser support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  voiceBtn.title = "Voice input not supported in this browser";
  voiceBtn.style.opacity = "0.4";
  voiceBtn.style.cursor  = "not-allowed";
} else {
  recognition = new SpeechRecognition();
  recognition.continuous    = false;    // single utterance
  recognition.interimResults = true;    // show partial results
  recognition.lang = "en-US";

  recognition.onstart = () => {
    isRecording = true;
    voiceBtn.classList.add("recording");
    voiceBtn.title = "Listening… tap to stop";
    showToast("🎙 Listening…");
  };

  recognition.onresult = (event) => {
    let interim = "";
    let final   = "";
    for (const result of event.results) {
      if (result.isFinal) final  += result[0].transcript;
      else                interim += result[0].transcript;
    }
    userInput.value = final || interim;
    autoResizeInput();
  };

  recognition.onend = () => {
    isRecording = false;
    voiceBtn.classList.remove("recording");
    voiceBtn.title = "Voice input";
    // Auto-send if we got text
    if (userInput.value.trim()) sendMessage(userInput.value);
  };

  recognition.onerror = (e) => {
    isRecording = false;
    voiceBtn.classList.remove("recording");
    showToast("Mic error: " + (e.error || "unknown"));
  };
}

voiceBtn.addEventListener("click", () => {
  if (!recognition) return;
  if (isRecording) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (e) {
      showToast("Could not start mic. Check browser permissions.");
    }
  }
});

// ─── Text-to-Speech ───────────────────────────────────────

/**
 * Speak text using the browser's SpeechSynthesis.
 * @param {string} text
 */
function speakText(text) {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip HTML tags for speech
  const clean = text.replace(/<[^>]+>/g, "");

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate   = 1.0;
  utterance.pitch  = 1.0;
  utterance.volume = 1.0;

  // Prefer a natural-sounding English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith("en") && v.localService
  ) || voices[0];
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

// TTS toggle button
ttsToggle.addEventListener("click", () => {
  ttsEnabled = !ttsEnabled;
  ttsToggle.classList.toggle("active", ttsEnabled);
  showToast(ttsEnabled ? "Voice output ON" : "Voice output OFF");
  if (!ttsEnabled) window.speechSynthesis?.cancel();
});

// ─── Clear chat ───────────────────────────────────────────

clearBtn.addEventListener("click", () => {
  if (
    messagesEl.children.length === 0 ||
    confirm("Clear this conversation?")
  ) {
    clearMessages(true);
    conversationHistory = [];
  }
});

// ─── New chat ─────────────────────────────────────────────

newChatBtn.addEventListener("click", () => {
  saveSession();     // save current before starting new
  clearMessages(false);
  conversationHistory = [];
  window._currentChatId = null;
  closeSidebar();
  userInput.focus();
});

// ─── Sidebar ──────────────────────────────────────────────

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("visible");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
}

menuBtn.addEventListener("click", openSidebar);
sidebarClose.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

// ─── Suggestion chips ─────────────────────────────────────

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const prompt = chip.getAttribute("data-prompt");
    if (prompt) sendMessage(prompt);
  });
});

// ─── Toast helper ─────────────────────────────────────────

let toastTimer = null;
function showToast(msg, duration = 2200) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), duration);
}

// ─── Init ─────────────────────────────────────────────────

function init() {
  renderSidebar();
  userInput.focus();

  // Ensure voices are loaded (async on some browsers)
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", () => {});
  }

  // Check if backend is reachable (optional ping)
  fetch(`${BACKEND_URL}/health`)
    .then((r) => r.ok && console.log("✅ Aurix backend connected"))
    .catch(() => console.warn("⚠️ Backend not reachable. Run app.py first."));
}

init();
