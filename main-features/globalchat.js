class GlobalChatWindow extends BaseWindow {
  beta;
  iframe;
  gcContent;
  constructor(hidden = true) {
    super("global_chat_window", hidden);
  }

  async renderContent() {
    this.gcContent = document.createElement("div");
    return this.gcContent;
  }

  onOpened() {
    const queryString = getThemeQueryString([
      "color-base00",
      "color-base01",
      "color-base02",
      "color-base03",
      "color-accent",
      "color-text",
    ]);
    const subDomain = this.beta ? "gcbeta" : "gc";
    this.iframe = document.createElement("iframe");
    this.iframe.style = "width:100%; height:100%; border:none";
    this.iframe.src = `https://${subDomain}.smartschoolplusplus.com/v1?${queryString}`;
    this.gcContent.appendChild(this.iframe);
  }
}

let gcWindow;

async function openGlobalChat(event, beta = false) {
  if (!gcWindow || !gcWindow.element?.isConnected) {
    gcWindow = new GlobalChatWindow();
    await gcWindow.create();
  }
  gcWindow.beta = beta;
  gcWindow.show(event);
}

function createGC() {
  const GlobalChatOpenButton = document.createElement("button");
  GlobalChatOpenButton.title =
    "Global chat (chat met iedereen die de extensie gebruikt)";
  GlobalChatOpenButton.id = "global_chat_button";
  GlobalChatOpenButton.className = "topnav__btn";
  GlobalChatOpenButton.innerHTML = gcIconSvg;
  GlobalChatOpenButton.addEventListener("click", (e) => openGlobalChat(e));
  return GlobalChatOpenButton;
}

const GC_URLS = [
  "https://gc.smartschoolplusplus.com",
  "https://gcbeta.smartschoolplusplus.com",
];

window.addEventListener("message", (e) => {
  if (!GC_URLS.includes(e.origin)) {
    return;
  }

  switch (e.data.action) {
    case "getPlantData.v1":
      //TODO: get the plant data
      e.source.postMessage({});
      break;
  }
});
