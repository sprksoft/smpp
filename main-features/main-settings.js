class SettingsWindow extends BaseWindow {
  settingsSideBarCategories = {
    appearance: {
      name: "Appearance",
    },
    topNav: { name: "Navigation" },
    features: { name: "Apps" },
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
    await this.loadPage();
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
    profileSettingsLabelTitle.classList.add("profile-settings-label-title");
    profileSettingsLabelTitle.innerText = String(
      data.profile.username || getOriginalName()
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
    categoryButtonIcon.src = getImage("settings-icons/" + imageFileName);
    categoryButton.prepend(categoryButtonIcon);
    return categoryButton;
  }

  clearSettingsPage() {
    this.settingsPage.innerHTML = " ";
  }

  async loadPage() {
    let settings = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });

    switch (this.currentPage) {
      case "profile": {
        let usernameInput = document.getElementById(
          "settings-page-username-input"
        );
        if (usernameInput && settings.profile.username) {
          usernameInput.value = settings.profile.username;
        }

        let profilePic = document.getElementById(
          "settings-page-profile-picture"
        );
        if (profilePic && settings.profile.profilePicture) {
          profilePic.src = settings.profile.profilePicture;
        }
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

        // Background link
        document.getElementById("settings-page-background-link-input").value =
          settings.appearance.background.link || "";
        document
          .getElementById("settings-page-link-clear-button")
          .classList.remove("active");
        if (settings.appearance.background.link != "")
          document
            .getElementById("settings-page-link-clear-button")
            .classList.add("active");
        document.getElementById("settings-page-background-file-input").value =
          null;

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

        // Tab icon
        document.getElementById("settings-page-default-icon-button").checked =
          settings.appearance.tabLogo == "sm";
        document.getElementById("settings-page-smpp-icon-button").checked =
          settings.appearance.tabLogo == "smpp";
        break;
      }

      case "topNav": {
        document.getElementById("settings-page-swap-courses-button").checked =
          settings.topNav.switchCoursesAndLinks;

        // Buttons
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

      case "features": {
        // News
        document.getElementById("settings-page-show-news-button").checked =
          settings.features.news;

        // Splash-text
        document.getElementById("settings-page-splash-text-button").checked =
          settings.features.splashText;

        // De Lijn
        document.getElementById(
          "settings-page-delijn-monochrome-button"
        ).checked = settings.features.delijn.monochrome;

        document.getElementById("settings-page-max-busses-slider").value =
          settings.features.delijn.maxBusses;
        document.querySelector(
          "#settings-page-max-busses-slider + .settings-page-live-value"
        ).innerText = settings.features.delijn.maxBusses;

        // Assignments
        document.getElementById("settings-page-max-assignments-slider").value =
          settings.features.assignments.maxAssignments;
        document.querySelector(
          "#settings-page-max-assignments-slider + .settings-page-live-value"
        ).innerText = settings.features.assignments.maxAssignments;

        // Weather
        document.getElementById("settings-page-sync-weather-button").checked =
          settings.features.weather.syncWeather;

        // Snake
        document.getElementById(
          "settings-page-show-snake-grid-button"
        ).checked = settings.features.games.snake.enableGrid;
        break;
      }

      case "other": {
        // Performance mode
        document.getElementById(
          "settings-page-performance-mode-button"
        ).checked = settings.other.performanceMode;
        break;
      }

      default:
        break;
    }
  }
  async storePage() {
    const data = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });
    let previousData = structuredClone(data);
    switch (this.currentPage) {
      case "profile": {
        break;
      }

      case "appearance": {
        // Theme
        let selectedTheme = document.querySelector(
          ".settings-page-theme-card:has(input[type='radio']:checked)"
        );
        if (selectedTheme) {
          data.appearance.theme = selectedTheme.dataset.theme;
        }

        // Background link
        data.appearance.background.link = document.getElementById(
          "settings-page-background-link-input"
        ).value;

        // File Saving
        let file = document.getElementById(
          "settings-page-background-file-input"
        ).files[0];
        if (file) {
          const reader = new FileReader();
          const imageData = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          await browser.runtime.sendMessage({
            action: "saveBackgroundImage",
            data: imageData,
          });

          data.appearance.background.selection = "file";
          data.appearance.background.link = file.name;
        } else {
          if (data.appearance.background.link == "") {
            data.appearance.background.selection = "default";
          } else if (
            data.appearance.background.link !=
            previousData.appearance.background.link
          ) {
            data.appearance.background.selection = "link";
          }
        }

        // Blur slider
        let blurValue = document.getElementById(
          "settings-page-blur-slider"
        ).value;
        data.appearance.background.blur = blurValue / 10;

        // Weather overlay
        let chosenWeather = document.querySelector(
          ".settings-page-weather-overlay-container input:checked"
        );
        if (chosenWeather) {
          data.appearance.weatherOverlay.type =
            chosenWeather.closest("[data-weather]").dataset.weather;
        }

        data.appearance.weatherOverlay.amount = document.getElementById(
          "settings-page-weather-overlay-slider"
        ).value;

        // Tab icon
        data.appearance.tabLogo = document.getElementById(
          "settings-page-smpp-icon-button"
        ).checked
          ? "smpp"
          : "sm";
        break;
      }

      case "topNav": {
        data.topNav.switchCoursesAndLinks = document.getElementById(
          "settings-page-swap-courses-button"
        ).checked;

        // Buttons
        data.topNav.buttons.GO = document.getElementById(
          "settings-page-go-button"
        ).checked;
        data.topNav.buttons.GC = document.getElementById(
          "settings-page-global-chat-button"
        ).checked;
        data.topNav.buttons.search = document.getElementById(
          "settings-page-search-button"
        ).checked;
        data.topNav.buttons.quickMenu = document.getElementById(
          "settings-page-quick-menu-button"
        ).checked;

        // Icons
        data.topNav.icons.home = document.getElementById(
          "settings-page-home-icon-button"
        ).checked;
        data.topNav.icons.mail = document.getElementById(
          "settings-page-mail-icon-button"
        ).checked;
        data.topNav.icons.notifications = document.getElementById(
          "settings-page-notifications-icon-button"
        ).checked;
        data.topNav.icons.settings = document.getElementById(
          "settings-page-settings-icon-button"
        ).checked;
        break;
      }

      case "features": {
        data.features.news = document.getElementById(
          "settings-page-show-news-button"
        ).checked;

        data.features.splashText = document.getElementById(
          "settings-page-splash-text-button"
        ).checked;

        data.features.delijn.monochrome = document.getElementById(
          "settings-page-delijn-monochrome-button"
        ).checked;

        data.features.delijn.maxBusses = parseInt(
          document.getElementById("settings-page-max-busses-slider").value,
          10
        );

        data.features.assignments.maxAssignments = parseInt(
          document.getElementById("settings-page-max-assignments-slider").value,
          10
        );

        data.features.weather.syncWeather = document.getElementById(
          "settings-page-sync-weather-button"
        ).checked;

        data.features.games.snake.enableGrid = document.getElementById(
          "settings-page-show-snake-grid-button"
        ).checked;
        break;
      }

      case "other": {
        data.other.performanceMode = document.getElementById(
          "settings-page-performance-mode-button"
        ).checked;
        break;
      }

      default:
        break;
    }
    console.log(data);
    await browser.runtime.sendMessage({
      action: "setSettingsData",
      data: data,
    });
    await this.loadPage();
    await apply();
  }

  async resetSettings() {
    // Create confirmation popup
    const popup = document.createElement("div");
    popup.classList.add("reset-confirmation-popup");
    popup.innerHTML = `
      <div class="reset-popup-content">
        <h3>Reset Settings</h3>
        <p>Are you sure you want to reset all settings to defaults? This will delete all your customizations and cannot be undone.</p>
        <div class="reset-popup-buttons">
          <button class="reset-popup-cancel">Cancel</button>
          <button class="reset-popup-confirm">Reset</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    return new Promise((resolve) => {
      popup.querySelector(".reset-popup-cancel").addEventListener("click", () => {
        popup.remove();
        resolve(false);
      });

      popup.querySelector(".reset-popup-confirm").addEventListener("click", async () => {
        popup.remove();
        const defaults = await browser.runtime.sendMessage({ action: "getSettingsDefaults" });
        await browser.runtime.sendMessage({ action: "setSettingsData", data: defaults });
        await browser.runtime.sendMessage({ action: "setWidgetData", widgetData: null });
        await apply();
        // Refresh the page to apply all changes
        window.location.reload();
        resolve(true);
      });
    });
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

    function createButtonWithLabel(id, text) {
      let container = document.createElement("label");
      container.classList.add("settings-page-button-label-container");
      container.for = id;

      let label = document.createElement("span");
      label.classList.add("settings-page-button-label");
      label.innerText = text;
      let button = createButton(id);
      container.appendChild(label);
      container.appendChild(button);
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
      image.src = getImage(src);
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
      container.classList.add("settings-page-button-label");
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

        this.settingsPage.appendChild(createSectionTitle("Wallpaper"));
        this.settingsPage.appendChild(
          createDescription("Personalize your backdrop with a custom image.")
        );

        let selectionContainer = document.createElement("div");
        selectionContainer.classList.add(
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

        clearButton.addEventListener("click", async (event) => {
          event.target
            .closest(".smpp-link-clear-button")
            .classList.remove("active");
          document.getElementById("settings-page-background-link-input").value =
            "";

          await this.storePage();
        });

        const linkInput = createTextInput(
          "settings-page-background-link-input"
        );
        linkInput.placeholder = "Link";

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

        selectionContainer.appendChild(linkInput);
        selectionContainer.appendChild(fileBtn);
        selectionContainer.appendChild(clearButton);
        selectionContainer.appendChild(backgroundFileInput);

        this.settingsPage.appendChild(selectionContainer);

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
            "/icons/smpp128.png",
            "5rem",
            "5rem",
            "logo",
            "settings-page-smpp-icon-button"
          )
        );
        this.settingsPage.appendChild(iconsContainer);
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
            createButtonWithLabel(
              "settings-page-global-chat-button",
              "Global Chat"
            )
          );
        }

        this.settingsPage.appendChild(
          createButtonWithLabel("settings-page-search-button", "Search")
        );

        this.settingsPage.appendChild(
          createButtonWithLabel("settings-page-quick-menu-button", "Quick Menu")
        );

        this.settingsPage.appendChild(
          createButtonWithLabel(
            "settings-page-swap-courses-button",
            "Swap courses/links"
          )
        );

        if (document.body.classList.contains("go")) {
          this.settingsPage.appendChild(
            createButtonWithLabel("settings-page-go-button", "GO")
          );
        }

        this.settingsPage.appendChild(createSectionTitle("Icons"));
        this.settingsPage.appendChild(
          createDescription(
            "Choose witch buttons you want to replace with icons."
          )
        );

        this.settingsPage.appendChild(
          createButtonWithLabel("settings-page-home-icon-button", "Start")
        );
        this.settingsPage.appendChild(
          createButtonWithLabel("settings-page-mail-icon-button", "Mail")
        );
        this.settingsPage.appendChild(
          createButtonWithLabel(
            "settings-page-notifications-icon-button",
            "Notifications"
          )
        );
        this.settingsPage.appendChild(
          createButtonWithLabel(
            "settings-page-settings-icon-button",
            "Settings"
          )
        );

        break;
      case "features":
        this.settingsPage.appendChild(createMainTitle("Features"));
        this.settingsPage.appendChild(createSectionTitle("News"));
        this.settingsPage.appendChild(
          createDescription("Change the homepage news configuration.")
        );
        this.settingsPage.appendChild(
          createButtonWithLabel("settings-page-show-news-button", "Show news")
        );

        this.settingsPage.appendChild(createSectionTitle("Login"));
        this.settingsPage.appendChild(
          createDescription("Change the login page configuration.")
        );
        this.settingsPage.appendChild(
          createButtonWithLabel(
            "settings-page-splash-text-button",
            "Splash-text"
          )
        );

        this.settingsPage.appendChild(createMainTitle("Widgets"));

        this.settingsPage.appendChild(createSectionTitle("De Lijn"));
        this.settingsPage.appendChild(
          createDescription("Change the De Lijn app configuration.")
        );
        this.settingsPage.appendChild(
          createButtonWithLabel(
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
        this.settingsPage.appendChild(createSectionTitle("Weather"));
        this.settingsPage.appendChild(
          createDescription("Change the weather app configuration.")
        );
        this.settingsPage.appendChild(
          createButtonWithLabel(
            "settings-page-sync-weather-button",
            "Sync weather"
          )
        );

        this.settingsPage.appendChild(createMainTitle("Games"));
        this.settingsPage.appendChild(createSectionTitle("Snake"));
        this.settingsPage.appendChild(
          createDescription("Change configuration of Snake++")
        );
        this.settingsPage.appendChild(
          createButtonWithLabel("settings-page-show-snake-grid-button", "Grid")
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
          createButtonWithLabel(
            "settings-page-performance-mode-button",
            "Performance mode"
          )
        );

        this.settingsPage.appendChild(createSectionTitle("Reset"));
        this.settingsPage.appendChild(
          createDescription(
            "Reset all settings and widgets to their default values. This cannot be undone."
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
