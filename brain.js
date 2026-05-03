export async function askAurixBrain(message) {

  const msg = message.toLowerCase();

  if (msg.includes("who built you")) {
    return "I was built by Divyansh Singh.";
  }

  if (msg.includes("hello")) {
    return "Hello, I am Aurix. How can I help you?";
  }

  if (msg.includes("time")) {
    return "Please check your device time.";
  }

  return "I heard you clearly.";
}
