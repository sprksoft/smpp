import { settingsTemplate } from "../main.js";
import { browser } from "../../main-features/main.ts";
import { widgetSystemNotifyThemeChange } from "../../widgets/widgets.js";
import { themes } from "../main.js";

export let currentThemeName;
export let currentTheme;
export let customTheme;

export async function setTheme(themeName) {
  let style = document.documentElement.style;
  currentThemeName = themeName;
  currentTheme = await browser.runtime.sendMessage({
    action: "getTheme",
    theme: themeName,
  });
  if (themeName != "custom") {
    Object.keys(currentTheme).forEach((key) => {
      style.setProperty(key, currentTheme[key]);
    });
  } else {
    const themeData = await browser.runtime.sendMessage({
      action: "getCustomThemeData",
    });
    customTheme = themeData;
    const settingsData = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });
    Object.keys(themeData).forEach((key) => {
      style.setProperty("--" + key.replace("_", "-"), themeData[key]);
    });
    if (settingsData.selection == 0) {
      style.setProperty("--loginpage-image", "url(https://about:blank)");
    }
  }
  await widgetSystemNotifyThemeChange();
}
export function getThemeVar(varName) {
  if (currentThemeName != "custom") {
    return currentTheme[varName];
  } else {
    return customTheme[varName.replace("--", "").replace("-", "_")];
  }
}

export function getThemeQueryString(queryVars = []) {
  let queryString = "";
  if (currentThemeName != "custom") {
    queryVars.forEach((queryVar) => {
      themeVar = currentTheme["--" + queryVar];
      queryString += `&${queryVar}=${
        themeVar.startsWith("#") ? themeVar.substring(1) : themeVar
      }`;
    });
  } else {
    queryVars.forEach((queryVar) => {
      themeVar = customTheme[queryVar.replace("-", "_")];
      queryString += `&${queryVar}=${
        themeVar.startsWith("#") ? themeVar.substring(1) : themeVar
      }`;
    });
  }
  queryString = queryString.substring(1);
  return queryString;
}

export function getHiddenThemes() {
  let hiddenThemes = {};
  settingsTemplate.appearance.theme.forEach((key) => {
    if (themes[key]["display-name"].startsWith("__")) {
      hiddenThemes[key] = themes[key];
    }
  });
  return hiddenThemes;
}
