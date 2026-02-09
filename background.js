const COMMANDS = {
  "go-back": goBack,
  "go-forward": goForward,
  "switch-tab-left": () => switchTab(-1),
  "switch-tab-right": () => switchTab(1),
};

chrome.commands.onCommand.addListener((command) => {
  const handler = COMMANDS[command];
  if (!handler) {
    return;
  }

  void handler().catch((_error) => {
    // Keep the service worker alive on unexpected runtime errors.
  });
});

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab;
}

async function goBack() {
  const tab = await getActiveTab();
  if (typeof tab?.id !== "number") {
    return;
  }

  try {
    await chrome.tabs.goBack(tab.id);
  } catch (_error) {
    // Ignore when there is no back history for the active tab.
  }
}

async function goForward() {
  const tab = await getActiveTab();
  if (typeof tab?.id !== "number") {
    return;
  }

  try {
    await chrome.tabs.goForward(tab.id);
  } catch (_error) {
    // Ignore when there is no forward history for the active tab.
  }
}

async function switchTab(direction) {
  const activeTab = await getActiveTab();

  if (
    typeof activeTab?.id !== "number" ||
    typeof activeTab.index !== "number" ||
    typeof activeTab.windowId !== "number"
  ) {
    return;
  }

  const tabsInWindow = await chrome.tabs.query({
    windowId: activeTab.windowId,
  });
  if (tabsInWindow.length < 2) {
    return;
  }

  const targetIndex =
    (activeTab.index + direction + tabsInWindow.length) % tabsInWindow.length;

  const targetTab = tabsInWindow.find((tab) => tab.index === targetIndex);
  if (typeof targetTab?.id !== "number") {
    return;
  }

  await chrome.tabs.update(targetTab.id, { active: true });
}
