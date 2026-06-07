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
const heroAvatar = document.getElementById("hero-avatar");
const moodLabel = document.getElementById("mood-label");
const statusLabel = document.getElementById("status-label");
const toast = document.getElementById("toast");

const profileDescription = document.getElementById("profile-description");
const profileStats = document.getElementById("profile-stats");

const toggleMemoryButton = document.getElementById("toggle-memory");
const memoryList = document.getElementById("memory-list");
const clearMemoriesButton = document.getElementById("clear-memories");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleHome = document.getElementById("theme-toggle-home");

let selectedPersona = "Mia";
let history = [];

const personas = {
  Mia: {
    avatar: "images/mia.png",
    emoji: "🌸",
    className: "mia",
    description: "Mia is warm, playful, and emotionally supportive.",
    statuses: ["Online", "Thinking of you", "Feeling cozy", "Ready to listen"],
    replies: {}
  },

  Leo: {
    avatar: "images/leo.png",
    emoji: "🔥",
    className: "leo",
    description: "Leo is confident, funny, and motivating.",
    statuses: ["Online", "Hyped", "Locked in", "Ready to cheer you on"],
    replies: {}
  },

  Sage: {
    avatar: "images/sage.png",
    emoji: "🌿",
    className: "sage",
    description: "Sage is calm, thoughtful, and wise.",
    statuses: ["Online", "Reflecting", "Finding calm", "Ready to advise"],
    replies: {}
  },

  Arlo: {
    avatar: "images/arlo.png",
    emoji: "🎧",
    className: "arlo",
    description: "Arlo is cozy, creative, and gentle.",
    statuses: ["Online", "Listening to music", "Feeling soft", "Ready to unwind"],
    replies: {}
  }
};

function getStorageKey() {
  return `chatHistory_${selectedPersona}`;
}

function getStatsKey() {
  return `companionStats_${selectedPersona}`;
}

function getMemoryKey() {
  return `longTermMemory_${selectedPersona}`;
}

function loadHistory() {
  history = JSON.parse(localStorage.getItem(getStorageKey())) || [];
}

function saveHistory() {
  localStorage.setItem(getStorageKey(), JSON.stringify(history));
}

function loadStats() {
  const savedStats = JSON.parse(localStorage.getItem(getStatsKey())) || {};

  return {
    affection: savedStats.affection || 0,
    messages: savedStats.messages || 0,
    unlockedAchievements: savedStats.unlockedAchievements || [],
    lastLevel: savedStats.lastLevel || 1,
    lastRank: savedStats.lastRank || "Acquaintance"
  };
}

function saveStats(stats) {
  localStorage.setItem(getStatsKey(), JSON.stringify(stats));
}

function loadMemory() {
  return JSON.parse(localStorage.getItem(getMemoryKey())) || [];
}

function saveMemory(memories) {
  localStorage.setItem(getMemoryKey(), JSON.stringify(memories));
}

function renderMemoryList() {
  const memories = loadMemory();

  memoryList.innerHTML = "";

  if (memories.length === 0) {
    memoryList.innerHTML = `<p class="memory-empty">No memories saved yet.</p>`;
    return;
  }

  memories.forEach((memory, index) => {
    const memoryItem = document.createElement("div");
    memoryItem.className = "memory-item";

    const memoryText = document.createElement("span");
    memoryText.textContent = memory;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-memory";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteMemory(index);
    });

    memoryItem.appendChild(memoryText);
    memoryItem.appendChild(deleteButton);
    memoryList.appendChild(memoryItem);
  });
}

function deleteMemory(index) {
  const memories = loadMemory();

  memories.splice(index, 1);
  saveMemory(memories);

  renderMemoryList();
  updateProfile();

  showToast(`🧠 ${selectedPersona} forgot that memory.`);
}

function clearAllMemories() {
  localStorage.removeItem(getMemoryKey());

  renderMemoryList();
  updateProfile();

  showToast(`🧠 ${selectedPersona}'s memories were cleared.`);
}

function addMemory(memoryText) {
  const memories = loadMemory();

  const cleanedMemory = memoryText.trim();

  if (!cleanedMemory) return;

  const alreadyExists = memories.some(memory =>
    memory.toLowerCase() === cleanedMemory.toLowerCase()
  );

  if (alreadyExists) return;

  memories.push(cleanedMemory);
  saveMemory(memories);

  renderMemoryList();
  updateProfile();

  showToast(`🧠 ${selectedPersona} remembered something new.`);
}

function detectMemory(text) {
  const message = text.trim();
  const lowerMessage = message.toLowerCase();

  const memoryPatterns = [
    "remember that ",
    "remember this: ",
    "my favorite ",
    "i like ",
    "i love ",
    "i am learning ",
    "i'm learning ",
    "my goal is ",
    "i want to become ",
    "i want to be ",
    "i live in ",
    "i work as ",
    "i study ",
    "i'm studying "
  ];

  for (const pattern of memoryPatterns) {
    const index = lowerMessage.indexOf(pattern);

    if (index !== -1) {
      const memory = message.slice(index).trim();

      return memory.charAt(0).toUpperCase() + memory.slice(1);
    }
  }

  return null;
}

function getLevel(affection) {
  return Math.floor(affection / 10) + 1;
}

function getRelationshipRank(affection) {
  if (affection >= 100) return "Soulmate";
  if (affection >= 75) return "Partner";
  if (affection >= 50) return "Best Friend";
  if (affection >= 25) return "Close Friend";
  if (affection >= 10) return "Friend";
  return "Acquaintance";
}

function getCurrentPersona() {
  return personas[selectedPersona];
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");

    if (themeToggle) {
      themeToggle.textContent = "☀️ Light";
    }

    if (themeToggleHome) {
      themeToggleHome.textContent = "☀️ Light";
    }
  } else {
    document.body.classList.remove("dark-mode");

    if (themeToggle) {
      themeToggle.textContent = "🌙 Dark";
    }

    if (themeToggleHome) {
      themeToggleHome.textContent = "🌙 Dark";
    }
  }

  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark-mode");

  applyTheme(isDark ? "light" : "dark");
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

function checkAchievements(stats, level, rank) {
  const achievements = [
    {
      id: "first_message",
      condition: stats.messages === 1,
      message: `🏆 Achievement unlocked: First chat with ${selectedPersona}!`
    },
    {
      id: "level_2",
      condition: level >= 2,
      message: `⭐ Achievement unlocked: ${selectedPersona} reached Level 2!`
    },
    {
      id: "level_5",
      condition: level >= 5,
      message: `🌟 Achievement unlocked: ${selectedPersona} reached Level 5!`
    },
    {
      id: "ten_messages",
      condition: stats.messages >= 10,
      message: `🏆 Achievement unlocked: 10 messages with ${selectedPersona}!`
    },
    {
      id: "twenty_five_messages",
      condition: stats.messages >= 25,
      message: `🏆 Achievement unlocked: 25 messages with ${selectedPersona}!`
    },
    {
      id: "fifty_messages",
      condition: stats.messages >= 50,
      message: `💬 Achievement unlocked: 50 messages with ${selectedPersona}!`
    },
    {
      id: "fifty_affection",
      condition: stats.affection >= 50,
      message: `💖 Achievement unlocked: ${selectedPersona} reached 50 affection!`
    },
    {
      id: "rank_friend",
      condition: rank === "Friend",
      message: `🤝 Rank unlocked: ${selectedPersona} is now your Friend!`
    },
    {
      id: "rank_close_friend",
      condition: rank === "Close Friend",
      message: `💛 Rank unlocked: ${selectedPersona} is now your Close Friend!`
    },
    {
      id: "rank_best_friend",
      condition: rank === "Best Friend",
      message: `💖 Rank unlocked: ${selectedPersona} is now your Best Friend!`
    },
    {
      id: "rank_partner",
      condition: rank === "Partner",
      message: `💕 Rank unlocked: ${selectedPersona} is now your Partner!`
    },
    {
      id: "rank_soulmate",
      condition: rank === "Soulmate",
      message: `✨ Rank unlocked: ${selectedPersona} is now your Soulmate!`
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

function updateStatusLabel() {
  const persona = getCurrentPersona();
  const statuses = persona.statuses;
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  statusLabel.textContent = `Status: ${persona.emoji} ${randomStatus}`;
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
  const detectedMemory = detectMemory(text);

  if (detectedMemory) {
    addMemory(detectedMemory);
  }

  updateMoodLabel(mood);
  updateStatusLabel();

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
        history: history,
        memories: loadMemory()
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
  const oldRank = getRelationshipRank(stats.affection);

  stats.affection += 1;
  stats.messages += 1;

  const newLevel = getLevel(stats.affection);
  const newRank = getRelationshipRank(stats.affection);

  if (newLevel > oldLevel) {
    stats.lastLevel = newLevel;
    showToast(`🎉 ${selectedPersona} reached Level ${newLevel}!`);
  }

  if (newRank !== oldRank) {
    stats.lastRank = newRank;
    showToast(`💫 Relationship upgraded: ${selectedPersona} is now your ${newRank}!`);
  }

  checkAchievements(stats, newLevel, newRank);
  saveStats(stats);
  updateProfile();
}

function updateProfile() {
  const persona = getCurrentPersona();
  const stats = loadStats();
  const level = getLevel(stats.affection);
  const rank = getRelationshipRank(stats.affection);
  const memoryCount = loadMemory().length;

  profileDescription.textContent = persona.description;

  profileStats.textContent =
    `Level ${level} Companion • Rank: ${rank} • Affection: ${stats.affection} • Messages: ${stats.messages} • Memories: ${memoryCount}`;
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

toggleMemoryButton.addEventListener("click", () => {
  memoryList.classList.toggle("hidden");

  if (memoryList.classList.contains("hidden")) {
    toggleMemoryButton.textContent = "🧠 Show Memories";
  } else {
    toggleMemoryButton.textContent = "🧠 Hide Memories";
    renderMemoryList();
  }
});

clearMemoriesButton.addEventListener("click", () => {
  clearAllMemories();
});

personaCards.forEach(card => {
  card.addEventListener("click", () => {
    selectedPersona = card.dataset.persona;

    loadHistory();
    renderHistory();
    renderMemoryList();

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

themeToggle?.addEventListener("click", toggleTheme);
themeToggleHome?.addEventListener("click", toggleTheme);

function updateTheme() {
  const persona = getCurrentPersona();

  document.body.className = persona.className;

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  chatTitle.textContent = selectedPersona;

  heroAvatar.src = persona.avatar;
  heroAvatar.alt = `${selectedPersona} Avatar`;

  updateMoodLabel("default");
  updateStatusLabel();
  renderMemoryList();
}

const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);