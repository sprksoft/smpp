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
    let settingsSideBar = this.createSettingsSideBar();
    this.settingsPage = document.createElement("div");
    this.settingsPage.id = "settings-page";

    content.classList.add("settingsWindow");
    content.appendChild(await settingsSideBar);
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
    categoryButtonIcon.src = getImage("settings-icons/" + category + ".webp");
    categoryButton.prepend(categoryButtonIcon);
    return categoryButton;
  }

  clearSettingsPage() {
    this.settingsPage.innerHTML = " ";
  }

  storePage(page) {
    return 1;
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
        if (settings.profile.username) {
          usernameInput.value = settings.profile.username;
        }

        let profilePic = document.getElementById(
          "settings-page-profile-picture"
        );
        if (settings.profile.profilePicture) {
          profilePic.src = settings.profile.profilePicture;
        }
        break;
      }

      case "appearance": {
        // Theme
        document
          .querySelectorAll(".settings-page-theme-card")
          .forEach((card) => {
            if (card.dataset.theme) {
              card.classList.toggle(
                "active",
                card.dataset.theme === settings.appearance.theme
              );
            }
          });

        // Background link
        document.getElementById("settings-page-background-link-input").value =
          settings.appearance.background.link || "";

        // Blur slider
        document.getElementById("settings-page-blur-slider").value =
          settings.appearance.background.blur * 10;

        // Blur preview
        document.querySelector(
          ".blurred-image-container img"
        ).style.filter = `blur(${settings.appearance.background.blur}px)`;

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
        // Buttons
        document.getElementById("settings-page-go-button").checked =
          settings.topNav.enableGOButton;
        document.getElementById("settings-page-global-chat-button").checked =
          settings.topNav.enableGCButton;
        document.getElementById("settings-page-search-button").checked =
          settings.topNav.enableSearchButton;
        document.getElementById("settings-page-quick-menu-button").checked =
          settings.topNav.enableQuickMenuButton;
        document.getElementById("settings-page-swap-courses-button").checked =
          settings.topNav.switchCoursesAndLinks;

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
          settings.appearance.splashText;

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

    function createImageButtonWithLabel(
      src,
      text,
      width = "80px",
      height = "80px",
      id
    ) {
      let container = document.createElement("label");
      container.classList.add("settings-page-button-label");
      container.for = id;
      let imageButton = createImageButton(src, width, height, id);
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
      case "test":
        this.settingsPage.appendChild(
          createImageButtonWithLabel(
            "/theme-backgrounds/birb.jpg",
            "aaaaa",
            "50px",
            "50px",
            "profile-imgbtnaa"
          )
        );
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
        let weatherIconsContainer = document.createElement("div");
        weatherIconsContainer.classList.add(
          "settings-page-icons-container",
          "settings-page-weather-overlay-container"
        );
        weatherIconsContainer.appendChild(
          createImageButtonWithLabel(
            "/icons/weather-overlay/raindropfancy.svg",
            "Rain",
            "5rem",
            "5rem",
            "settings-page-raindrop-button"
          )
        );
        weatherIconsContainer.appendChild(
          createImageButtonWithLabel(
            "/icons/weather-overlay/realtimefancy.svg",
            "Realtime",
            "5rem",
            "5rem",
            "settings-page-realtime-button"
          )
        );
        weatherIconsContainer.appendChild(
          createImageButtonWithLabel(
            "/icons/weather-overlay/snowflakefancy.svg",
            "Snow",
            "5rem",
            "5rem",
            "settings-page-snow-button"
          )
        );
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
            "settings-page-default-icon-button"
          )
        );
        iconsContainer.appendChild(
          createImageButton(
            "/icons/smpp128.png",
            "5rem",
            "5rem",
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
