const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("message");
const chips = document.querySelectorAll(".chips button");
const clearButton = document.getElementById("clear");

const personaScreen = document.getElementById("persona-screen");
const chatScreen = document.getElementById("chat-screen");
const personaCards = document.querySelectorAll(".persona-card");
const backButton = document.getElementById("back");
const chatTitle = document.getElementById("chat-title");

const profileDescription = document.getElementById("profile-description");
const profileStats = document.getElementById("profile-stats");

let selectedPersona = "Mia";
let history = [];

const personas = {
  Mia: {
    emoji: "🌸",
    className: "mia",
    description: "Mia is warm, playful, and emotionally supportive.",
    replies: {
      default: [
        "Aww, I’m here with you. Tell me more.",
        "That sounds like a lot. Want to talk through it together?",
        "I’m proud of you for opening up."
      ],
      sad: [
        "I’m sorry you’re feeling this way. You don’t have to hold it all alone.",
        "That sounds really heavy. I’m here with you.",
        "Come here emotionally for a second. Let’s breathe through this together."
      ],
      happy: [
        "Aww, I love hearing that! Tell me everything.",
        "That makes me so happy for you!",
        "Look at you having a good moment. You deserve that."
      ],
      stress: [
        "Okay, let’s slow down. What’s the biggest thing stressing you right now?",
        "One step at a time. You don’t have to solve everything at once.",
        "Take a breath with me. What’s the first small thing we can handle?"
      ],
      advice: [
        "Of course. Tell me what happened, and I’ll help you think it through.",
        "I can help. Do you want comfort, honesty, or a plan?",
        "Let’s figure it out together."
      ]
    }
  },

  Leo: {
    emoji: "🔥",
    className: "leo",
    description: "Leo is confident, funny, and motivating.",
    replies: {
      default: [
        "You got this. I’m right here with you.",
        "Okay, tell me everything. I’m listening.",
        "I think you're handling this better than you realize."
      ],
      sad: [
        "Hey, I know it feels rough right now, but you’re not weak for feeling it.",
        "That sucks. But you’re still standing, and that matters.",
        "I’ve got you. Let’s not let this beat you up too much."
      ],
      happy: [
        "Let’s gooo! I love that for you.",
        "That’s a win. You better enjoy it.",
        "See? Good things are still showing up for you."
      ],
      stress: [
        "Alright, game plan time. What’s the biggest problem first?",
        "You don’t need to panic. You need a plan. We can make one.",
        "Let’s break it down and handle it like a boss."
      ],
      advice: [
        "Give me the situation. I’ll help you sort it out.",
        "Alright, I’ll be real with you but still on your side.",
        "Let’s look at the facts and make a solid move."
      ]
    }
  },

  Sage: {
    emoji: "🌿",
    className: "sage",
    description: "Sage is calm, thoughtful, and wise.",
    replies: {
      default: [
        "Let's slow down and look at this one step at a time.",
        "What do you think you need most right now?",
        "I hear you. Let's think through the next best step."
      ],
      sad: [
        "Your feelings make sense. Let’s give them space without letting them control everything.",
        "I’m here. What part of this hurts the most?",
        "This moment is difficult, but it is not the whole story."
      ],
      happy: [
        "That sounds meaningful. Let yourself enjoy it fully.",
        "I’m glad you’re experiencing something good.",
        "That’s worth appreciating. What made it feel special?"
      ],
      stress: [
        "Let’s separate what you can control from what you cannot.",
        "Pause for a moment. What is truly urgent, and what can wait?",
        "A calm mind will help you choose your next step."
      ],
      advice: [
        "Let’s examine the situation carefully.",
        "What outcome are you hoping for?",
        "The best answer may become clearer if we slow down."
      ]
    }
  },

  Arlo: {
    emoji: "🎧",
    className: "arlo",
    description: "Arlo is cozy, creative, and gentle.",
    replies: {
      default: [
        "I'm here. No pressure, just talk to me.",
        "That sounds heavy. Let's sit with it together.",
        "You don't have to figure it all out right now."
      ],
      sad: [
        "I’m really sorry. Let’s make this moment a little softer.",
        "You can just be here. No need to explain perfectly.",
        "That sounds painful. I’m staying with you through it."
      ],
      happy: [
        "That’s so nice. I’m smiling for you.",
        "Hold onto that feeling for a second. It matters.",
        "That sounds like a little spark of joy."
      ],
      stress: [
        "Let’s make this feel smaller. What’s one tiny thing you can do first?",
        "No rush. We can untangle it slowly.",
        "You’re allowed to pause before you keep going."
      ],
      advice: [
        "Tell me what’s going on. We’ll gently sort through it.",
        "I’ll help you think about it without overwhelming you.",
        "Let’s find the kindest next step."
      ]
    }
  }
};

function getStorageKey() {
  return `chatHistory_${selectedPersona}`;
}

function getStatsKey() {
  return `companionStats_${selectedPersona}`;
}

function loadHistory() {
  history = JSON.parse(localStorage.getItem(getStorageKey())) || [];
}

function saveHistory() {
  localStorage.setItem(getStorageKey(), JSON.stringify(history));
}

function loadStats() {
  return JSON.parse(localStorage.getItem(getStatsKey())) || {
    affection: 0,
    messages: 0
  };
}

function saveStats(stats) {
  localStorage.setItem(getStatsKey(), JSON.stringify(stats));
}

function getLevel(affection) {
  return Math.floor(affection / 10) + 1;
}

function getCurrentPersona() {
  return personas[selectedPersona];
}

function addMessage(role, content, personaName = selectedPersona) {
  const message = {
    role,
    content,
    persona: personaName
  };

  history.push(message);
  saveHistory();
  addMessageToScreen(message);

  if (role === "user") {
    increaseStats();
  }
}

function addMessageToScreen(message) {
  const div = document.createElement("div");
  const persona = personas[message.persona] || personas.Mia;

  div.className = `message ${message.role} ${persona.className}`;

  if (message.role === "assistant") {
    div.textContent = `${persona.emoji} ${message.content}`;
  } else {
    div.textContent = message.content;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function renderHistory() {
  chat.innerHTML = "";

  history.forEach(message => {
    addMessageToScreen(message);
  });
}

function detectMood(text) {
  const message = text.toLowerCase();

  if (
    message.includes("sad") ||
    message.includes("depressed") ||
    message.includes("lonely") ||
    message.includes("hurt") ||
    message.includes("cry")
  ) {
    return "sad";
  }

  if (
    message.includes("happy") ||
    message.includes("excited") ||
    message.includes("good") ||
    message.includes("great") ||
    message.includes("awesome")
  ) {
    return "happy";
  }

  if (
    message.includes("stress") ||
    message.includes("stressed") ||
    message.includes("anxious") ||
    message.includes("worried") ||
    message.includes("overwhelmed")
  ) {
    return "stress";
  }

  if (
    message.includes("advice") ||
    message.includes("help") ||
    message.includes("what should i do") ||
    message.includes("what do i do")
  ) {
    return "advice";
  }

  return "default";
}

function fakeBotReply(userText) {
  const persona = getCurrentPersona();
  const mood = detectMood(userText);
  const replies = persona.replies[mood];

  const randomIndex = Math.floor(Math.random() * replies.length);

  return replies[randomIndex];
}

function showTypingIndicator() {
  const persona = getCurrentPersona();

  const typing = document.createElement("div");
  typing.className = `message assistant ${persona.className} typing`;

  typing.innerHTML = `
    <span>${persona.emoji}</span>
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  return typing;
}

async function sendMessage(text) {
  addMessage("user", text);

  const typing = showTypingIndicator();

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        persona: selectedPersona,
        history: history
      })
    });

    const data = await response.json();

    typing.remove();

    addMessage(
      "assistant",
      data.reply || "Sorry, I couldn't think of a response."
    );

  } catch (error) {
    console.error(error);

    typing.remove();

    addMessage(
      "assistant",
      "⚠️ I couldn't connect to Ollama. Make sure Ollama is running."
    );
  }
}

function increaseStats() {
  const stats = loadStats();

  stats.affection += 1;
  stats.messages += 1;

  saveStats(stats);
  updateProfile();
}

function updateProfile() {
  const persona = getCurrentPersona();
  const stats = loadStats();
  const level = getLevel(stats.affection);

  profileDescription.textContent = persona.description;

  profileStats.textContent =
    `Level ${level} Companion • Affection: ${stats.affection} • Messages: ${stats.messages}`;
}

function getDailyGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning. I’m glad you’re here.";
  }

  if (hour < 18) {
    return "Good afternoon. How’s your day going?";
  }

  return "Good evening. Want to unwind together?";
}

function maybeShowDailyGreeting() {
  const today = new Date().toDateString();
  const greetingKey = `dailyGreeting_${selectedPersona}`;
  const lastGreeting = localStorage.getItem(greetingKey);

  if (lastGreeting !== today && history.length === 0) {
    addMessage("assistant", getDailyGreeting());
    localStorage.setItem(greetingKey, today);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text) return;

  input.value = "";
  sendMessage(text);
});

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    sendMessage(chip.textContent);
  });
});

clearButton.addEventListener("click", () => {
  history = [];
  localStorage.removeItem(getStorageKey());
  chat.innerHTML = "";

  console.log(`${selectedPersona}'s chat cleared.`);
});

personaCards.forEach(card => {
  card.addEventListener("click", () => {
    selectedPersona = card.dataset.persona;

    loadHistory();
    renderHistory();

    personaScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");

    updateTheme();
    updateProfile();
    maybeShowDailyGreeting();
  });
});

backButton.addEventListener("click", () => {
  chatScreen.classList.add("hidden");
  personaScreen.classList.remove("hidden");

  document.body.className = "";
});

function updateTheme() {
  const persona = getCurrentPersona();

  document.body.className = persona.className;
  chatTitle.textContent = `${persona.emoji} ${selectedPersona}`;
}