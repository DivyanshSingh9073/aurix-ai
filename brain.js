export async function askAurixBrain(message) {

  try {

    const response = await fetch("http://100.107.160.181:5000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: message
      })

    });

    const data = await response.json();

    return data.reply;

  } catch (error) {
    console.error(error);
    return "I am having trouble connecting to my Python brain.";
  }
}
