const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("message");
const personaSelect = document.getElementById("persona");
const chips = document.querySelectorAll(".chips button");

let history = JSON.parse(localStorage.getItem("chatHistory")) || [];

renderHistory();

function addMessage(role, content) {
  history.push({ role, content });
  localStorage.setItem("chatHistory", JSON.stringify(history));

  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = content;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function renderHistory() {
  chat.innerHTML = "";
  history.forEach(msg => addMessageToScreen(msg.role, msg.content));
}

function addMessageToScreen(role, content) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = content;
  chat.appendChild(div);
}

async function sendMessage(text) {
  addMessage("user", text);

  const typing = document.createElement("div");
  typing.className = "message assistant";
  typing.textContent = "Typing...";
  chat.appendChild(typing);

  const response = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      persona: personaSelect.value,
      history
    })
  });

  const data = await response.json();
  typing.remove();

  addMessage("assistant", data.reply || "Sorry, I had trouble replying.");
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

document.getElementById("clear").addEventListener("click", () => {
  history = [];
  localStorage.removeItem("chatHistory");
  chat.innerHTML = "";
});