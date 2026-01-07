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

export async function getTheme(themeName: string): Promise<Theme> {
  let theme = (await browser.runtime.sendMessage({
    action: "getTheme",
    theme: themeName,
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
