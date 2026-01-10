import { widgetSystemNotifyThemeChange } from "../../widgets/widgets.js";
import { browser } from "../../common/utils.js";
import { colord } from "colord";

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

export class colorPicker {
  currentColor = colord("#72b6c0ff");
  width = "20rem";
  element = document.createElement("div");
  hueSlider = document.createElement("div");
  fieldContainer = document.createElement("div");

  createHueSlider() {
    return this.hueSlider;
  }

  render() {
    this.fieldContainer.classList.add("smpp-color-picker-field");
    this.fieldContainer.style.width = this.width;
    this.updateField();
    let horizontalContainer = document.createElement("div");
    horizontalContainer.style.background = `linear-gradient(to right, var(--max-sat) 0%, rgba(255, 255, 255, 1) 100%)`;
    let verticalContainer = document.createElement("div");
    verticalContainer.style.background =
      "linear-gradient(to top, black, transparent)";
    this.fieldContainer.appendChild(horizontalContainer);
    this.fieldContainer.append(verticalContainer);

    this.element.appendChild(this.createHueSlider());
    this.element.appendChild(this.fieldContainer);

    return this.element;
  }

  updateField() {
    let maxSatColor = this.currentColor.saturate(100);
    this.fieldContainer.style.setProperty("--max-sat", maxSatColor.toHex());
  }
}
