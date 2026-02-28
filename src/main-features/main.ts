import "../fixes-utils/svgs.ts";
import "../fixes-utils/login.ts";
import "../fixes-utils/scraper.ts";
import "../fixes-utils/results.ts";
import "./modules/windows.ts";
import "./modules/images.ts";
import "./profile.ts";
import "../main-features/keybinds.ts";
import "./appearance/background-image.ts";
import "./appearance/weather-effects.ts";
// Games
import "../games/games.ts";
import "../games/breakout.ts";
import "../games/flappy.ts";
import "../games/snake.ts";
import "../games/pong.ts";
import "../games/tetris.ts";
// Widgets
import "../widgets/tutorial-widget.ts";
import "../widgets/assignments.ts";
import "../widgets/delijn.ts";
import "../widgets/plant.ts";
import "../widgets/planner.ts";
import "../widgets/weather.ts";
import "../widgets/clock.ts";
import "../widgets/calendar.ts";

import { browser, getExtensionImage, randomChance } from "../common/utils.js";
import { getPfpLink } from "../fixes-utils/utils.js";

import { migrate } from "../fixes-utils/migration.js";
import { titleFix } from "../fixes-utils/titlefix.js";
import {
  createWidgetSystem,
  createWidgetEditModeButton,
} from "../widgets/widgets.js";
import { createGC, setGlobalGlass } from "./globalchat.js";
import {
  createQuickSettingsButton,
  createQuickSettings,
} from "./settings/quick-settings.js";
import {
  createSettingsWindow,
  type Settings,
} from "./settings/main-settings.js";
import { quickLoad } from "./quick-menu/quick.js";

export var originalUsername: string;
export var themes: any;
export var onHomePage: boolean;
export var onLoginPage: boolean;
export var isGOSchool: boolean;
export var isFirefox: boolean;
export var originalPfpUrl: string;
export var keybinds: any;
export var liteMode: boolean;
export var customTheme: any;

import {
  discordSvg,
  homeiconSvg,
  messageSvg,
  notfisSvg,
  searchButtonSvg,
  settingsIconSvg,
} from "../fixes-utils/svgs.js";

import { setEditMode } from "../widgets/widgets.js";
import { initWidgetEditMode } from "../widgets/widgets.js";
import { applyUsername, applyProfilePicture } from "./profile.js";
import { updateLoginPanel } from "../fixes-utils/login.js";
import { buisStats } from "../fixes-utils/results.js";
import {
  currentThemeName,
  setTheme,
  updateCurrentThemeName,
} from "./appearance/themes.js";
import { setBackground } from "./appearance/background-image.js";
import { updateNews } from "../widgets/widgets.js";
import { updateSplashText } from "../fixes-utils/login.js";
import { applyWeatherEffects } from "./appearance/weather-effects.js";
import { openSettingsWindow } from "./settings/main-settings.js";
import {
  reloadDMenuConfig,
  createQuickMenuButton,
} from "../main-features/quick-menu/dmenu.js";

//java script komt hier je weet wel
//ok - ldev
//oh ok, ik dacht in general.css - Jdev

function updateDiscordPopup(discordButtonEnabled: boolean) {
  if (discordButtonEnabled) {
    let discordButtonContainer =
      document.getElementById("discord-link-container") ||
      document.createElement("div");
    discordButtonContainer.id = "discord-link-container";
    discordButtonContainer.innerHTML = discordSvg;
    document.body.appendChild(discordButtonContainer);
  } else {
    document.getElementById("discord-link-container")?.remove();
  }
}

function changeLogoutText() {
  if (randomChance(1 / 50)) {
    return "Good Bye! →";
  }
  return "Log out →";
}

function changeFont() {
  let fontLinks = document.createElement("div");
  fontLinks.innerHTML = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">`;
  fontLinks.innerHTML += `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">`;
  fontLinks.innerHTML += `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&display=swap" rel="stylesheet">`;
  document.getElementsByTagName("head")[0]?.appendChild(fontLinks);
}

function fixCoursesSearch() {
  document
    .getElementById("courseSearch")
    ?.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();

        setTimeout(() => {
          const firstCourse = document.querySelector(
            ".course-list.js-courses-list li a"
          ) as HTMLElement;
          if (firstCourse) {
            firstCourse.click();
          }
        }, 100);
      }
    });
}

function addToastContainer() {
  let toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.classList.add("toast-container");
  document.body.appendChild(toastContainer);
}

function updateTopNavIcons(data: Settings["topNav"]["icons"]) {
  const notifsButton = document.querySelector(
    ".js-btn-notifs"
  ) as HTMLButtonElement;
  if (notifsButton && data.notifications) {
    const textSpan = notifsButton.querySelector("span");
    notifsButton.innerHTML = notfisSvg;
    if (textSpan) notifsButton.appendChild(textSpan);
  } else if (notifsButton && !data.notifications) {
    const textSpan = notifsButton.querySelector("span");
    notifsButton.innerHTML = "Meldingen";
    if (textSpan) notifsButton.appendChild(textSpan);
  }

  const startButton = document.querySelector(".js-btn-home");
  if (startButton && data.home) {
    startButton.innerHTML = homeiconSvg;
  } else if (startButton && !data.home) {
    startButton.innerHTML = "Start";
  }

  const messageButton = document.querySelector(
    `a.topnav__btn[title="Berichten"]`
  );
  if (messageButton && data.mail) {
    const textSpan = messageButton.querySelector("span");
    messageButton.innerHTML = messageSvg;
    if (textSpan) messageButton.appendChild(textSpan);
  } else if (messageButton && !data.mail) {
    const textSpan = messageButton.querySelector("span");
    messageButton.innerHTML = "Berichten";
    if (textSpan) messageButton.appendChild(textSpan);
  }

  const settingButton = document.getElementById("quickSettingsButton");
  if (settingButton && data.settings) {
    settingButton.innerHTML = settingsIconSvg;
  } else if (settingButton && !data.settings) {
    settingButton.innerHTML = "Settings";
  }
}

function updateTabLogo(logo: Settings["appearance"]["tabLogo"]) {
  let iconElement = document.querySelector(
    'link[rel="icon"]'
  ) as HTMLLinkElement;
  if (!iconElement) {
    iconElement = document.createElement("link");
    document.head.appendChild(iconElement);
    iconElement.rel = "icon";
  }
  switch (logo) {
    case "sm":
      iconElement.href =
        "https://static4.smart-school.net/smsc/svg/favicon/favicon.svg";
      break;
    case "smpp":
      iconElement.href = getExtensionImage("icons/smpp/128.png");
      break;
  }
}

export function applyTopNav(data: Settings["topNav"]) {
  let topNav = document.querySelector(".topnav") as HTMLElement;
  if (!topNav) return;

  updateTopNavIcons(data.icons);
  updateTopButtons(data.buttons);

  let linksButton = document.querySelector("[data-links]") as HTMLButtonElement;
  let coursesButton = document.querySelector(
    "[data-courses]"
  ) as HTMLButtonElement;
  if (linksButton && coursesButton) {
    data.switchCoursesAndLinks
      ? topNav.insertBefore(linksButton, coursesButton)
      : topNav.insertBefore(coursesButton, linksButton);
  }
}

async function createStaticGlobals() {
  themes = await browser.runtime.sendMessage({
    action: "getThemes",
  });

  let originalUsernameElement = document.querySelector(
    ".js-btn-profile .hlp-vert-box span"
  ) as HTMLSpanElement;
  originalUsername = originalUsernameElement?.innerText || "Mr Unknown";

  isGOSchool = document.body.classList.contains("go");
  isFirefox =
    typeof navigator.userAgent === "string" &&
    /firefox/i.test(navigator.userAgent);
  if (document.querySelector('img[alt="Profiel afbeelding"]')) {
    let originalPfp = document.querySelector(
      'img[alt="Profiel afbeelding"]'
    ) as HTMLImageElement;
    originalPfpUrl = originalPfp?.src;
  } else {
    originalPfpUrl = getPfpLink(originalUsername);
  }

  onHomePage = document.getElementById("container") != null;

  onLoginPage = document.querySelector(".login-app") != null;

  var quicks = await quickLoad();
  liteMode = browser.runtime.getManifest().name.includes("Lite");
}

export async function applyAppearance(appearance: Settings["appearance"]) {
  let style = document.documentElement.style;
  if (appearance.glass) {
    document.body.classList.add("glass");
  } else {
    document.body.classList.remove("glass");
  }
  setGlobalGlass(appearance.glass);

  await setTheme(appearance.theme);
  setBackground(appearance.theme);
  updateNews(appearance.news);
  updateTabLogo(appearance.tabLogo);

  if (onLoginPage) {
    style.setProperty("--background-blur", `blur(${0}px)`);
  } else {
    style.setProperty(
      "--background-blur",
      `blur(${appearance.background.blur}px)`
    );
  }
}

export function applyOther(other: Settings["other"]) {
  if (window.location.href.split("/")[3] == "login")
    updateSplashText(other.splashText);

  keybinds = other.keybinds;

  other.performanceMode
    ? document.body.classList.remove("enableAnimations")
    : document.body.classList.add("enableAnimations");

  if (onHomePage) updateDiscordPopup(other.discordButton);
}

export function applyProfile(profile: Settings["profile"]) {
  let style = document.documentElement.style;
  style.setProperty(
    "--profile-picture",
    "url(" + getPfpLink(profile.username || originalUsername) + ")"
  );
  applyUsername(profile.username);
  applyProfilePicture(profile);
}

function applyFixes() {
  changeFont();
  fixCoursesSearch();
  titleFix();
  addToastContainer();

  let notifsToggleLabel = document.getElementById(
    "notifsToggleLabel"
  ) as HTMLLabelElement;
  if (notifsToggleLabel) notifsToggleLabel.innerText = "Toon pop-ups";

  if (window.location.pathname.startsWith("/results/main/results")) {
    buisStats();
  }
  if (document.querySelector(".login-app__left")) updateLoginPanel();
}

export async function apply() {
  const data = (await browser.runtime.sendMessage({
    action: "getSettingsData",
  })) as Settings;

  console.log("Applying with settings data: \n", data);
  updateCurrentThemeName(data.appearance.theme);

  await reloadDMenuConfig(); // reload the dmenu config. (er is een object voor async raarheid te vermijden en dat wordt herladen door deze functie)
  if (onHomePage) setEditMode(false);
  await applyAppearance(data.appearance);
  if (!liteMode) applyWeatherEffects(data.appearance.weatherOverlay);
  applyProfile(data.profile);
  applyTopNav(data.topNav);
  applyOther(data.other);
}

function createTopButtons() {
  let topNav = document.querySelector("nav.topnav") as HTMLElement;
  if (!topNav) return;

  let logoutButton = document.querySelector(".js-btn-logout");
  if (logoutButton) {
    logoutButton.innerHTML = changeLogoutText();
  }

  let searchButton = document.querySelector(".topnav__btn--icon--search");
  if (searchButton) {
    topNav.insertBefore(
      createQuickSettingsButton(),
      searchButton.parentElement
    );
    searchButton.innerHTML = searchButtonSvg;
  }
  createQuickSettings();

  let pushRight = topNav.childNodes[2];
  if (!pushRight) return;

  if (!liteMode) {
    topNav.insertBefore(createGC(), pushRight);
  }
  if (onHomePage) {
    initWidgetEditMode();
    topNav.insertBefore(createWidgetEditModeButton(), pushRight);
  }

  topNav.insertBefore(createQuickMenuButton(), pushRight);

  document
    .getElementById("profileMenu")
    ?.querySelector(".topnav__menu")
    ?.appendChild(createProfileSettingButton());
}

function createProfileSettingButton() {
  let button = document.createElement("a");
  button.addEventListener("click", (e) => {
    openSettingsWindow(e);
    let topNavProfileMenu = document.getElementById("profileMenu");
    let settingsPageProfileButton = document.querySelector(
      ".profile-settings-button"
    ) as HTMLButtonElement;
    if (!topNavProfileMenu || !settingsPageProfileButton) return;
    topNavProfileMenu.hidden = true;
    settingsPageProfileButton.click();
  });

  button.classList.add("topnav__menuitem");
  button.classList.add("topnav__menuitem--img");

  let textContent = document.createElement("span");
  textContent.textContent = "Smartschool++ Profile";

  let image = document.createElement("img");
  image.src = getExtensionImage("icons/smpp/" + "128.png");
  image.style.borderRadius = "0.5rem";

  button.appendChild(image);
  button.appendChild(textContent);

  return button;
}

function updateTopButtons(data: Settings["topNav"]["buttons"]) {
  let GOButton = document.querySelector(`[data-go=""]`) as HTMLElement;
  if (GOButton) {
    data.GO
      ? (GOButton.style = "display:flex")
      : (GOButton.style = "display:none");
  }

  let searchButton = document.querySelector(".topnav__btn--icon--search");
  if (searchButton?.parentElement) {
    data.search
      ? (searchButton.parentElement.style = "display:flex")
      : (searchButton.parentElement.style = "display:none");
  }

  let GC = document.getElementById("global_chat_button");
  if (GC) {
    data.GC
      ? (GC.style = "display:flex !important")
      : (GC.style = "display:none !important");
  }

  let quickButton = document.getElementById("quick-menu-button");
  if (quickButton) {
    data.quickMenu
      ? (quickButton.style = "display:flex !important")
      : (quickButton.style = "display:none !important");
  }
}

async function main() {
  if (document.body.classList.contains("smpp")) {
    console.error("SMPP is 2x geladen");
    alert("SMPP is 2x geladen");
  }

  document.body.classList.add("smpp"); // For modding

  applyFixes();
  await migrate();

  await createStaticGlobals();

  await createWidgetSystem();

  if (document.querySelector("nav.topnav")) {
    await createSettingsWindow();
    createTopButtons();
  }

  await apply();
}

main();
