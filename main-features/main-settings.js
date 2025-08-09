class SettingsWindow extends BaseWindow {
  settingsSideBarCategories = {
    appearance: { name: "Appearance", icon: "settingsAppearance.png" },
    topNav: { name: "Navigation", icon: "settingsTopNav.png" },
    features: { name: "Apps", icon: "settingsFeatures.png" },
    other: { name: "Other", icon: "settingsOther.png" },
  };
  currentPage = 0;

  constructor(hidden = false) {
    super("settings-window", hidden);
  }

  async renderContent() {
    let content = document.createElement("div");
    let settingsSideBar = this.createSettingsSideBar();
    let settingsPage = this.displaySettingsPage();
    content.classList.add("settingsWindow");
    content.appendChild(settingsSideBar);
    content.appendChild(settingsPage);
    await this.loadSettings();
    return content;
  }

  onOpened() {
    this.loadSettings();
  }
  async loadSettings() {}

  createSettingsSideBar() {
    let settingsSideBar = document.createElement("div");
    settingsSideBar.classList.add("settings-sidebar");
    settingsSideBar.appendChild(this.createSettingsSideBarProfileButton());
    Object.keys(this.settingsSideBarCategories).forEach((key) => {
      settingsSideBar.appendChild(this.createSettingsSideBarCategory(key));
    });
    return settingsSideBar;
  }

  createSettingsSideBarProfileButton() {
    return document.createElement("div");
  }

  createSettingsSideBarCategory(category) {
    let categoryButton = document.createElement("button");
    categoryButton.classList.add("settings-category-button");
    categoryButton.innerText = this.settingsSideBarCategories[category].name;
    let categoryButtonIcon = document.createElement("img");
    categoryButtonIcon.classList.add("category-button-icon");
    categoryButtonIcon.src = getImage(
      this.settingsSideBarCategories[category].icon
    );
    categoryButton.prepend(categoryButtonIcon);
    return categoryButton;
  }

  displaySettingsPage() {
    let settingsPage = document.createElement("div");
    settingsPage.id = "settings-page";
    return settingsPage;
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
  SettingsButton.innerHTML = "SettingsV2";
  SettingsButton.addEventListener("click", (e) => openSettingsWindow(e));
  return SettingsButton;
}
