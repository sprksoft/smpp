class SettingsWindow extends BaseWindow {
  settingsSideBarCategories = {
    test: { name: "Test", icon: "/settings-icons/settingsAppearance.png" },
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
    settingsSideBarProfileButton.classList.add("active");
    settingsSideBarProfileButton.addEventListener("click", () => {
      this.currentPage = "profile";
      document
        .querySelectorAll(".settings-category-button-js")
        .forEach((el) => {
          el.classList.remove("active");
        });
      settingsSideBarProfileButton.classList.add("active");
      this.displaySettingsPage();
    });
    settingsSideBar.appendChild(settingsSideBarProfileButton);

    Object.keys(this.settingsSideBarCategories).forEach((key) => {
      let settingsSideBarButton = this.createSettingsSideBarCategory(key);
      settingsSideBarButton.addEventListener("click", (event) => {
        this.currentPage = event.currentTarget.dataset.page;
        document
          .querySelectorAll(".settings-category-button-js")
          .forEach((el) => {
            el.classList.remove("active");
          });
        event.target.classList.add("active");
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
    profileSettingsButton.classList.add(
      "profile-settings-button",
      "settings-category-button-js"
    );
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
    categoryButton.classList.add(
      "settings-category-button",
      "settings-category-button-js"
    );
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

  storePage(page) {
    return 1;
  }

  displaySettingsPage() {
    function createMainTitle(text) {
      let title = document.createElement("h1");
      title.innerText = text;
      title.classList.add("settings-page-main-title");
      return title;
    }
    function createSectionTitle(text) {
      let title = document.createElement("h2");
      title.innerText = text;
      title.classList.add("settings-page-section-title");
      return title;
    }
    function createSmallTitle(text) {
      let title = document.createElement("h3");
      title.innerText = text;
      title.classList.add("settings-page-small-title");
      return title;
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

    function createDescription(text) {
      let description = document.createElement("p");
      description.innerText = text;
      description.classList.add("settings-page-description");
      return description;
    }

    this.clearSettingsPage();
    switch (this.currentPage) {
      case "profile":
        break;
      case "test":
        this.settingsPage.appendChild(createSmallTitle("Profile Label"));
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
        break;
      case "appearance":
        this.settingsPage.appendChild(createMainTitle("Appearance"));
        this.settingsPage.appendChild(createSectionTitle("Theme"));
        this.settingsPage.appendChild(
          createDescription(
            "Customize the overall look and feel of the interface with different color styles."
          )
        );

        let themesContainer = document.createElement("div");
        themesContainer.classList.add("settings-page-theme-container");
        settingsOptions.appearance.theme.forEach((key) => {
          if (
            !themes[key]["display-name"].startsWith("__") &&
            key != "custom"
          ) {
            // Don't include hidden themes

            let themeCard = document.createElement("div");
            themeCard.classList.add("settings-page-theme-card");
            themeCard.style.setProperty(
              "--hover-border",
              themes[key]["--color-accent"]
            );
            themeCard.style.setProperty(
              "--hover-color",
              themes[key]["--color-base01"]
            );
            themeCard.style.setProperty(
              "--text-color",
              themes[key]["--color-text"]
            );
            themeCard.dataset.theme = key;

            let themeImage = createImage(
              "/theme-backgrounds/" + key + ".jpg",
              "100%",
              "6rem"
            );

            let themeTitle = document.createElement("span");
            themeTitle.classList.add("settings-page-theme-title");
            themeTitle.innerText = themes[key]["display-name"];

            themeCard.appendChild(themeImage);
            themeCard.appendChild(themeTitle);
            themesContainer.appendChild(themeCard);
          }
        });
        this.settingsPage.appendChild(themesContainer);

        this.settingsPage.appendChild(createSectionTitle("Wallpaper"));
        this.settingsPage.appendChild(
          createDescription("Personalize your backdrop with a custom image.")
        );

        let backgroundSelectionContainer = document.createElement("div");
        backgroundSelectionContainer.classList.add(
          "settings-page-background-selection-container"
        );

        const clearButton = document.createElement("button");
        clearButton.id = "settings-page-link-clear-button";
        clearButton.classList.add("smpp-link-clear-button");
        clearButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2">
          <g xmlns="http://www.w3.org/2000/svg">
          <path d="M7 7.00006L17 17.0001M7 17.0001L17 7.00006" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </svg>`;

        clearButton.addEventListener("click", async function (event) {
          event.target
            .closest(".smpp-link-clear-button")
            .classList.remove("active");
          document.getElementById("settings-page-background-link-input").value =
            "";
          await storePage(this.currentPage);
        });

        const linkInput = createTextInput(
          "settings-page-background-link-input"
        );

        const backgroundFileInput = document.createElement("input");
        backgroundFileInput.id = "settings-page-background-file-input";
        backgroundFileInput.style.display = "none";
        backgroundFileInput.type = "file";
        backgroundFileInput.accept = ".png, .jpg, .jpeg";

        const fileBtn = document.createElement("button");
        fileBtn.className = "smpp-background-file";
        fileBtn.id = "settings-page-background-file-button";
        fileBtn.innerHTML = fileInputIconSvg;
        fileBtn.addEventListener("click", () => {
          backgroundFileInput.click();
        });

        backgroundSelectionContainer.appendChild(linkInput);
        backgroundSelectionContainer.appendChild(fileBtn);
        backgroundSelectionContainer.appendChild(clearButton);
        backgroundSelectionContainer.appendChild(backgroundFileInput);

        this.settingsPage.appendChild(backgroundSelectionContainer);

        this.settingsPage.appendChild(createSectionTitle("Background blur"));
        this.settingsPage.appendChild(
          createDescription("Apply a blur to your background.")
        );

        this.settingsPage.appendChild(
          createSlider(0, 100, "settings-page-blur-slider") // must be divided by 10 for real value
        );

        let blurPreviewContainer = document.createElement("div");
        blurPreviewContainer.classList.add(
          "settings-page-blur-preview-container"
        );
        blurPreviewContainer.appendChild(
          createImage("/theme-backgrounds/birb.jpg", "6rem", "4rem")
        );

        let blurredImage = createImage(
          "/theme-backgrounds/birb.jpg",
          "100%",
          "100%"
        );
        blurredImage.style.filter = "blur(2px)";
        let blurredImageContainer = document.createElement("div");
        blurredImageContainer.classList.add("blurred-image-container");
        blurredImageContainer.appendChild(blurredImage);

        blurPreviewContainer.appendChild(blurredImageContainer);

        this.settingsPage.appendChild(blurPreviewContainer);

        this.settingsPage.appendChild(createSectionTitle("Weather overlay"));
        this.settingsPage.appendChild(
          createDescription("Add dynamic weather visuals.")
        );

        let iconsContainer = document.createElement("div");
        iconsContainer.classList.add("settings-page-icons-container");

        this.settingsPage.appendChild(createSectionTitle("Icon"));
        this.settingsPage.appendChild(
          createDescription("Choose the icon displayed in your browser tab.")
        );

        iconsContainer.appendChild(
          createImageButton(
            "/icons/sm-icon.svg",
            "4rem",
            "4rem",
            "default-icon-button"
          )
        );
        iconsContainer.appendChild(
          createImageButton(
            "/icons/smpp-icon128.png",
            "4rem",
            "4rem",
            "smpp-icon-button"
          )
        );
        this.settingsPage.appendChild(iconsContainer);
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
  }
}

let settingsWindow;

async function openSettingsWindow(event) {
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
