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

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = false;

button.onclick = () => {
  // If already listening, do nothing
  if (isListening) {
    status.innerText = "Already listening...";
    return;
  }

  // Start listening
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
  status.innerText = "Idle. Click Activate Aurix.";
};
recognition.onerror = (event) => {
  isListening = false;
  status.innerText = "Error: " + event.error;
};
async function aurixReply(message) {
  status.innerText = "Aurix is thinking...";

  const reply = await askAurixBrain(message);

  speak(reply);
}
