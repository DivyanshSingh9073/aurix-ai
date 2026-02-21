import { askAurixBrain } from "./brain.js";
const CREATOR_NAME = "Divyansh Singh";
const AURIX_IDENTITY = {
  name: "Aurix",
  role: "Intelligent Voice Agent",
  purpose: "Assist users with information and simple tasks through voice interaction"
};
const button = document.getElementById("activateBtn");
const status = document.getElementById("status");
let isListening = false;
let audioUnlocked = false;
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = false;

button.onclick = () => {

  // 🔓 Unlock audio on first user click (MOBILE FIX)
  if (!audioUnlocked) {
    const unlock = new SpeechSynthesisUtterance(" ");
    window.speechSynthesis.speak(unlock);
    audioUnlocked = true;
  }

  if (isListening) {
    status.innerText = "Already listening...";
    return;
  }

  status.innerText = "Listening... Speak now.";
  recognition.start();
  isListening = true;
};

recognition.onresult = (event) => {
  const userSpeech = event.results[0][0].transcript;
  status.innerText = "You said: " + userSpeech;

  aurixReply(userSpeech);
}; 
recognition.onend = () => {
  isListening = false;
  // ❌ DO NOT change status here
};
recognition.onerror = (event) => {
  isListening = false;
  status.innerText = "Error: " + event.error;
};
async function aurixReply(message) {
  status.innerText = "Aurix is thinking...";

  const reply = await askAurixBrain(message);

  setTimeout(() => {
    speak(reply);
    status.innerText = "Idle. Click Activate Aurix.";
  }, 300);
}
function speak(text) {
  if (!text) return;

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;

  // 🔑 Mobile + Chrome fix
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}
