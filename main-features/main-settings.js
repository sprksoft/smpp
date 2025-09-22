class SettingsWindow extends BaseWindow {
  settingsSideBarCategories = {
    appearance: {
      name: "Appearance",
      icon: "/settings-icons/settingsAppearance.png",
    },
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
    this.settingsPage = document.createElement("div");
    this.settingsPage.id = "settings-page";

    content.classList.add("settingsWindow");
    content.appendChild(await settingsSideBar);
    content.appendChild(this.settingsPage);
    this.displaySettingsPage();
    return content;
  }

  onOpened() {}

  async createSettingsSideBar() {
    let settingsSideBar = document.createElement("div");
    settingsSideBar.classList.add("settings-sidebar");
    let settingsSideBarProfileButton =
      await this.createSettingsSideBarProfileButton();
    settingsSideBarProfileButton.addEventListener("click", () => {
      this.currentPage = "profile";
      this.displaySettingsPage();
    });
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
      data.profile.customUserName || getOriginalName()
    ).split(" ")[0];
    let profileSettingsLabelDescription = document.createElement("p");
    profileSettingsLabelDescription.classList.add(
      "profile-settings-label-description"
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
      this.settingsSideBarCategories[category].icon
    );
    categoryButton.prepend(categoryButtonIcon);
    return categoryButton;
  }
  clearSettingsPage() {
    this.settingsPage.innerHTML = " ";
  }
  displaySettingsPage() {
    function createLabel(text) {
      let label = document.createElement("label");
      label.innerText = text;
      label.classList.add("settings-page-label");
      return label;
    }
    function createButton(id) {
      let outerSwitch = document.createElement("label");
      outerSwitch.classList.add("switch");
      outerSwitch.classList.add("settings-page-button");
      let innerButton = document.createElement("input");
      innerButton.classList.add("popupinput");
      innerButton.type = "checkbox";
      innerButton.id = id;
      let innerSwitch = document.createElement("span");
      innerSwitch.classList.add("slider", "round");
      outerSwitch.appendChild(innerButton);
      outerSwitch.appendChild(innerSwitch);
      return outerSwitch;
    }
    function createImageButton(src, width = "80px", height = "80px", id) {
      // Create the wrapper label
      let wrapper = document.createElement("label");
      wrapper.classList.add("settings-page-image-button-wrapper");
      wrapper.style.width = width;
      wrapper.style.height = height;

      let input = document.createElement("input");
      input.type = "checkbox";
      if (id) input.id = id;

      let image = document.createElement("img");
      image.classList.add("settings-page-image");
      image.src = getImage(src);
      image.width = width;

      wrapper.appendChild(input);
      wrapper.appendChild(image);

      return wrapper;
    }

    function createSlider(min, max, id) {
      let slider = document.createElement("input");
      slider.id = id;
      slider.type = "range";
      slider.min = min;
      slider.max = max;
      slider.classList.add("settings-page-slider");
      return slider;
    }
    function createTextInput(id) {
      let textInput = document.createElement("input");
      textInput.id = id;
      textInput.type = "text";
      textInput.spellcheck = false;
      textInput.classList.add("settings-page-text-input");
      return textInput;
    }
    function createImage(src, width, height) {
      let image = document.createElement("img");
      image.classList.add("settings-page-image");
      image.src = getImage(src);
      image.style.width = width;
      image.style.height = height;
      image.style.objectFit = "cover";
      return image;
    }

    this.clearSettingsPage();
    switch (this.currentPage) {
      case "profile":
        // === PROFILE TESTS ===
        this.settingsPage.appendChild(createLabel("Profile Label"));
        this.settingsPage.appendChild(createButton("profile-btn1"));
        this.settingsPage.appendChild(
          createImageButton(
            "/theme-backgrounds/birb.jpg",
            "50px",
            "50px",
            "profile-imgbtn"
          )
        );
        this.settingsPage.appendChild(createSlider(0, 10, "profile-slider"));
        this.settingsPage.appendChild(createTextInput("profile-txt"));
        this.settingsPage.appendChild(
          createImage("/theme-backgrounds/chocolate.jpg", "100px", "100px")
        );
        console.log(
          "Profile tests finished, child count:",
          this.settingsPage.children.length
        );
        break;

      case "appearance":
        // === APPEARANCE TESTS ===
        const sliderApp = createSlider(5, 15, "appearance-slider");
        this.settingsPage.appendChild(sliderApp);
        console.assert(
          sliderApp.min === "5",
          "Appearance slider min should be 5"
        );

        const txtApp = createTextInput("appearance-txt");
        this.settingsPage.appendChild(txtApp);
        console.assert(
          txtApp.type === "text",
          "Appearance text input should be text"
        );

        const imgApp = createImage(
          "/theme-backgrounds/birb.jpg",
          "200px",
          "120px"
        );
        this.settingsPage.appendChild(imgApp);
        console.assert(
          imgApp.src.includes("birb.jpg"),
          "Appearance image should use birb.jpg"
        );

        console.log("Appearance tests passed!");
        break;

      case "topNav":
        // === TOPNAV TESTS ===
        const btnTop = createButton("topnav-btn");
        this.settingsPage.appendChild(btnTop);
        const cbTop = btnTop.querySelector("input");
        cbTop.checked = true;
        console.assert(cbTop.checked === true, "TopNav checkbox should toggle");

        const sliderTop = createSlider(0, 100, "topnav-slider");
        this.settingsPage.appendChild(sliderTop);
        sliderTop.value = 42;
        console.assert(
          sliderTop.value === "42",
          "TopNav slider value should be 42"
        );

        const txtTop = createTextInput("topnav-txt");
        this.settingsPage.appendChild(txtTop);
        txtTop.value = "TopNav!";
        console.assert(
          txtTop.value === "TopNav!",
          "TopNav text input should store value"
        );

        console.log("TopNav interaction tests passed!");
        break;

      case "features":
        // === FEATURES TESTS ===
        this.settingsPage.appendChild(createLabel("Features Label"));
        this.settingsPage.appendChild(createButton("features-btn"));
        this.settingsPage.appendChild(
          createImageButton(
            "/theme-backgrounds/chocolate.jpg",
            "60px",
            "60px",
            "features-imgbtn"
          )
        );
        this.settingsPage.appendChild(createSlider(1, 20, "features-slider"));
        this.settingsPage.appendChild(createTextInput("features-txt"));
        this.settingsPage.appendChild(
          createImage("/theme-backgrounds/birb.jpg", "120px", "120px")
        );
        console.log(
          "Features tests finished, child count:",
          this.settingsPage.children.length
        );
        break;

      case "other":
        // === OTHER TESTS ===
        const btnOther = createButton("other-btn");
        this.settingsPage.appendChild(btnOther);
        const cbOther = btnOther.querySelector("input");
        cbOther.checked = false;
        console.assert(
          cbOther.checked === false,
          "Other checkbox should remain unchecked"
        );

        const sliderOther = createSlider(10, 50, "other-slider");
        this.settingsPage.appendChild(sliderOther);
        sliderOther.value = 30;
        console.assert(
          sliderOther.value === "30",
          "Other slider value should be 30"
        );

        const txtOther = createTextInput("other-txt");
        this.settingsPage.appendChild(txtOther);
        txtOther.value = "Other!";
        console.assert(
          txtOther.value === "Other!",
          "Other text input should store value"
        );

        console.log("Other tests passed!");
        break;

      default:
        break;
    }
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
