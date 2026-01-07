if (typeof browser === "undefined") {
  var browser = chrome;
}

import { fillObjectWithDefaults } from "./utils.js";
import { loadJSON } from "./json-loader.js";
import { getThemes } from "./themes.js";

let settingsTemplate;
let defaultSettings;

export async function getSettingsTemplate() {
  if (!settingsTemplate) {
    settingsTemplate = await loadJSON(
      "background-scripts/data/settings-template.json"
    );
    settingsTemplate.appearance.theme = Object.keys(await getThemes());
  }
  return settingsTemplate;
}

export async function getDefaultSettings() {
  if (!defaultSettings) {
    defaultSettings = await loadJSON(
      "background-scripts/data/default-settings.json"
    );
  }
  return defaultSettings;
}

export async function getSettingsData() {
  let data = (await browser.storage.local.get("settingsData")).settingsData;
  data = fillObjectWithDefaults(data, await getDefaultSettings());

  let categorized = {};
  const template = await getSettingsTemplate();
  for (const cat of Object.keys(template)) {
    for (const fieldName of Object.keys(template[cat])) {
      if (!categorized[cat]) {
        categorized[cat] = {};
      }
      Object.assign(categorized[cat], { [fieldName]: data[fieldName] });
    }
  }
  return categorized;
}

export async function setSettingsData(data) {
  const settings = {};
  for (const category of Object.keys(data)) {
    Object.assign(settings, data[category]);
  }
  await browser.storage.local.set({ settingsData: settings });
}
