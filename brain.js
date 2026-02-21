// This is Aurix's brain (API-like logic)

export async function askAurixBrain(message) {
  // Fake thinking delay (like real AI)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const msg = message.toLowerCase();

  if (msg.includes("time")) {
    return "The current time is " + new Date().toLocaleTimeString();
  }

  if (msg.includes("who built you") || msg.includes("creator")) {
    return "I was created by Divyansh Singh.";
  }

  if (msg.includes("college")) {
    return "College is the best time to build skills. Stay consistent.";
  }

  return "I am still learning. Ask me something else.";
}
