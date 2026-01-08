import { browser } from "../main.js";
import { widgetSystemNotifyThemeChange } from "../../widgets/widgets.js";

export let currentThemeName: string;
export let currentTheme: Theme;

export type Theme = {
  displayName: string;
  cssProperties: { [key: string]: string };
};

export type Themes = {
  [key: string]: Theme;
};

export async function getTheme(name: string): Promise<Theme> {
  let theme = (await browser.runtime.sendMessage({
    action: "getTheme",
    name: name,
  })) as Theme;
  return theme;
}

export async function setTheme(themeName: string) {
  const style = document.documentElement.style;
  currentThemeName = themeName;
  currentTheme = await getTheme(themeName);
  console.log(currentTheme);
  Object.entries(currentTheme.cssProperties).forEach(([key, value]) => {
    style.setProperty(key, value);
  });

  await widgetSystemNotifyThemeChange();
}

export function getThemeQueryString(theme: Theme) {
  let query = "";
  Object.entries(theme.cssProperties).forEach(([key, value]) => {
    query += `&${key}=${value.startsWith("#") ? value.substring(1) : value}`;
  });
  return query;
}

export function getThemeVar(varName: string) {
  return currentTheme.cssProperties[varName];
}

export async function exampleSaveCustomTheme() {
  let testCustomTheme: Theme = {
    displayName: "testTheme",
    cssProperties: {
      "--color-accent": "#4d5da2",
      "--color-text": "#1c1916",
      "--color-base00": "#f5fefe",
      "--color-base01": "#eef7f7",
      "--color-base02": "#dde6e6",
      "--color-base03": "#cfd7d7",
      "--color-homepage-sidebars-bg": "rgba(100, 100, 100, 0.2)",
      "--darken-background": "rgba(215, 215, 215, 0.40)",
      "--color-splashtext": "#120500",
    },
  };
  let id = await browser.runtime.sendMessage({
    action: "saveCustomTheme",
    data: testCustomTheme,
  });

  let data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  data.appearance.theme = id;
  await browser.runtime.sendMessage({
    action: "setSettingsData",
    data: data,
  });
  console.log(await getTheme("default"));
}
