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
const heroEmoji = document.getElementById("hero-emoji");
const moodLabel = document.getElementById("mood-label");
const toast = document.getElementById("toast");

const profileDescription = document.getElementById("profile-description");
const profileStats = document.getElementById("profile-stats");

let selectedPersona = "Mia";
let history = [];

const personas = {
  Mia: {
    emoji: "🌸",
    className: "mia",
    description: "Mia is warm, playful, and emotionally supportive.",
    replies: {}
  },
  Leo: {
    emoji: "🔥",
    className: "leo",
    description: "Leo is confident, funny, and motivating.",
    replies: {}
  },
  Sage: {
    emoji: "🌿",
    className: "sage",
    description: "Sage is calm, thoughtful, and wise.",
    replies: {}
  },
  Arlo: {
    emoji: "🎧",
    className: "arlo",
    description: "Arlo is cozy, creative, and gentle.",
    replies: {}
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
    messages: 0,
    unlockedAchievements: [],
    lastLevel: 1
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

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 3000);
}

function checkAchievements(stats) {
  const achievements = [
    {
      id: "first_message",
      condition: stats.messages === 1,
      message: `🏆 Achievement unlocked: First chat with ${selectedPersona}!`
    },
    {
      id: "ten_messages",
      condition: stats.messages === 10,
      message: `🏆 Achievement unlocked: 10 messages with ${selectedPersona}!`
    },
    {
      id: "twenty_five_messages",
      condition: stats.messages === 25,
      message: `🏆 Achievement unlocked: 25 messages with ${selectedPersona}!`
    },
    {
      id: "fifty_affection",
      condition: stats.affection === 50,
      message: `💖 Achievement unlocked: ${selectedPersona} reached 50 affection!`
    }
  ];

  achievements.forEach(achievement => {
    if (
      achievement.condition &&
      !stats.unlockedAchievements.includes(achievement.id)
    ) {
      stats.unlockedAchievements.push(achievement.id);
      showToast(achievement.message);
    }
  });
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

function updateMoodLabel(mood) {
  const moodText = {
    default: "Listening",
    sad: "Comforting",
    happy: "Happy",
    stress: "Calming",
    advice: "Thinking"
  };

  moodLabel.textContent = `Mood: ${moodText[mood] || "Listening"}`;
}

function showTypingIndicator(mood = "default") {
  const persona = getCurrentPersona();

  const typingThoughts = {
    Mia: {
      default: "Mia is listening",
      sad: "Mia is here with you",
      happy: "Mia is smiling",
      stress: "Mia is helping you breathe",
      advice: "Mia is thinking it through"
    },
    Leo: {
      default: "Leo is locked in",
      sad: "Leo has your back",
      happy: "Leo is hyped for you",
      stress: "Leo is making a game plan",
      advice: "Leo is thinking strategically"
    },
    Sage: {
      default: "Sage is reflecting",
      sad: "Sage is holding space",
      happy: "Sage is appreciating this moment",
      stress: "Sage is finding calm",
      advice: "Sage is considering carefully"
    },
    Arlo: {
      default: "Arlo is listening softly",
      sad: "Arlo is staying with you",
      happy: "Arlo is smiling gently",
      stress: "Arlo is slowing things down",
      advice: "Arlo is sorting it gently"
    }
  };

  const thought =
    typingThoughts[selectedPersona][mood] ||
    typingThoughts[selectedPersona].default;

  const typing = document.createElement("div");
  typing.className = `message assistant ${persona.className} typing`;

  typing.innerHTML = `
    <span>${persona.emoji}</span>
    <span>${thought}</span>
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  return typing;
}

async function sendMessage(text) {
  const mood = detectMood(text);

  updateMoodLabel(mood);

  addMessage("user", text);

  const typing = showTypingIndicator(mood);

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
  const oldLevel = getLevel(stats.affection);

  stats.affection += 1;
  stats.messages += 1;

  const newLevel = getLevel(stats.affection);

  if (newLevel > oldLevel) {
    stats.lastLevel = newLevel;
    showToast(`🎉 ${selectedPersona} reached Level ${newLevel}!`);
  }

  checkAchievements(stats);
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
  chatTitle.textContent = selectedPersona;
  heroEmoji.textContent = persona.emoji;

  updateMoodLabel("default");
}