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
  let reply = "";

  const msg = message.toLowerCase(); // normalize input

  if (msg.includes("hello") || msg.includes("hi")) {
    reply = "Hello. I am Aurix.";
  }

  else if (msg.includes("who are you") || msg.includes("what are you")) {
    reply = `I am ${AURIX_IDENTITY.name}, an ${AURIX_IDENTITY.role}. My purpose is to ${AURIX_IDENTITY.purpose}.`;
  }

  else if (msg.includes("your name")) {
    reply = "My name is Aurix. Intelligent Voice Agent.";
  }

  else if (msg.includes("time")) {
    reply = "The current time is " + new Date().toLocaleTimeString();
  }

  else if (
    msg.includes("who made you") ||
    msg.includes("who created you") ||
    msg.includes("who built you")
  ) {
    reply = `I was designed and built by ${CREATOR_NAME}.`;
  }

  else {
    reply = "I am not trained for that yet, but I am learning.";
  }

  speak(reply);
}

function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;
  window.speechSynthesis.speak(speech);
}
