const button = document.getElementById("activateBtn");
const status = document.getElementById("status");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = false;

button.onclick = () => {
  status.innerText = "Listening...";
  recognition.start();
};

recognition.onresult = (event) => {
  const userSpeech = event.results[0][0].transcript;
  status.innerText = "You said: " + userSpeech;

  aurixReply(userSpeech);
};

function aurixReply(message) {
  let reply = "I am not trained for that yet.";

  if (message.toLowerCase().includes("hello")) {
    reply = "Hello. I am Aurix.";
  } 
  else if (message.toLowerCase().includes("time")) {
    reply = "The current time is " + new Date().toLocaleTimeString();
  }
  else if (message.toLowerCase().includes("your name")) {
    reply = "My name is Aurix. Intelligent Voice Agent.";
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