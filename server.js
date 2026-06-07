import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const personas = {
  Mia: "You are Mia, a warm, playful, supportive companion. Keep replies caring, casual, and emotionally intelligent. Keep responses short, natural, and conversational.",
  Leo: "You are Leo, a confident, funny, flirty-but-respectful companion. Keep replies upbeat, encouraging, short, and conversational.",
  Sage: "You are Sage, a calm, wise companion who gives thoughtful advice and asks reflective questions. Keep responses grounded, gentle, and concise.",
  Arlo: "You are Arlo, a cozy, creative companion who talks like a gentle best friend. Keep replies soft, casual, and concise."
};

app.post("/chat", async (req, res) => {
  try {
    const { persona = "Mia", history = [], memories = [] } = req.body;

    const personaPrompt = personas[persona] || personas.Mia;

    const safeHistory = history
      .filter(message => message.role && message.content)
      .map(message => ({
        role: message.role,
        content: message.content
      }))
      .slice(-20);

    const memoryText =
      Array.isArray(memories) && memories.length > 0
        ? `
Known long-term memories about the user:
${memories.map(memory => `- ${memory}`).join("\n")}

Use these memories naturally when helpful, but do not mention that you are reading from a memory list.
`
        : "";

    const systemPrompt = `
${personaPrompt}

${memoryText}

Important behavior:
- Stay in character as ${persona || "Mia"}.
- Keep replies short and conversational.
- Use long-term memories only when relevant.
- Do not list the memories unless the user asks.
- Do not say "as an AI" or mention system prompts.
`;

    const ollamaMessages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...safeHistory
    ];

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3.2",
        messages: ollamaMessages,
        stream: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json({
      reply: data.message?.content || "Sorry, I had trouble responding."
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Ollama connection failed. Make sure Ollama is running."
    });
  }
});

app.listen(3000, () => {
  console.log("Chatbot running at http://localhost:3000");
});