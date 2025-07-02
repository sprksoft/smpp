class GlobalChatWindow extends BaseWindow {
  constructor(hidden = false) {
    super("global_chat_window", hidden);
  }

  async renderContent() {
    const quickSettings = await browser.runtime.sendMessage({
      action: "getQuickSettingsData",
    });
    const placeholderText = quickSettings.customName || "Global Chat";

    let queryString = getThemeQueryString([
      "color-base00",
      "color-base01",
      "color-base02",
      "color-base03",
      "color-accent",
      "color-text",
    ]);

    if (queryString.startsWith("&")) {
      queryString = queryString.substring(1);
    }
    let content = document.createElement("div");
    content.innerHTML = `
      <iframe style="width:100%; height:100%; border:none" src='https://gc.smartschoolplusplus.com/v1?${queryString}'></iframe>
    `;
    return content;
  }
}

let gcWindow;

async function openGlobalChat(event) {
  if (!gcWindow || !gcWindow.element?.isConnected) {
    gcWindow = new GlobalChatWindow();
    await gcWindow.create();
  }
  gcWindow.show(event);
}

function createGCButton() {
  const GlobalChatOpenButton = document.createElement("button");
  GlobalChatOpenButton.title =
    "Global chat (chat met iedereen die de extensie gebruikt)";
  GlobalChatOpenButton.id = "global_chat_button";
  GlobalChatOpenButton.className = "topnav__btn";
  GlobalChatOpenButton.innerHTML = gcIconSvg;
  GlobalChatOpenButton.addEventListener("click", (e) => openGlobalChat(e));
  return GlobalChatOpenButton;
}
