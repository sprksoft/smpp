// @ts-nocheck
import { BaseWindow } from "../modules/windows.js";
import { originalUsername } from "../main.js";
import { settingsTemplate, themes } from "../main.js";
import { colorpickersHTMLV2 } from "../../fixes-utils/svgs.js";
import { ImageSelector } from "../modules/images.js";
import { createButtonWithLabel } from "../appearance/ui.js";
import { trashSvg } from "../../fixes-utils/svgs.js";
import { browser, getExtensionImage } from "../../common/utils.js";
import {
  applyProfile,
  applyTopNav,
  applyAppearance,
  applyOther,
  liteMode,
  isGOSchool,
  isFirefox,
} from "../main.js";
import { setWidgetSetting, getWidgetSetting } from "../../widgets/widgets.js";
import { applyWeatherEffects } from "../appearance/weather-effects.js";
import { clearAllData } from "../../fixes-utils/utils.js";
import { loadQuickSettings } from "./quick-settings.js";
import { createTextInput, createButton } from "../appearance/ui.js";
import { applyProfilePicture } from "../profile.js";

export class SettingsWindow extends BaseWindow {
  settingsSideBarCategories = {
    appearance: {
      name: "Appearance",
    },
    topNav: { name: "Navigation" },
    widgets: { name: "Widgets" },
    other: { name: "Other" },
  };
  currentPage = "appearance";

  constructor() {
    super("settings-window");
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
    settingsSideBar.appendChild(settingsSideBarProfileButton);

    Object.keys(this.settingsSideBarCategories).forEach((key) => {
      let settingsSideBarButton = this.createSettingsSideBarCategory(key);
      settingsSideBar.appendChild(settingsSideBarButton);
    });

    let currentRadio = settingsSideBar.querySelector(
      `input[value="${this.currentPage}"]`
    );
    if (currentRadio) currentRadio.checked = true;
    settingsSideBar.addEventListener("change", this.updateSideBar);

    return settingsSideBar;
  }

  updateSideBar = async (event) => {
    if (event.target.type === "radio") {
      this.currentPage = event.target.value;
      this.displaySettingsPage();
      await this.loadPage();
    }
  };

  async createSettingsSideBarProfileButton() {
    let data = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });

    let radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = "settings-page";
    radioInput.value = "profile";
    radioInput.id = "settings-profile";
    radioInput.classList.add("settings-radio");

    let profileSettingsLabel = document.createElement("label");
    profileSettingsLabel.htmlFor = "settings-profile";
    profileSettingsLabel.tabIndex = "0";
    profileSettingsLabel.classList.add(
      "profile-settings-button",
      "settings-category-button-js"
    );

    profileSettingsLabel.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault(); // Prevent page scroll on Space
        radioInput.click(); // Select the radio button
      }
    });

    let profilePicture = document.createElement("div");
    profilePicture.classList.add("profile-picture-settings");

    let profileTextContainer = document.createElement("div");
    profileTextContainer.classList.add("profile-settings-label");

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

    profileTextContainer.appendChild(profileSettingsLabelTitle);
    profileTextContainer.appendChild(profileSettingsLabelDescription);
    profileSettingsLabel.appendChild(profilePicture);
    profileSettingsLabel.appendChild(profileTextContainer);

    let container = document.createElement("div");
    container.appendChild(radioInput);
    container.appendChild(profileSettingsLabel);

    return container;
  }

  isPastaTime() {
    return new Date().getHours() === 12;
  }

  createSettingsSideBarCategory(category) {
    let radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = "settings-page";
    radioInput.value = category;
    radioInput.id = `settings-${category}`;
    radioInput.classList.add("settings-radio");

    let categoryLabel = document.createElement("label");
    categoryLabel.htmlFor = `settings-${category}`;
    categoryLabel.tabIndex = "0";
    categoryLabel.classList.add(
      "settings-category-button",
      "settings-category-button-js"
    );

    categoryLabel.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault(); // Prevent page scroll on Space
        radioInput.click(); // Select the radio button
      }
    });

    let categoryButtonIcon = document.createElement("img");
    categoryButtonIcon.classList.add("category-button-icon");
    let imageFileName = category + ".webp";
    if (category === "appearance" && this.isPastaTime()) {
      imageFileName = "pasta.webp";
    }
    categoryButtonIcon.src = getExtensionImage(
      "settings-icons/" + imageFileName
    );

    categoryLabel.appendChild(categoryButtonIcon);
    categoryLabel.appendChild(
      document.createTextNode(this.settingsSideBarCategories[category].name)
    );

    let container = document.createElement("div");
    container.appendChild(radioInput);
    container.appendChild(categoryLabel);

    return container;
  }

  clearSettingsPage() {
    this.settingsPage.innerHTML = "";
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

    async function loadWidgetSettingSlider(id, setting) {
      document.getElementById(id).value = await getWidgetSetting(setting);
      document.querySelector(`#${id} + .settings-page-live-value`).innerText =
        await getWidgetSetting(setting);
    }

    document.getElementById("profile-settings-label-title").innerText = String(
      settings.profile.username || originalUsername
    ).split(" ")[0];

    switch (this.currentPage) {
      case "profile": {
        if (settings.profile.username) {
          document.getElementById("settings-page-username-input").value =
            settings.profile.username;
        }

        // Profile picture
        this.profilePictureInput.loadImageData();

        document.getElementById("settings-page-default-sm-pfp-button").checked =
          settings.profile.useSMpfp;
        break;
      }

      case "appearance": {
        // Theme
        document
          .querySelectorAll(".settings-page-theme-card input[type='radio']")
          .forEach((radio) => {
            if (radio.value === settings.appearance.theme) {
              radio.checked = true;
            } else {
              radio.checked = false;
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
        this.backgroundImageSelector.id = settings.appearance.theme;
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
        console.log(isGOSchool);
        if (isGOSchool) {
          document.getElementById("settings-page-go-button").checked =
            settings.topNav.buttons.GO;
        }

        if (!liteMode) {
          document.getElementById("settings-page-global-chat-button").checked =
            settings.topNav.buttons.GC;
        }

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
        ).checked = await getWidgetSetting("DelijnWidget.monochrome");

        await loadWidgetSettingSlider(
          "settings-page-max-busses-slider",
          "DelijnWidget.maxBusses"
        );

        // Assignments

        await loadWidgetSettingSlider(
          "settings-page-max-assignments-slider",
          "TakenWidget.maxAssignments"
        );

        // Snake

        if (!liteMode) {
          document.getElementById(
            "settings-page-show-snake-grid-button"
          ).checked = await getWidgetSetting("SnakeWidget.enableGrid");
        }

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

        if (!liteMode) {
          document.getElementById("settings-page-gc-keybinding").value =
            settings.other.keybinds.gc;
        }

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

        settings.profile.useSMpfp = document.getElementById(
          "settings-page-default-sm-pfp-button"
        ).checked;

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

        await applyAppearance(settings.appearance);
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

        if (!liteMode) {
          settings.topNav.buttons.GC = document.getElementById(
            "settings-page-global-chat-button"
          ).checked;
        }

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
        // Delijn
        if (
          document.getElementById("settings-page-delijn-monochrome-button")
            .checked != (await getWidgetSetting("DelijnWidget.monochrome"))
        ) {
          await setWidgetSetting(
            "DelijnWidget.monochrome",
            document.getElementById("settings-page-delijn-monochrome-button")
              .checked
          );
        }

        if (
          parseInt(
            document.getElementById("settings-page-max-busses-slider").value,
            10
          ) != (await getWidgetSetting("DelijnWidget.maxBusses"))
        ) {
          await setWidgetSetting(
            "DelijnWidget.maxBusses",
            parseInt(
              document.getElementById("settings-page-max-busses-slider").value,
              10
            )
          );
        }
        // Assignments

        if (
          parseInt(
            document.getElementById("settings-page-max-assignments-slider")
              .value,
            10
          ) != (await getWidgetSetting("TakenWidget.maxAssignments"))
        ) {
          await setWidgetSetting(
            "TakenWidget.maxAssignments",
            parseInt(
              document.getElementById("settings-page-max-assignments-slider")
                .value,
              10
            )
          );
        }
        if (!liteMode) {
          if (
            document.getElementById("settings-page-show-snake-grid-button")
              .checked != (await getWidgetSetting("SnakeWidget.enableGrid"))
          ) {
            await setWidgetSetting(
              "SnakeWidget.enableGrid",
              document.getElementById("settings-page-show-snake-grid-button")
                .checked
            );
          }
        }

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

        if (!liteMode) {
          settings.other.keybinds.gc = document.getElementById(
            "settings-page-gc-keybinding"
          ).value;
        }

        applyOther(settings.other);
        break;
      }

      default:
        break;
    }

    await browser.runtime.sendMessage({
      action: "setSettingsData",
      data: settings,
    });

    console.log("Successfully stored main settings: \n", settings);
    loadQuickSettings();
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
      container.classList.add("smpp-input-with-label");

      let label = document.createElement("span");
      label.for = id;
      label.tabIndex = "0";
      label.classList.add("settings-page-button-label");
      label.innerText = text;

      let button = createButton(id);
      button.classList.add("settings-page-button");

      const input = document.createElement("input");
      input.id = id;
      input.type = "text";
      input.readOnly = true;
      input.spellcheck = false;
      input.classList.add("settings-page-keybinding-input");
      input.value = "None";

      // Create unbind button
      const unbindButton = document.createElement("button");
      unbindButton.classList.add("keybind-unbind-button");
      unbindButton.innerHTML = trashSvg; // Replace with your SVG
      unbindButton.title = "Clear keybind";
      unbindButton.setAttribute("aria-label", "Clear keybind");

      let listening = false;

      input.addEventListener("click", () => {
        if (listening) return;
        listening = true;
        let oldKeybind = input.value;
        input.value = "Press any key...";
        input.classList.add("listening");

        const keyListener = async (e) => {
          listening = false;

          input.classList.remove("listening");
          e.preventDefault();
          e.stopPropagation();

          let keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
          if (keyName === " ") keyName = "Space";
          if (keyName === "Backspace") keyName = "None";
          if (keyName === "Escape") keyName = oldKeybind;

          input.value = keyName;
          document.removeEventListener("keydown", keyListener);
          await this.storePage();
        };

        const buttonListener = async (e) => {
          listening = false;

          input.classList.remove("listening");
          e.stopPropagation();
          e.preventDefault();
          input.value = "None";

          document.removeEventListener("keydown", keyListener);
          await this.storePage();
        };

        // Unbind click handler
        unbindButton.addEventListener("click", buttonListener);

        document.addEventListener("keydown", keyListener);
      });

      // Create input wrapper for positioning
      const inputWrapper = document.createElement("div");
      inputWrapper.classList.add("keybind-input-wrapper");
      inputWrapper.appendChild(input);
      inputWrapper.appendChild(unbindButton);

      container.appendChild(label);
      container.appendChild(inputWrapper);

      return container;
    };

    //TODO: use function in ui.js (classes need to be added and or css needs to be changed)
    function createSettingsButtonWithLabel(id, text) {
      let container = createButtonWithLabel(id, text);
      container.tabIndex = "0";
      container.classList.add("settings-page-button-label-container");
      return container;
    }

    function createImageButton(src, width = "80px", height = "80px", name, id) {
      let wrapper = document.createElement("label");
      wrapper.classList.add("settings-page-image-button-wrapper");
      wrapper.tabIndex = "0";
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

      // Add keyboard support
      wrapper.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault(); // Prevent page scroll on Space
          input.click(); // Select the radio button
        }
      });

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
      container.classList.add("smpp-input-with-label");
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
    this.settingsPage.scrollTo(0, 0);
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
        this.settingsPage.appendChild(createSectionTitle("Profile picture"));
        this.settingsPage.appendChild(
          createDescription(
            isFirefox
              ? "Upload your own profile picture, large files not recommended on Firefox"
              : "Upload your own profile picture"
          )
        );
        this.profilePictureInput = new ImageSelector("profilePicture");
        this.profilePictureInput.id = "profilePicture";
        this.profilePictureInput.loadImageData();
        this.profilePictureInput.onStore = async () => {
          this.storePage();
          const data = await browser.runtime.sendMessage({
            action: "getSettingsData",
          });
          applyProfilePicture(data.profile);
        };
        let profilePictureInputContainer =
          this.profilePictureInput.createFullFileInput();
        profilePictureInputContainer.id = "profile-picture-input-container";
        this.settingsPage.appendChild(profilePictureInputContainer);

        this.settingsPage.appendChild(
          createSettingsButtonWithLabel(
            "settings-page-default-sm-pfp-button",
            "Original profile picture"
          )
        );

        break;
      case "appearance":
        this.settingsPage.appendChild(createMainTitle("Appearance"));
        this.settingsPage.appendChild(createSectionTitle("Theme"));
        this.settingsPage.appendChild(
          createDescription(
            "Customize the overall look of the interface with different color styles."
          )
        );

        this.settingsPage.appendChild(createCustomThemeUIV2());
        this.settingsPage.appendChild(createSectionTitle("Wallpaper"));
        this.settingsPage.appendChild(
          createDescription("Personalize your backdrop with a custom image.")
        );

        this.backgroundImageSelector = new ImageSelector("backgroundImage");
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
          createImage("theme-backgrounds/birb.jpg", "6rem", "4rem")
        );

        let blurredImage = createImage(
          "theme-backgrounds/birb.jpg",
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
          "icons/weather-overlay/raindropfancy.svg",
          "Rain",
          "5rem",
          "5rem",
          "weather",
          "settings-page-raindrop-button"
        );
        rainBtn.dataset.weather = "rain";
        weatherIconsContainer.appendChild(rainBtn);

        let realtimeBtn = createImageButtonWithLabel(
          "icons/weather-overlay/realtimefancy.svg",
          "Realtime",
          "5rem",
          "5rem",
          "weather",
          "settings-page-realtime-button"
        );
        realtimeBtn.dataset.weather = "realtime";
        weatherIconsContainer.appendChild(realtimeBtn);

        let snowBtn = createImageButtonWithLabel(
          "icons/weather-overlay/snowflakefancy.svg",
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
            "icons/sm-icon.svg",
            "5rem",
            "5rem",
            "logo",
            "settings-page-default-icon-button"
          )
        );
        iconsContainer.appendChild(
          createImageButton(
            "icons/smpp/128.png",
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

        if (!liteMode) {
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
        }

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

        if (!liteMode) {
          this.settingsPage.appendChild(
            createKeybindInput("settings-page-gc-keybinding", "Global Chat")
          );
        }

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

export let settingsWindow;

export async function createSettingsWindow() {
  settingsWindow = new SettingsWindow();
  await settingsWindow.create();
  await settingsWindow.loadPage();
  settingsWindow.hide();
}

export async function openSettingsWindow(event) {
  settingsWindow.show(event);
  settingsWindow.loadPage();
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
