class SettingsWindow extends BaseWindow {
  settingsSideBarCategories = {
    main: { name: "General", icon: "settingsGeneral.png" },
    test: { name: "test", icon: "settingsGeneral.png" },
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
    Object.keys(this.settingsSideBarCategories).forEach((key) => {
      settingsSideBar.appendChild(this.createSettingsSideBarCategory(key));
    });
    return settingsSideBar;
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
    settingsPage = document.createElement("div");

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
  SettingsButton.innerHTML = "gcIconSvg";
  SettingsButton.addEventListener("click", (e) => openSettingsWindow(e));
  return SettingsButton;
}
