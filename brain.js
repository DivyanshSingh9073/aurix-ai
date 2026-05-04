export async function askAurixBrain(message) {

  const API_KEY = "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";

  try {

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",

        messages: [
          {
            role: "system",
            content: "You are Aurix, a smart voice assistant built by Divyansh Singh. Reply in short friendly sentences."
          },

          {
            role: "user",
            content: message
          }
        ]
      })

    });

    const data = await response.json();

    return data.choices[0].message.content;

  } catch (error) {
    console.error(error);
    return "I am having trouble connecting to my brain.";
  }
}
