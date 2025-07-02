export const chatWithAi = async (prompt) => {
  // console.log(prompt);
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "", // Optional. Site URL for rankings on openrouter.ai.
          "X-Title": "Chat Ai bot", // Optional. Site title for rankings on openrouter.ai.
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response is not ok.");
    }
    const data = await response.json();
    return data.choices[0].message.content || "I couldn't understand that.";
  } catch (error) {
    console.error(error);
    return "Error talking to AI.";
  }
};
