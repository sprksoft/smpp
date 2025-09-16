class SettingsWindow extends BaseWindow {
  settingsSideBarCategories = {
    appearance: { name: "Appearance", icon: "settingsAppearance.png" },
    topNav: { name: "Navigation", icon: "settingsTopNav.png" },
    features: { name: "Apps", icon: "settingsFeatures.png" },
    other: { name: "Other", icon: "settingsOther.png" },
  };
  currentPage = "profile";

  constructor(hidden = false) {
    super("settings-window", hidden);
  }

  async renderContent() {
    let content = document.createElement("div");
    let settingsSideBar = this.createSettingsSideBar();
    let settingsPage = this.displaySettingsPage();
    content.classList.add("settingsWindow");
    content.appendChild(await settingsSideBar);
    content.appendChild(settingsPage);
    await this.loadSettings();
    return content;
  }

  onOpened() {
    this.loadSettings();
  }
  async loadSettings() {}

  async createSettingsSideBar() {
    let settingsSideBar = document.createElement("div");
    settingsSideBar.classList.add("settings-sidebar");
    let settingsSideBarProfileButton =
      await this.createSettingsSideBarProfileButton();
    settingsSideBar.appendChild(settingsSideBarProfileButton);
    Object.keys(this.settingsSideBarCategories).forEach((key) => {
      let settingsSideBarButton = this.createSettingsSideBarCategory(key);
      settingsSideBarButton.addEventListener("click", (event) => {
        this.currentPage = event.currentTarget.dataset.page;
        this.displaySettingsPage();
      });

      settingsSideBar.appendChild(settingsSideBarButton);
    });
    return settingsSideBar;
  }

  async createSettingsSideBarProfileButton() {
    let data = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });
    let profileSettingsButton = document.createElement("button");
    profileSettingsButton.classList.add("profile-settings-button");
    let profilePicture = document.createElement("div");
    profilePicture.classList.add("profile-picture-settings");
    let profileSettingsLabel = document.createElement("div");
    profileSettingsLabel.classList.add("profile-settings-label");
    let profileSettingsLabelTitle = document.createElement("h2");
    profileSettingsLabelTitle.classList.add("profile-settings-label-title");
    profileSettingsLabelTitle.innerText = String(
      data.profile.customUserName || getOriginalName(),
    ).split(" ")[0];
    let profileSettingsLabelDescription = document.createElement("p");
    profileSettingsLabelDescription.classList.add(
      "profile-settings-label-description",
    );
    profileSettingsLabelDescription.innerText = "view profile";
    profileSettingsLabel.appendChild(profileSettingsLabelTitle);
    profileSettingsLabel.appendChild(profileSettingsLabelDescription);

    profileSettingsButton.appendChild(profilePicture);
    profileSettingsButton.appendChild(profileSettingsLabel);
    return profileSettingsButton;
  }

  createSettingsSideBarCategory(category) {
    let categoryButton = document.createElement("button");
    categoryButton.classList.add("settings-category-button");
    categoryButton.dataset.page = category;
    categoryButton.innerText = this.settingsSideBarCategories[category].name;
    let categoryButtonIcon = document.createElement("img");
    categoryButtonIcon.classList.add("category-button-icon");
    categoryButtonIcon.src = getImage(
      this.settingsSideBarCategories[category].icon,
    );
    categoryButton.prepend(categoryButtonIcon);
    return categoryButton;
  }
  displaySettingsPage() {
    let settingsPage = document.createElement("div");
    settingsPage.id = "settings-page";

    function createButton(label, state) {
      let outerSwitch = document.createElement("label");
      outerSwitch.classList.add("switch");
      let innerButton = document.createElement("input");
      innerButton.classList.add("popupinput");
      innerButton.type = "checkbox";
      innerButton.checked = state;
      let innerSwitch = document.createElement("span");
      innerSwitch.classList.add("slider", "round");
      innerButton.appendChild(innerSwitch);
      outerSwitch.appendChild(innerButton);
      return outerSwitch;
    }

    switch (this.currentPage) {
      case "profile":
        let button = createButton("AAAA", true);
        settingsPage.appendChild(button);
        break;
      case "appearance":
        break;
      case "topNav":
        break;
      case "features":
        break;
      case "other":
        break;
      default:
        break;
    }
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
