import { BaseWindow } from "../modules/windows.js";
import { originalUsername } from "../main.js";
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
import { ColorPicker, ThemeSelector, ThemeTile } from "../appearance/themes.js";
import type { Quicks } from "../quick-menu/config.js";
import type { Keybind } from "../keybinds.js";

export type Settings = {
  profile: {
    username: string | null;
    useSMpfp: boolean;
  };
  appearance: {
    theme: string;
    glass: boolean;
    quickSettingsThemes: string[];
    background: { blur: number };
    weatherOverlay: {
      type: "realtime" | "rain" | "snow";
      amount: number;
      opacity: number;
    };
    news: boolean;
    tabLogo: "sm" | "smpp";
  };
  topNav: {
    buttons: {
      GO: boolean;
      GC: boolean;
      search: boolean;
      quickMenu: boolean;
    };
    switchCoursesAndLinks: boolean;
    icons: {
      home: boolean;
      mail: boolean;
      notifications: boolean;
      settings: boolean;
    };
  };
  other: {
    quicks: Quicks;
    performanceMode: boolean;
    splashText: boolean;
    discordButton: boolean;
    dmenu: {
      centered: boolean;
      itemScore: boolean;
      toplevelConfig: boolean;
    };
    keybinds: {
      dmenu: Keybind;
      widgetEditMode: Keybind;
      widgetBag: Keybind;
      settings: Keybind;
      gc: Keybind;
    };
  };
};

type SettingsSideBarCategory = { name: string; id: string };
type SettingsSideBarCategories = SettingsSideBarCategory[];

export class SettingsWindow extends BaseWindow {
  settingsSideBarCategories = [
    { name: "Appearance", id: "appearance" },
    { name: "Navigation", id: "topNav" },
    { name: "Widgets", id: "widgets" },
    { name: "Other", id: "other" },
  ] as SettingsSideBarCategories;

  currentPage = "appearance";
  settingsPage: HTMLDivElement = document.createElement("div");
  backgroundImageSelector = new ImageSelector("backgroundImage", true);
  themeSelector = new ThemeSelector();
  profilePictureInput = new ImageSelector("profilePicture");

  constructor() {
    super("settings-window");
  }

  async renderContent() {
    let content = document.createElement("div");
    let settingsSideBar = await this.createSettingsSideBar();
    this.settingsPage.id = "settings-page";
    this.settingsPage.addEventListener("change", (e) => this.storePage());

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

    this.settingsSideBarCategories.forEach((category) => {
      settingsSideBar.appendChild(this.createSettingsSideBarCategory(category));
    });

    let currentRadio = settingsSideBar.querySelector(
      `input[value="${this.currentPage}"]`
    ) as HTMLInputElement;
    if (currentRadio) currentRadio.checked = true;
    settingsSideBar.addEventListener("change", this.updateSideBar);

    return settingsSideBar;
  }

  updateSideBar = async (event: Event) => {
    if (event.target instanceof HTMLInputElement)
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
    profileSettingsLabel.tabIndex = 0;
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

    let firstName = String(data.profile.username || originalUsername).split(
      " "
    )[0];
    if (firstName) profileSettingsLabelTitle.innerText = firstName;

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

  createSettingsSideBarCategory(category: SettingsSideBarCategory) {
    let radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = "settings-page";
    radioInput.value = category.id;
    radioInput.id = `settings-${category.id}`;
    radioInput.classList.add("settings-radio");

    let categoryLabel = document.createElement("label");
    categoryLabel.htmlFor = `settings-${category.id}`;
    categoryLabel.tabIndex = 0;
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
    let imageFileName = category.id + ".webp";
    if (category.id === "appearance" && this.isPastaTime()) {
      imageFileName = "pasta.webp";
    }
    categoryButtonIcon.src = getExtensionImage(
      "settings-icons/" + imageFileName
    );

    categoryLabel.appendChild(categoryButtonIcon);
    categoryLabel.appendChild(document.createTextNode(category.name));

    let container = document.createElement("div");
    container.appendChild(radioInput);
    container.appendChild(categoryLabel);

    return container;
  }

  clearSettingsPage() {
    this.settingsPage.innerHTML = "";
  }

  addDisclaimer(
    element: HTMLElement,
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

  async loadPage(shouldReloadTheme = true) {
    const settings: Settings = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });

    async function loadWidgetSettingSlider(id: string, setting: string) {
      const element = document.getElementById(id);
      const valueDisplay = document.querySelector(
        `#${id} + .settings-page-live-value`
      );

      if (!element || !valueDisplay) return;

      const value = await getWidgetSetting(setting);
      (element as HTMLInputElement).value = value;
      valueDisplay.textContent = String(value);
    }

    const profileTitleElement = document.getElementById(
      "profile-settings-label-title"
    );
    if (profileTitleElement) {
      let firstName = String(
        settings.profile.username || originalUsername
      ).split(" ")[0];
      if (firstName) profileTitleElement.textContent = firstName;
    }

    switch (this.currentPage) {
      case "profile": {
        const usernameInput = document.getElementById(
          "settings-page-username-input"
        );
        if (settings.profile.username && usernameInput) {
          (usernameInput as HTMLInputElement).value = settings.profile.username;
        }

        // Profile picture
        this.profilePictureInput.loadImageData();

        const defaultPfpButton = document.getElementById(
          "settings-page-default-sm-pfp-button"
        );
        if (defaultPfpButton) {
          (defaultPfpButton as HTMLInputElement).checked =
            settings.profile.useSMpfp;
        }
        break;
      }

      case "appearance": {
        // Theme
        if (shouldReloadTheme) {
          await this.themeSelector.updateImages(false);
        }
        this.themeSelector.currentTiles.forEach((tile) => {
          tile.updateSelection();
        });

        const enableGlassButton = document.getElementById(
          "settings-page-glass-button"
        );
        if (enableGlassButton) {
          (enableGlassButton as HTMLInputElement).checked =
            settings.appearance.glass;
        }

        // Background
        this.backgroundImageSelector.id = settings.appearance.theme;
        this.backgroundImageSelector.loadImageData();

        // Blur slider
        const blurSlider = document.getElementById("settings-page-blur-slider");
        if (blurSlider) {
          (blurSlider as HTMLInputElement).value = String(
            settings.appearance.background.blur * 10
          );
        }

        // Weather overlay
        document
          .querySelectorAll(".settings-page-weather-overlay-container input")
          .forEach((input) => {
            const inputElement = input as HTMLInputElement;
            if (inputElement.id) {
              inputElement.checked = inputElement.id.includes(
                settings.appearance.weatherOverlay.type
              );
            }
          });

        const weatherOverlaySlider = document.getElementById(
          "settings-page-weather-overlay-slider"
        );
        if (weatherOverlaySlider) {
          (weatherOverlaySlider as HTMLInputElement).value = String(
            settings.appearance.weatherOverlay.amount
          );
        }

        const weatherOpacitySlider = document.getElementById(
          "settings-page-weather-overlay-opacity-slider"
        );
        if (weatherOpacitySlider) {
          (weatherOpacitySlider as HTMLInputElement).value = String(
            settings.appearance.weatherOverlay.opacity * 100
          );
        }

        // Tab icon
        const defaultIconButton = document.getElementById(
          "settings-page-default-icon-button"
        );
        if (defaultIconButton) {
          (defaultIconButton as HTMLInputElement).checked =
            settings.appearance.tabLogo === "sm";
        }

        const smppIconButton = document.getElementById(
          "settings-page-smpp-icon-button"
        );
        if (smppIconButton) {
          (smppIconButton as HTMLInputElement).checked =
            settings.appearance.tabLogo === "smpp";
        }

        // News
        const showNewsButton = document.getElementById(
          "settings-page-show-news-button"
        );
        if (showNewsButton) {
          (showNewsButton as HTMLInputElement).checked =
            settings.appearance.news;
        }
        break;
      }

      case "topNav": {
        const swapCoursesButton = document.getElementById(
          "settings-page-swap-courses-button"
        );
        if (swapCoursesButton) {
          (swapCoursesButton as HTMLInputElement).checked =
            settings.topNav.switchCoursesAndLinks;
        }

        // Buttons
        if (isGOSchool) {
          const goButton = document.getElementById("settings-page-go-button");
          if (goButton) {
            (goButton as HTMLInputElement).checked = settings.topNav.buttons.GO;
          }
        }

        if (!liteMode) {
          const globalChatButton = document.getElementById(
            "settings-page-global-chat-button"
          );
          if (globalChatButton) {
            (globalChatButton as HTMLInputElement).checked =
              settings.topNav.buttons.GC;
          }
        }

        const searchButton = document.getElementById(
          "settings-page-search-button"
        );
        if (searchButton) {
          (searchButton as HTMLInputElement).checked =
            settings.topNav.buttons.search;
        }

        const quickMenuButton = document.getElementById(
          "settings-page-quick-menu-button"
        );
        if (quickMenuButton) {
          (quickMenuButton as HTMLInputElement).checked =
            settings.topNav.buttons.quickMenu;
        }

        // Icons
        const homeIconButton = document.getElementById(
          "settings-page-home-icon-button"
        );
        if (homeIconButton) {
          (homeIconButton as HTMLInputElement).checked =
            settings.topNav.icons.home;
        }

        const mailIconButton = document.getElementById(
          "settings-page-mail-icon-button"
        );
        if (mailIconButton) {
          (mailIconButton as HTMLInputElement).checked =
            settings.topNav.icons.mail;
        }

        const notificationsIconButton = document.getElementById(
          "settings-page-notifications-icon-button"
        );
        if (notificationsIconButton) {
          (notificationsIconButton as HTMLInputElement).checked =
            settings.topNav.icons.notifications;
        }

        const settingsIconButton = document.getElementById(
          "settings-page-settings-icon-button"
        );
        if (settingsIconButton) {
          (settingsIconButton as HTMLInputElement).checked =
            settings.topNav.icons.settings;
        }
        break;
      }

      case "widgets": {
        // De Lijn
        const delijnMonochromeButton = document.getElementById(
          "settings-page-delijn-monochrome-button"
        );
        if (delijnMonochromeButton) {
          (delijnMonochromeButton as HTMLInputElement).checked =
            await getWidgetSetting("DelijnWidget.monochrome");
        }

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
          const showSnakeGridButton = document.getElementById(
            "settings-page-show-snake-grid-button"
          );
          if (showSnakeGridButton) {
            (showSnakeGridButton as HTMLInputElement).checked =
              await getWidgetSetting("SnakeWidget.enableGrid");
          }
        }

        break;
      }

      case "other": {
        // Performance mode
        const performanceModeButton = document.getElementById(
          "settings-page-performance-mode-button"
        );
        if (performanceModeButton) {
          (performanceModeButton as HTMLInputElement).checked =
            settings.other.performanceMode;
        }

        // Splash-text
        const splashTextButton = document.getElementById(
          "settings-page-splash-text-button"
        );
        if (splashTextButton) {
          (splashTextButton as HTMLInputElement).checked =
            settings.other.splashText;
        }

        // Discord button
        const discordButton = document.getElementById(
          "settings-page-discord-button"
        );
        if (discordButton) {
          (discordButton as HTMLInputElement).checked =
            settings.other.discordButton;
        }

        function loadKeybind(id: string, key: Keybind) {
          let keybindInput = document.getElementById(id) as HTMLInputElement;
          if (!keybindInput) return;
          keybindInput.value = key as string;
        }

        // Keybindings

        loadKeybind(
          "settings-page-quick-menu-keybinding",
          settings.other.keybinds.dmenu
        );
        loadKeybind(
          "settings-page-widget-edit-keybinding",
          settings.other.keybinds.widgetEditMode
        );
        loadKeybind(
          "settings-widget-bag-keybinding",
          settings.other.keybinds.widgetBag
        );
        loadKeybind(
          "settings-page-settings-keybinding",
          settings.other.keybinds.settings
        );
        if (!liteMode)
          loadKeybind(
            "settings-page-gc-keybinding",
            settings.other.keybinds.gc
          );

        break;
      }

      default:
        break;
    }
  }

  async storePage(): Promise<void> {
    const settings: Settings = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });

    const previousSettings = structuredClone(settings);

    const getCheckboxValue = (id: string): boolean => {
      const element = document.getElementById(id) as HTMLInputElement | null;
      return element?.checked || false;
    };

    const getSliderValue = (id: string): number => {
      const element = document.getElementById(id) as HTMLInputElement | null;
      return element?.value ? parseFloat(element.value) : 0;
    };

    const saveKeybind = (id: string): Keybind => {
      const element = document.getElementById(id) as HTMLInputElement | null;
      return (element?.value as Keybind) || ("None" as Keybind);
    };

    switch (this.currentPage) {
      case "profile": {
        const usernameInput = document.getElementById(
          "settings-page-username-input"
        ) as HTMLInputElement | null;

        if (usernameInput) {
          settings.profile.username = usernameInput.value || null;
        }

        settings.profile.useSMpfp = getCheckboxValue(
          "settings-page-default-sm-pfp-button"
        );

        applyProfile(settings.profile);
        break;
      }

      case "appearance": {
        // Theme
        const selectedTheme = document.querySelector(
          ".settings-page-theme-card:has(input[type='radio']:checked)"
        ) as HTMLElement | null;

        if (selectedTheme && selectedTheme.dataset["theme"]) {
          settings.appearance.theme = selectedTheme.dataset["theme"];
        }

        // Blur slider
        settings.appearance.background.blur =
          getSliderValue("settings-page-blur-slider") / 10;

        // Weather overlay
        const chosenWeather = document.querySelector(
          ".settings-page-weather-overlay-container input:checked"
        ) as HTMLInputElement | null;

        if (chosenWeather) {
          const weatherContainer = chosenWeather.closest(
            "[data-weather]"
          ) as HTMLElement | null;

          if (weatherContainer?.dataset["weather"]) {
            const weatherType = weatherContainer.dataset["weather"];
            if (
              weatherType === "realtime" ||
              weatherType === "rain" ||
              weatherType === "snow"
            ) {
              settings.appearance.weatherOverlay.type = weatherType;
            }
          }
        }

        settings.appearance.weatherOverlay.amount = getSliderValue(
          "settings-page-weather-overlay-slider"
        );

        settings.appearance.weatherOverlay.opacity =
          getSliderValue("settings-page-weather-overlay-opacity-slider") / 100;

        // Tab icon
        const smppIconChecked = getCheckboxValue(
          "settings-page-smpp-icon-button"
        );
        settings.appearance.tabLogo = smppIconChecked ? "smpp" : "sm";

        // News
        settings.appearance.news = getCheckboxValue(
          "settings-page-show-news-button"
        );

        settings.appearance.glass = getCheckboxValue(
          "settings-page-glass-button"
        );

        await applyAppearance(settings.appearance);

        // Apply weather effects if they changed
        if (
          JSON.stringify(settings.appearance.weatherOverlay) !==
            JSON.stringify(previousSettings.appearance.weatherOverlay) &&
          !liteMode
        ) {
          applyWeatherEffects(settings.appearance.weatherOverlay);
        }
        break;
      }

      case "topNav": {
        settings.topNav.switchCoursesAndLinks = getCheckboxValue(
          "settings-page-swap-courses-button"
        );

        // Buttons
        if (isGOSchool) {
          settings.topNav.buttons.GO = getCheckboxValue(
            "settings-page-go-button"
          );
        }

        if (!liteMode) {
          settings.topNav.buttons.GC = getCheckboxValue(
            "settings-page-global-chat-button"
          );
        }

        settings.topNav.buttons.search = getCheckboxValue(
          "settings-page-search-button"
        );
        settings.topNav.buttons.quickMenu = getCheckboxValue(
          "settings-page-quick-menu-button"
        );

        // Icons
        settings.topNav.icons.home = getCheckboxValue(
          "settings-page-home-icon-button"
        );
        settings.topNav.icons.mail = getCheckboxValue(
          "settings-page-mail-icon-button"
        );
        settings.topNav.icons.notifications = getCheckboxValue(
          "settings-page-notifications-icon-button"
        );
        settings.topNav.icons.settings = getCheckboxValue(
          "settings-page-settings-icon-button"
        );

        applyTopNav(settings.topNav);
        break;
      }

      case "widgets": {
        // Helper function for widget setting changes
        const updateWidgetSetting = async (
          id: string,
          settingName: string,
          type: string
        ) => {
          const element = document.getElementById(
            id
          ) as HTMLInputElement | null;
          if (!element) return;

          const currentValue =
            type == "boolean" ? element.checked : parseInt(element.value, 10);
          const storedValue = await getWidgetSetting(settingName);

          if (JSON.stringify(currentValue) !== JSON.stringify(storedValue)) {
            await setWidgetSetting(settingName, currentValue);
          }
        };

        // Delijn
        await updateWidgetSetting(
          "settings-page-delijn-monochrome-button",
          "DelijnWidget.monochrome",
          "boolean"
        );

        await updateWidgetSetting(
          "settings-page-max-busses-slider",
          "DelijnWidget.maxBusses",
          "number"
        );

        // Assignments
        await updateWidgetSetting(
          "settings-page-max-assignments-slider",
          "TakenWidget.maxAssignments",
          "number"
        );

        // Snake
        if (!liteMode) {
          await updateWidgetSetting(
            "settings-page-show-snake-grid-button",
            "SnakeWidget.enableGrid",
            "boolean"
          );
        }

        break;
      }

      case "other": {
        settings.other.performanceMode = getCheckboxValue(
          "settings-page-performance-mode-button"
        );

        settings.other.splashText = getCheckboxValue(
          "settings-page-splash-text-button"
        );

        settings.other.discordButton = getCheckboxValue(
          "settings-page-discord-button"
        );

        // Keybindings
        settings.other.keybinds.dmenu = saveKeybind(
          "settings-page-quick-menu-keybinding"
        );
        settings.other.keybinds.widgetEditMode = saveKeybind(
          "settings-page-widget-edit-keybinding"
        );
        settings.other.keybinds.widgetBag = saveKeybind(
          "settings-widget-bag-keybinding"
        );
        settings.other.keybinds.settings = saveKeybind(
          "settings-page-settings-keybinding"
        );

        if (!liteMode) {
          settings.other.keybinds.gc = saveKeybind(
            "settings-page-gc-keybinding"
          );
        }

        applyOther(settings.other);
        break;
      }

      default:
        break;
    }

    // Save the updated settings
    await browser.runtime.sendMessage({
      action: "setSettingsData",
      data: settings,
    });

    console.log("Successfully stored main settings: \n", settings);
    loadQuickSettings();
    await this.loadPage();
  }

  async displaySettingsPage() {
    function createMainTitle(text: string) {
      let title = document.createElement("h1");
      title.innerText = text;
      title.classList.add("settings-page-main-title");
      return title;
    }

    function createSectionTitle(text: string) {
      let title = document.createElement("h2");
      title.innerText = text;
      title.classList.add("settings-page-section-title");
      return title;
    }

    const createKeybindInput = (id: string, text: string) => {
      const container = document.createElement("div");
      container.classList.add("settings-page-key-bind-container");
      container.classList.add("smpp-input-with-label");

      let label = document.createElement("span");
      label.tabIndex = 0;
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

        const keyListener = async (e: KeyboardEvent) => {
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

        const buttonListener = async (e: Event) => {
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
    function createSettingsButtonWithLabel(id: string, text: string) {
      let container = createButtonWithLabel(id, text);
      container.tabIndex = 0;
      container.classList.add("settings-page-button-label-container");
      return container;
    }

    function createImageButton(
      src: string,
      width: string,
      height: string,
      name: string,
      id: string
    ) {
      let wrapper = document.createElement("label");
      wrapper.classList.add("settings-page-image-button-wrapper");
      wrapper.tabIndex = 0;
      wrapper.style.width = width;
      wrapper.style.height = height;

      let input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      if (id) input.id = id;

      let image = document.createElement("img");
      image.classList.add("settings-page-image");
      image.src = getExtensionImage(src);

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
      src: string,
      text: string,
      width = "80px",
      height = "80px",
      name: string,
      id: string
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

    function createSlider(min: string, max: string, id: string) {
      let slider = document.createElement("input");
      slider.id = id;
      slider.type = "range";
      slider.min = min;
      slider.max = max;
      slider.classList.add("settings-page-slider");
      return slider;
    }

    function createLabeledSlider(
      min: string,
      max: string,
      id: string,
      text: string,
      showValue = true
    ) {
      let container = document.createElement("div");
      container.classList.add("settings-page-slider-container");
      container.classList.add("smpp-input-with-label");
      let textContainer = document.createElement("span");
      textContainer.classList.add("settings-page-slider-label");
      textContainer.innerText = text;
      let slider = createSlider(min, max, id);
      slider.classList.add("settings-page-labeled-slider");
      if (showValue)
        slider.addEventListener("input", (event: Event) => {
          let liveValueElement = document.querySelector(
            "#" + id + " ~ .settings-page-live-value"
          ) as HTMLSpanElement;
          if (liveValueElement) liveValueElement.innerText = slider.value;
        });
      let currentValue = document.createElement("span");
      currentValue.classList.add("settings-page-live-value");
      currentValue.innerText = min;

      container.appendChild(textContainer);
      container.appendChild(slider);
      if (showValue) container.appendChild(currentValue);

      return container;
    }

    function createImage(src: string, width: string, height: string) {
      let image = document.createElement("img");
      image.classList.add("settings-page-image");
      image.src = getExtensionImage(src);
      image.style.width = width;
      image.style.height = height;
      image.style.objectFit = "cover";
      return image;
    }

    function createDescription(text: string) {
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
          this.profilePictureInput.fullContainer;
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

        this.settingsPage.appendChild(this.themeSelector.render());
        this.settingsPage.appendChild(createSectionTitle("Wallpaper"));
        this.settingsPage.appendChild(
          createDescription("Personalize your backdrop with a custom image.")
        );

        this.backgroundImageSelector.onStore = () => {
          this.storePage();
        };

        this.settingsPage.appendChild(
          this.backgroundImageSelector.fullContainer
        );

        this.settingsPage.appendChild(createSectionTitle("Glass"));
        this.settingsPage.appendChild(
          createDescription("Apply a glassy effect to the UI.")
        );
        this.settingsPage.appendChild(
          createSettingsButtonWithLabel("settings-page-glass-button", "Glass")
        );

        this.settingsPage.appendChild(createSectionTitle("Background blur"));
        this.settingsPage.appendChild(
          createDescription("Apply a blur to your background.")
        );

        this.settingsPage.appendChild(
          createSlider("0", "100", "settings-page-blur-slider") // must be divided by 10
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
        rainBtn.dataset["weather"] = "rain";
        weatherIconsContainer.appendChild(rainBtn);

        let realtimeBtn = createImageButtonWithLabel(
          "icons/weather-overlay/realtimefancy.svg",
          "Realtime",
          "5rem",
          "5rem",
          "weather",
          "settings-page-realtime-button"
        );
        realtimeBtn.dataset["weather"] = "realtime";
        weatherIconsContainer.appendChild(realtimeBtn);

        let snowBtn = createImageButtonWithLabel(
          "icons/weather-overlay/snowflakefancy.svg",
          "Snow",
          "5rem",
          "5rem",
          "weather",
          "settings-page-snow-button"
        );
        snowBtn.dataset["weather"] = "snow";
        weatherIconsContainer.appendChild(snowBtn);

        this.settingsPage.appendChild(weatherIconsContainer);

        this.settingsPage.appendChild(
          createLabeledSlider(
            "0",
            "500",
            "settings-page-weather-overlay-slider",
            "Amount",
            false
          )
        );
        this.settingsPage.appendChild(
          createLabeledSlider(
            "0",
            "100",
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
            "1",
            "10",
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
            "1",
            "10",
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

export let settingsWindow: SettingsWindow;

export async function createSettingsWindow() {
  settingsWindow = new SettingsWindow();
  await settingsWindow.create();
  await settingsWindow.loadPage();
  settingsWindow.hide();
}

export async function openSettingsWindow(
  event: MouseEvent | KeyboardEvent | null
) {
  settingsWindow.show(event);

  let updateHeight = () => {
    settingsWindow.themeSelector.updateSizes();
    settingsWindow.themeSelector.updateContentHeight();
    settingsWindow.element.removeEventListener("animationend", updateHeight);
    settingsWindow.element.removeEventListener("transitionend", updateHeight);
  };
  settingsWindow.element.addEventListener("animationend", updateHeight);
  settingsWindow.onScreenSizeUpdate = () => {
    settingsWindow.element.addEventListener("transitionend", updateHeight);
  };
  settingsWindow.themeSelector.updateContentHeight();
}
