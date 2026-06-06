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

let selectedPersona = "Mia";
let history = [];

const personas = {
  Mia: {
    emoji: "🌸",
    className: "mia",
    replies: [
      "Aww, I’m here with you. Tell me more.",
      "That sounds like a lot. Want to talk through it together?",
      "I’m proud of you for opening up."
    ]
  },

  Leo: {
    emoji: "🔥",
    className: "leo",
    replies: [
      "You got this. I’m right here with you.",
      "Okay, tell me everything. I’m listening.",
      "I think you're handling this better than you realize."
    ]
  },

  Sage: {
    emoji: "🌿",
    className: "sage",
    replies: [
      "Let's slow down and look at this one step at a time.",
      "What do you think you need most right now?",
      "I hear you. Let's think through the next best step."
    ]
  },

  Arlo: {
    emoji: "🎧",
    className: "arlo",
    replies: [
      "I'm here. No pressure, just talk to me.",
      "That sounds heavy. Let's sit with it together.",
      "You don't have to figure it all out right now."
    ]
  }
};

function getStorageKey() {
  return `chatHistory_${selectedPersona}`;
}

function loadHistory() {
  history = JSON.parse(localStorage.getItem(getStorageKey())) || [];
}

function saveHistory() {
  localStorage.setItem(getStorageKey(), JSON.stringify(history));
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

function fakeBotReply() {
  const persona = getCurrentPersona();
  const randomIndex = Math.floor(Math.random() * persona.replies.length);

  return persona.replies[randomIndex];
}

async function sendMessage(text) {
  addMessage("user", text);

  const typing = document.createElement("div");
  const persona = getCurrentPersona();

  typing.className = `message assistant ${persona.className}`;
  typing.textContent = `${persona.emoji} Typing...`;

  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => {
    typing.remove();
    addMessage("assistant", fakeBotReply());
  }, 800);
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
  });
});

backButton.addEventListener("click", () => {
  chatScreen.classList.add("hidden");
  personaScreen.classList.remove("hidden");
});

function updateTheme() {
  const persona = getCurrentPersona();

  document.body.className = persona.className;
  chatTitle.textContent = `${persona.emoji} ${selectedPersona}`;
}