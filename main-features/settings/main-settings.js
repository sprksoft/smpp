class SettingsWindow extends BaseWindow {
  settingsSideBarCategories = {
    appearance: {
      name: "Appearance",
    },
    topNav: { name: "Navigation" },
    widgets: { name: "Widgets" },
    other: { name: "Other" },
  };
  currentPage = "profile";

  constructor(hidden = false) {
    super("settings-window", hidden);
  }

  async renderContent() {
    let content = document.createElement("div");
    let settingsSideBar = await this.createSettingsSideBar();
    this.settingsPage = document.createElement("div");
    this.settingsPage.id = "settings-page";
    this.settingsPage.addEventListener("change", (e) => this.storePage(e));

    content.classList.add("settingsWindow");
    content.appendChild(settingsSideBar);
    content.appendChild(this.settingsPage);
    this.displaySettingsPage();
    return content;
  }

  async createSettingsSideBar() {
    let settingsSideBar = document.createElement("div");
    settingsSideBar.classList.add("settings-sidebar");
    let settingsSideBarProfileButton =
      await this.createSettingsSideBarProfileButton();
    settingsSideBarProfileButton.classList.add("active");
    settingsSideBarProfileButton.addEventListener("click", async () => {
      this.currentPage = "profile";
      document
        .querySelectorAll(".settings-category-button-js")
        .forEach((el) => {
          el.classList.remove("active");
        });
      settingsSideBarProfileButton.classList.add("active");
      this.displaySettingsPage();
      await this.loadPage();
    });
    settingsSideBar.appendChild(settingsSideBarProfileButton);

    Object.keys(this.settingsSideBarCategories).forEach((key) => {
      let settingsSideBarButton = this.createSettingsSideBarCategory(key);
      settingsSideBarButton.addEventListener("click", async (event) => {
        this.currentPage = event.currentTarget.dataset.page;
        document
          .querySelectorAll(".settings-category-button-js")
          .forEach((el) => {
            el.classList.remove("active");
          });
        event.target.classList.add("active");
        this.displaySettingsPage();
        await this.loadPage();
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
    profileSettingsLabelTitle.id = "profile-settings-label-title";
    profileSettingsLabelTitle.innerText = String(
      data.profile.username || originalUsername
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

  isPastaTime() {
    return new Date().getHours() === 12;
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

    let imageFileName = category + ".webp";
    if (category === "appearance" && this.isPastaTime()) {
      imageFileName = "pasta.webp";
    }
    categoryButtonIcon.src = getExtensionImage(
      "settings-icons/" + imageFileName
    );
    categoryButton.prepend(categoryButtonIcon);
    return categoryButton;
  }

  clearSettingsPage() {
    this.settingsPage.innerHTML = " ";
  }

  addDisclaimer(
    element,
    disclaimerHTML = `
    * Changes will only apply after 
    <a class="settings-page-disclaimer-button" href="#" onclick="window.location.href = window.location.href; return false;">reload</a>
  `
  ) {
    if (
      element.nextElementSibling?.classList.contains("settings-page-disclaimer")
    ) {
      return;
    }

    const disclaimer = document.createElement("span");
    disclaimer.classList.add("settings-page-disclaimer");
    disclaimer.innerHTML = disclaimerHTML;

    element.insertAdjacentElement("afterend", disclaimer);
  }

  async resetSettings() {
    const popup = document.createElement("div");
    popup.classList.add("reset-confirmation-popup");

    const popupContent = document.createElement("div");
    popupContent.classList.add("reset-popup-content");

    const title = document.createElement("h3");
    title.textContent = "Reset Settings";

    const description = document.createElement("p");
    description.textContent =
      "Are you sure you want to reset all settings to defaults? This will delete all your customizations and cannot be undone.";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("reset-popup-buttons");

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("reset-popup-cancel");
    cancelButton.textContent = "Cancel";

    const confirmButton = document.createElement("button");
    confirmButton.classList.add("reset-popup-confirm");
    confirmButton.textContent = "Reset";

    buttonContainer.append(cancelButton, confirmButton);
    popupContent.append(title, description, buttonContainer);
    popup.appendChild(popupContent);
    this.element.appendChild(popup);

    cancelButton.addEventListener("click", () => popup.remove());
    confirmButton.addEventListener("click", async () => {
      popup.remove();
      await clearAllData();
    });
  }

  async loadPage() {
    let settings = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });

    document.getElementById("profile-settings-label-title").innerText = String(
      settings.profile.username || originalUsername
    ).split(" ")[0];

    switch (this.currentPage) {
      case "profile": {
        if (settings.profile.username) {
          document.getElementById("settings-page-username-input").value =
            settings.profile.username;
        }

        // Profile Picture
        this.profilePictureInput.loadImageData();
        break;
      }

      case "appearance": {
        // Theme
        document
          .querySelectorAll(".settings-page-theme-card input[type='radio']")
          .forEach((radio) => {
            if (radio.value === settings.appearance.theme) {
              radio.checked = true;
            }
          });

        if (settings.appearance.theme == "custom") {
          document
            .getElementById("colorpickersforsettingspage")
            .classList.add("visible");
          await loadCustomThemeDataV2();
        } else {
          document
            .getElementById("colorpickersforsettingspage")
            .classList.remove("visible");
        }

        // Background
        this.backgroundImageSelector.loadImageData();

        // Blur slider
        document.getElementById("settings-page-blur-slider").value =
          settings.appearance.background.blur * 10;

        // Weather overlay
        document
          .querySelectorAll(".settings-page-weather-overlay-container input")
          .forEach((input) => {
            if (input.id) {
              input.checked = input.id.includes(
                settings.appearance.weatherOverlay.type
              );
            }
          });

        document.getElementById("settings-page-weather-overlay-slider").value =
          settings.appearance.weatherOverlay.amount;

        document.getElementById(
          "settings-page-weather-overlay-opacity-slider"
        ).value = settings.appearance.weatherOverlay.opacity * 100;

        // Tab icon
        document.getElementById("settings-page-default-icon-button").checked =
          settings.appearance.tabLogo == "sm";
        document.getElementById("settings-page-smpp-icon-button").checked =
          settings.appearance.tabLogo == "smpp";

        // News
        document.getElementById("settings-page-show-news-button").checked =
          settings.appearance.news;
        break;
      }

      case "topNav": {
        document.getElementById("settings-page-swap-courses-button").checked =
          settings.topNav.switchCoursesAndLinks;

        // Buttons
        if (isGOSchool)
          document.getElementById("settings-page-go-button").checked =
            settings.topNav.buttons.GO;

        document.getElementById("settings-page-global-chat-button").checked =
          settings.topNav.buttons.GC;
        document.getElementById("settings-page-search-button").checked =
          settings.topNav.buttons.search;
        document.getElementById("settings-page-quick-menu-button").checked =
          settings.topNav.buttons.quickMenu;

        // Icons
        document.getElementById("settings-page-home-icon-button").checked =
          settings.topNav.icons.home;
        document.getElementById("settings-page-mail-icon-button").checked =
          settings.topNav.icons.mail;
        document.getElementById(
          "settings-page-notifications-icon-button"
        ).checked = settings.topNav.icons.notifications;
        document.getElementById("settings-page-settings-icon-button").checked =
          settings.topNav.icons.settings;
        break;
      }

      case "widgets": {
        // De Lijn
        document.getElementById(
          "settings-page-delijn-monochrome-button"
        ).checked = settings.widgets.delijn.monochrome;

        document.getElementById("settings-page-max-busses-slider").value =
          settings.widgets.delijn.maxBusses;
        document.querySelector(
          "#settings-page-max-busses-slider + .settings-page-live-value"
        ).innerText = settings.widgets.delijn.maxBusses;

        // Assignments
        document.getElementById("settings-page-max-assignments-slider").value =
          settings.widgets.assignments.maxAssignments;
        document.querySelector(
          "#settings-page-max-assignments-slider + .settings-page-live-value"
        ).innerText = settings.widgets.assignments.maxAssignments;

        // Snake
        document.getElementById(
          "settings-page-show-snake-grid-button"
        ).checked = settings.widgets.games.snake.enableGrid;
        break;
      }

      case "other": {
        // Performance mode
        document.getElementById(
          "settings-page-performance-mode-button"
        ).checked = settings.other.performanceMode;

        // Splash-text
        document.getElementById("settings-page-splash-text-button").checked =
          settings.other.splashText;

        // Discord button
        document.getElementById("settings-page-discord-button").checked =
          settings.other.discordButton;

        // Keybindings
        document.getElementById("settings-page-quick-menu-keybinding").value =
          settings.other.keybinds.dmenu;
        document.getElementById("settings-page-widget-edit-keybinding").value =
          settings.other.keybinds.widgetEditMode;
        document.getElementById("settings-widget-bag-keybinding").value =
          settings.other.keybinds.widgetBag;
        document.getElementById("settings-page-settings-keybinding").value =
          settings.other.keybinds.settings;
        document.getElementById("settings-page-gc-keybinding").value =
          settings.other.keybinds.gc;
        break;
      }

      default:
        break;
    }
  }
  async storePage() {
    const settings = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });
    let previousSettings = structuredClone(settings);
    switch (this.currentPage) {
      case "profile": {
        settings.profile.username = document.getElementById(
          "settings-page-username-input"
        ).value;

        applyProfile(settings.profile);
        break;
      }

      case "appearance": {
        // Theme
        let selectedTheme = document.querySelector(
          ".settings-page-theme-card:has(input[type='radio']:checked)"
        );
        if (selectedTheme) {
          settings.appearance.theme = selectedTheme.dataset.theme;
        }
        if (previousSettings.appearance.theme == "custom") {
          await storeCustomThemeDataV2();
        }

        // Blur slider
        let blurValue = document.getElementById(
          "settings-page-blur-slider"
        ).value;
        settings.appearance.background.blur = blurValue / 10;

        // Weather overlay
        let chosenWeather = document.querySelector(
          ".settings-page-weather-overlay-container input:checked"
        );
        if (chosenWeather) {
          settings.appearance.weatherOverlay.type =
            chosenWeather.closest("[data-weather]").dataset.weather;
        }

        settings.appearance.weatherOverlay.amount = document.getElementById(
          "settings-page-weather-overlay-slider"
        ).value;

        settings.appearance.weatherOverlay.opacity =
          document.getElementById(
            "settings-page-weather-overlay-opacity-slider"
          ).value / 100;

        // Tab icon
        settings.appearance.tabLogo = document.getElementById(
          "settings-page-smpp-icon-button"
        ).checked
          ? "smpp"
          : "sm";

        // News
        settings.appearance.news = document.getElementById(
          "settings-page-show-news-button"
        ).checked;

        applyAppearance(settings.appearance);
        if (
          JSON.stringify(settings.appearance.weatherOverlay) !=
            JSON.stringify(previousSettings.appearance.weatherOverlay) &&
          !liteMode
        ) {
          applyWeatherEffects(settings.appearance.weatherOverlay);
        }
        break;
      }

      case "topNav": {
        settings.topNav.switchCoursesAndLinks = document.getElementById(
          "settings-page-swap-courses-button"
        ).checked;

        // Buttons
        if (isGOSchool)
          settings.topNav.buttons.GO = document.getElementById(
            "settings-page-go-button"
          ).checked;
        settings.topNav.buttons.GC = document.getElementById(
          "settings-page-global-chat-button"
        ).checked;
        settings.topNav.buttons.search = document.getElementById(
          "settings-page-search-button"
        ).checked;
        settings.topNav.buttons.quickMenu = document.getElementById(
          "settings-page-quick-menu-button"
        ).checked;

        // Icons
        settings.topNav.icons.home = document.getElementById(
          "settings-page-home-icon-button"
        ).checked;
        settings.topNav.icons.mail = document.getElementById(
          "settings-page-mail-icon-button"
        ).checked;
        settings.topNav.icons.notifications = document.getElementById(
          "settings-page-notifications-icon-button"
        ).checked;
        settings.topNav.icons.settings = document.getElementById(
          "settings-page-settings-icon-button"
        ).checked;

        applyTopNav(settings.topNav);
        break;
      }

      case "widgets": {
        settings.widgets.delijn.monochrome = document.getElementById(
          "settings-page-delijn-monochrome-button"
        ).checked;

        settings.widgets.delijn.maxBusses = parseInt(
          document.getElementById("settings-page-max-busses-slider").value,
          10
        );

        if (
          settings.widgets.delijn.maxBusses !=
          previousSettings.widgets.delijn.maxBusses
        ) {
          this.addDisclaimer(
            document.querySelector(
              ".settings-page-slider-container:has(#settings-page-max-busses-slider)"
            )
          );
        }

        settings.widgets.assignments.maxAssignments = parseInt(
          document.getElementById("settings-page-max-assignments-slider").value,
          10
        );

        if (
          settings.widgets.assignments.maxAssignments !=
          previousSettings.widgets.assignments.maxAssignments
        ) {
          this.addDisclaimer(
            document.querySelector(
              ".settings-page-slider-container:has(#settings-page-max-assignments-slider)"
            )
          );
        }

        settings.widgets.games.snake.enableGrid = document.getElementById(
          "settings-page-show-snake-grid-button"
        ).checked;

        applyWidgets(settings.widgets);
        break;
      }

      case "other": {
        settings.other.performanceMode = document.getElementById(
          "settings-page-performance-mode-button"
        ).checked;

        settings.other.splashText = document.getElementById(
          "settings-page-splash-text-button"
        ).checked;

        settings.other.discordButton = document.getElementById(
          "settings-page-discord-button"
        ).checked;

        // Keybindings
        settings.other.keybinds.dmenu = document.getElementById(
          "settings-page-quick-menu-keybinding"
        ).value;
        settings.other.keybinds.widgetEditMode = document.getElementById(
          "settings-page-widget-edit-keybinding"
        ).value;
        settings.other.keybinds.widgetBag = document.getElementById(
          "settings-widget-bag-keybinding"
        ).value;
        settings.other.keybinds.settings = document.getElementById(
          "settings-page-settings-keybinding"
        ).value;
        settings.other.keybinds.gc = document.getElementById(
          "settings-page-gc-keybinding"
        ).value;

        applyOther(settings.other);
        break;
      }

      default:
        break;
    }
    console.log("Storing settings: ", settings);
    await browser.runtime.sendMessage({
      action: "setSettingsData",
      data: settings,
    });
    await this.loadPage();
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

    const createKeybindInput = (id, text) => {
      const container = document.createElement("div");
      container.classList.add("settings-page-key-bind-container");

      let label = document.createElement("span");
      label.classList.add("settings-page-button-label");
      label.innerText = text;

      let button = createButton(id);
      button.classList.add("settings-page-button");

      const input = document.createElement("input");
      input.id = id;
      input.type = "text";
      input.readOnly = true; // prevent manual typing
      input.spellcheck = false;
      input.classList.add("settings-page-keybinding-input");
      input.value = "None";

      let listening = false;

      input.addEventListener("click", () => {
        if (listening) return;
        listening = true;
        input.value = "Press any key...";
        input.classList.add("listening");

        const keyListener = async (e) => {
          e.preventDefault();
          listening = false;
          input.classList.remove("listening");

          // handle special keys (like " " → "Space")
          let keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
          if (keyName === " ") keyName = "Space";
          if (keyName === "Escape") keyName = "None";

          input.value = keyName;
          document.removeEventListener("keydown", keyListener);
          await this.storePage();
        };

        document.addEventListener("keydown", keyListener);
      });
      container.appendChild(label);
      container.appendChild(input);

      return container;
    };

    //TODO: use function in ui.js (classes need to be added and or css needs to be changed)
    function createSettingsButtonWithLabel(id, text) {
      let container = createButtonWithLabel(id, text);
      container.classList.add("settings-page-button-label-container");
      return container;
    }

    function createImageButton(src, width = "80px", height = "80px", name, id) {
      let wrapper = document.createElement("label");
      wrapper.classList.add("settings-page-image-button-wrapper");
      wrapper.style.width = width;
      wrapper.style.height = height;

      let input = document.createElement("input");
      input.type = "radio";
      input.name = name;

      if (id) input.id = id;

      let image = document.createElement("img");
      image.classList.add("settings-page-image");
      image.src = getExtensionImage(src);
      image.width = width;

      wrapper.appendChild(input);
      wrapper.appendChild(image);

      return wrapper;
    }

    function createImageButtonWithLabel(
      src,
      text,
      width = "80px",
      height = "80px",
      name,
      id
    ) {
      let container = document.createElement("label");
      container.classList.add("settings-page-image-button-label");
      container.for = id;
      let imageButton = createImageButton(src, width, height, name, id);
      let imageButtonLabel = document.createElement("span");
      imageButtonLabel.innerText = text;
      container.appendChild(imageButton);
      container.appendChild(imageButtonLabel);
      return container;
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

    function createLabeledSlider(min, max, id, text, showValue = true) {
      let container = document.createElement("div");
      container.classList.add("settings-page-slider-container");
      let textContainer = document.createElement("span");
      textContainer.classList.add("settings-page-slider-label");
      textContainer.innerText = text;
      let slider = createSlider(min, max, id);
      slider.classList.add("settings-page-labeled-slider");
      if (showValue)
        slider.addEventListener("input", (event) => {
          document.querySelector(
            "#" + event.target.id + " ~ .settings-page-live-value"
          ).innerText = event.target.value;
        });
      let currentValue = document.createElement("span");
      currentValue.classList.add("settings-page-live-value");
      currentValue.innerText = min;

      container.appendChild(textContainer);
      container.appendChild(slider);
      if (showValue) container.appendChild(currentValue);

      return container;
    }

    function createImage(src, width, height) {
      let image = document.createElement("img");
      image.classList.add("settings-page-image");
      image.src = getExtensionImage(src);
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
        this.settingsPage.appendChild(createMainTitle("Profile"));
        this.settingsPage.appendChild(createSectionTitle("Custom name"));
        this.settingsPage.appendChild(
          createDescription("Edit your username, displayed at the top left")
        );
        this.settingsPage.appendChild(
          createTextInput("settings-page-username-input", "Username")
        );
        this.settingsPage.appendChild(createSectionTitle("Profile Picture"));
        this.settingsPage.appendChild(
          createDescription(
            isFirefox
              ? "Upload your own profile picture, large files not recommended on Firefox"
              : "Upload your own profile picture"
          )
        );
        this.profilePictureInput = new ImageSelector("profilePicture");
        this.profilePictureInput.loadImageData();
        this.profilePictureInput.onStore = () => {
          this.storePage();
          applyProfilePicture();
          this.addDisclaimer(
            document.getElementById("profile-picture-input-container"),
            `
              * Some changes will only apply after 
              <a class="settings-page-disclaimer-button" href="#" onclick="window.location.href = window.location.href; return false;">reload</a>
            `
          );
        };
        let profilePictureInputContainer =
          this.profilePictureInput.createFullFileInput();
        profilePictureInputContainer.id = "profile-picture-input-container";
        this.settingsPage.appendChild(profilePictureInputContainer);

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
          if (!themes[key]["display-name"].startsWith("__")) {
            // Don't include hidden themes
            let themeCard = document.createElement("label"); // use <label> to make radio clickable
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
              "--background-placeholder-color",
              themes[key]["--color-base02"]
            );
            themeCard.style.setProperty(
              "--text-color",
              themes[key]["--color-text"]
            );
            themeCard.dataset.theme = key;

            // hidden radio
            let themeRadio = document.createElement("input");
            themeRadio.type = "radio";
            themeRadio.name = "theme-choice";
            themeRadio.value = key;
            themeRadio.style.display = "none";

            let themeImage = createImage(
              "/theme-backgrounds/" + key + ".jpg",
              "100%",
              "6rem"
            );

            let themeTitle = document.createElement("span");
            themeTitle.classList.add("settings-page-theme-title");
            themeTitle.innerText = themes[key]["display-name"];

            // build card
            themeCard.appendChild(themeRadio);
            themeCard.appendChild(themeImage);
            themeCard.appendChild(themeTitle);
            themesContainer.appendChild(themeCard);
          }
        });
        this.settingsPage.appendChild(themesContainer);

        this.settingsPage.appendChild(createCustomThemeUIV2());
        this.settingsPage.appendChild(createSectionTitle("Wallpaper"));
        this.settingsPage.appendChild(
          createDescription("Personalize your backdrop with a custom image.")
        );

        this.backgroundImageSelector = new ImageSelector("backgroundImage");
        this.backgroundImageSelector.loadImageData();
        this.backgroundImageSelector.onStore = () => {
          this.storePage();
        };

        this.settingsPage.appendChild(
          this.backgroundImageSelector.createFullFileInput()
        );

        this.settingsPage.appendChild(createSectionTitle("Background blur"));
        this.settingsPage.appendChild(
          createDescription("Apply a blur to your background.")
        );

        this.settingsPage.appendChild(
          createSlider(0, 100, "settings-page-blur-slider") // must be divided by 10
          // for real value
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
        let weatherIconsContainer = document.createElement("div");
        weatherIconsContainer.classList.add(
          "settings-page-icons-container",
          "settings-page-weather-overlay-container"
        );
        let rainBtn = createImageButtonWithLabel(
          "/icons/weather-overlay/raindropfancy.svg",
          "Rain",
          "5rem",
          "5rem",
          "weather",
          "settings-page-raindrop-button"
        );
        rainBtn.dataset.weather = "rain";
        weatherIconsContainer.appendChild(rainBtn);

        let realtimeBtn = createImageButtonWithLabel(
          "/icons/weather-overlay/realtimefancy.svg",
          "Realtime",
          "5rem",
          "5rem",
          "weather",
          "settings-page-realtime-button"
        );
        realtimeBtn.dataset.weather = "realtime";
        weatherIconsContainer.appendChild(realtimeBtn);

        let snowBtn = createImageButtonWithLabel(
          "/icons/weather-overlay/snowflakefancy.svg",
          "Snow",
          "5rem",
          "5rem",
          "weather",
          "settings-page-snow-button"
        );
        snowBtn.dataset.weather = "snow";
        weatherIconsContainer.appendChild(snowBtn);

        this.settingsPage.appendChild(weatherIconsContainer);

        this.settingsPage.appendChild(
          createLabeledSlider(
            0,
            500,
            "settings-page-weather-overlay-slider",
            "Amount",
            false
          )
        );
        this.settingsPage.appendChild(
          createLabeledSlider(
            0,
            100,
            "settings-page-weather-overlay-opacity-slider",
            "Opacity",
            false
          )
        );
        this.settingsPage.appendChild(createSectionTitle("Icon"));
        this.settingsPage.appendChild(
          createDescription("Choose the icon displayed in your browser tab.")
        );

        let iconsContainer = document.createElement("div");
        iconsContainer.classList.add("settings-page-icons-container");
        iconsContainer.appendChild(
          createImageButton(
            "/icons/sm-icon.svg",
            "5rem",
            "5rem",
            "logo",
            "settings-page-default-icon-button"
          )
        );
        iconsContainer.appendChild(
          createImageButton(
            "/icons/smpp/128.png",
            "5rem",
            "5rem",
            "logo",
            "settings-page-smpp-icon-button"
          )
        );
        this.settingsPage.appendChild(iconsContainer);

        this.settingsPage.appendChild(createSectionTitle("News"));
        this.settingsPage.appendChild(
          createDescription("Change the homepage news configuration.")
        );
        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-show-news-button",
            "Show news"
          )
        );

        break;
      case "topNav":
        this.settingsPage.appendChild(createMainTitle("Navigation"));
        this.settingsPage.appendChild(createSectionTitle("Buttons"));
        this.settingsPage.appendChild(
          createDescription(
            "Choose which buttons you want to see in the top navigation."
          )
        );
        if (!liteMode) {
          this.settingsPage.appendChild(
            createSettingsButtonWithLabel(
              "settings-page-global-chat-button",
              "Global Chat"
            )
          );
        }

        this.settingsPage.appendChild(
          createSettingsButtonWithLabel("settings-page-search-button", "Search")
        );

        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-quick-menu-button",
            "Quick Menu"
          )
        );

        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-swap-courses-button",
            "Swap courses/links"
          )
        );

        if (isGOSchool)
          this.settingsPage.appendChild(
            createSettingsButtonWithLabel("settings-page-go-button", "GO")
          );

        this.settingsPage.appendChild(createSectionTitle("Icons"));
        this.settingsPage.appendChild(
          createDescription(
            "Choose which buttons you want to replace with icons."
          )
        );

        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-home-icon-button",
            "Start"
          )
        );
        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-mail-icon-button",
            "Mail"
          )
        );
        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-notifications-icon-button",
            "Notifications"
          )
        );
        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-settings-icon-button",
            "Settings"
          )
        );

        break;
      case "widgets":
        this.settingsPage.appendChild(createMainTitle("Widgets"));

        this.settingsPage.appendChild(createSectionTitle("De Lijn"));
        this.settingsPage.appendChild(
          createDescription("Change the De Lijn app configuration.")
        );
        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-delijn-monochrome-button",
            "Monochrome"
          )
        );
        this.settingsPage.appendChild(
          createLabeledSlider(
            1,
            10,
            "settings-page-max-busses-slider",
            "Max busses"
          )
        );

        this.settingsPage.appendChild(createSectionTitle("Assignments"));
        this.settingsPage.appendChild(
          createDescription("Change the assignments app configuration.")
        );
        this.settingsPage.appendChild(
          createLabeledSlider(
            1,
            10,
            "settings-page-max-assignments-slider",
            "Max assignments"
          )
        );

        this.settingsPage.appendChild(createMainTitle("Games"));
        this.settingsPage.appendChild(createSectionTitle("Snake"));
        this.settingsPage.appendChild(
          createDescription("Change configuration of Snake++")
        );
        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-show-snake-grid-button",
            "Grid"
          )
        );

        break;
      case "other":
        this.settingsPage.appendChild(createMainTitle("Other"));
        this.settingsPage.appendChild(createSectionTitle("Performance"));
        this.settingsPage.appendChild(
          createDescription(
            "Disables animations for better performance on low end devices."
          )
        );

        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-performance-mode-button",
            "Performance mode"
          )
        );

        this.settingsPage.appendChild(createSectionTitle("Login"));
        this.settingsPage.appendChild(
          createDescription("Change the login page configuration.")
        );
        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-splash-text-button",
            "Splash-text"
          )
        );

        this.settingsPage.appendChild(createSectionTitle("Homepage"));
        this.settingsPage.appendChild(
          createDescription("Change the home page configuration.")
        );
        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-discord-button",
            "Discord button"
          )
        );

        this.settingsPage.appendChild(createSectionTitle("Keybindings"));
        this.settingsPage.appendChild(
          createDescription("Customize your keybindings")
        );

        this.settingsPage.appendChild(
          createKeybindInput(
            "settings-page-quick-menu-keybinding",
            "Quick Menu"
          )
        );
        this.settingsPage.appendChild(
          createKeybindInput(
            "settings-page-widget-edit-keybinding",
            "Widget editing"
          )
        );
        this.settingsPage.appendChild(
          createKeybindInput("settings-widget-bag-keybinding", "Widget bag")
        );
        this.settingsPage.appendChild(
          createKeybindInput("settings-page-settings-keybinding", "Settings")
        );
        this.settingsPage.appendChild(
          createKeybindInput("settings-page-gc-keybinding", "Global Chat")
        );

        this.settingsPage.appendChild(createSectionTitle("Reset"));
        this.settingsPage.appendChild(
          createDescription(
            "Reset all settings and widgets to their default values."
          )
        );
        let resetButton = document.createElement("button");
        resetButton.innerText = "Reset to Defaults";
        resetButton.classList.add("settings-page-reset-button");
        resetButton.addEventListener("click", () => this.resetSettings());
        this.settingsPage.appendChild(resetButton);
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
    await settingsWindow.loadPage();
  }
  settingsWindow.show(event);
  settingsWindow.loadPage();
}

function createSettingsButton() {
  const SettingsButton = document.createElement("button");
  SettingsButton.id = "somebutton";
  SettingsButton.className = "topnav__btn";
  SettingsButton.innerHTML = "SettingsV2";
  SettingsButton.addEventListener("click", (e) => openSettingsWindow(e));
  return SettingsButton;
}

//TEMP BEFORE THEME UPDATE!!!!

function createCustomThemeUIV2() {
  const colorpickers = document.createElement("div");
  colorpickers.id = "colorpickersforsettingspage";
  colorpickers.innerHTML = colorpickersHTMLV2;
  return colorpickers;
}

async function loadCustomThemeDataV2() {
  const themeData = await browser.runtime.sendMessage({
    action: "getCustomThemeData",
  });
  customTheme = themeData;
  themeCard = document.querySelector(
    `.settings-page-theme-card[data-theme="custom"]`
  );
  themeCard.style.setProperty("--hover-border", themeData.color_accent);
  themeCard.style.setProperty("--hover-color", themeData.color_base01);
  themeCard.style.setProperty("--text-color", themeData.color_text);
  themeCard.style.setProperty(
    "--background-placeholder-color",
    themeData.color_base02
  );
  document.getElementById("settings-colorPicker1").value =
    themeData.color_base00;
  document.getElementById("settings-colorPicker2").value =
    themeData.color_base01;
  document.getElementById("settings-colorPicker3").value =
    themeData.color_base02;
  document.getElementById("settings-colorPicker4").value =
    themeData.color_base03;
  document.getElementById("settings-colorPicker5").value =
    themeData.color_accent;
  document.getElementById("settings-colorPicker6").value = themeData.color_text;
}

async function storeCustomThemeDataV2() {
  await browser.runtime.sendMessage({
    action: "setCustomThemeData",
    data: {
      color_base00: document.getElementById("settings-colorPicker1").value,
      color_base01: document.getElementById("settings-colorPicker2").value,
      color_base02: document.getElementById("settings-colorPicker3").value,
      color_base03: document.getElementById("settings-colorPicker4").value,
      color_accent: document.getElementById("settings-colorPicker5").value,
      color_text: document.getElementById("settings-colorPicker6").value,
    },
  });
}
