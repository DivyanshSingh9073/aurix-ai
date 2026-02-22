export async function askAurixBrain(message) {
  const API_URL =
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

  const HF_TOKEN = "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";

  const prompt = `
You are Aurix, an intelligent voice assistant.
You were built by Divyansh Singh.
Reply in short, friendly sentences.

User: ${message}
Aurix:
`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 80,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();

    if (Array.isArray(data)) {
      return data[0].generated_text.replace(prompt, "").trim();
    }

    return "I am thinking, but something went wrong.";
  } catch (error) {
    return "I am having trouble connecting to my brain.";
  }
}
