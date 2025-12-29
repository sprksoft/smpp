import { fillObjectWithDefaults } from "./utils.js";
import { loadJSON } from "./json-loader.js";
import { getAllThemes } from "./data-background-script.js";

let settingsTemplate = loadJSON(
  "background-scripts/data/settings-template.json"
);
settingsTemplate.appearance.theme = Object.keys(getAllThemes());

let defaultSettings = loadJSON("background-scripts/data/default-settings.json");

export function getSettingsTemplate() {
  return settingsTemplate;
}

export function getDefaultSettings() {
  return defaultSettings;
}

export async function getSettingsData() {
  let data = (await browser.storage.local.get("settingsData")).settingsData;
  data = fillObjectWithDefaults(data, getDefaultSettings());

  let categorized = {};
  const template = getSettingsTemplate();
  for (const cat of Object.keys(template)) {
    for (const fieldName of Object.keys(template[cat])) {
      if (!categorized[cat]) {
        categorized[cat] = {};
      }
      Object.assign(categorized[cat], { [fieldName]: data[fieldName] });
    }
  }
  console.log(categorized);
  return categorized;
}

export async function setSettingsData(data) {
  const settings = {};
  for (const category of Object.keys(data)) {
    Object.assign(settings, data[category]);
  }
  await browser.storage.local.set({ settingsData: settings });
}
