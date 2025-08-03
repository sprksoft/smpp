class SettingsWindow extends BaseWindow {
  constructor(hidden = false) {
    super("settingsWindow", hidden);
  }
  async renderContent() {
    let content = document.createElement("div");
    let settingsSideBar = this.createSettingsSideBar();
    let settingsPage = this.displaySettingsPage(0);
    content.classList.add("settingsWindow");
    content.appendChild(settingsSideBar);
    content.appendChild(settingsPage);
    await this.loadSettings();
    return content;
  }
  onOpened() {
    console.log("yay");
  }
  async loadSettings() {}

  createSettingsSideBar() {
    return document.createElement("div");
  }

  displaySettingsPage(page) {
    return document.createElement("div");
  }
}

let settingsWindow;

async function openSettingsWindow(event) {
  console.log("did this");
  if (!settingsWindow || !settingsWindow.element?.isConnected) {
    settingsWindow = new SettingsWindow();
    await settingsWindow.create();
  }
  settingsWindow.show(event);
}

function createSettingsButton() {
  const SettingsButton = document.createElement("button");
  SettingsButton.id = "somebutton";
  SettingsButton.className = "topnav__btn";
  SettingsButton.innerHTML = "gcIconSvg";
  SettingsButton.addEventListener("click", (e) => openSettingsWindow(e));
  return SettingsButton;
}
