export async function askAurixBrain(message) {
  const API_KEY = "AQ.Ab8RN6L-CKooJjOCOfufTJgbBscOKqzzV098hlCxBrfIMLzb-Q"; // aistudio.google.com → Get API Key (free)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: message }]
          }],
          systemInstruction: {
            parts: [{ text: "You are Aurix, a helpful and friendly AI voice assistant. Keep responses concise and conversational." }]
          }
        })
      }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error(error);
    return "Sorry, I couldn't connect to my brain right now. Please try again.";
  }
}
