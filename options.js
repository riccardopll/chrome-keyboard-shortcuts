const openShortcutsButton = document.getElementById("open-shortcuts");
const commandList = document.getElementById("command-list");
const status = document.getElementById("status");

openShortcutsButton.addEventListener("click", async () => {
  try {
    await chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    status.textContent = "Opened Chrome shortcut settings in a new tab.";
  } catch (_error) {
    status.textContent =
      "Could not open shortcut settings automatically. Open chrome://extensions/shortcuts manually.";
  }
});

async function renderCommands() {
  const commands = await chrome.commands.getAll();

  const supported = commands.filter((command) => {
    return (
      command.name === "go-back" ||
      command.name === "go-forward" ||
      command.name === "switch-tab-left" ||
      command.name === "switch-tab-right"
    );
  });

  if (supported.length === 0) {
    commandList.innerHTML = "<li>No commands found.</li>";
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const command of supported) {
    const item = document.createElement("li");
    const keyText = command.shortcut || "Not set";
    item.textContent = `${command.description}: ${keyText}`;
    fragment.appendChild(item);
  }

  commandList.replaceChildren(fragment);
}

void renderCommands();
