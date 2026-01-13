//@ts-nocheck
import { loadJSON } from "./json-loader.js";
import { browser } from "../common/utils.js";
import { removeImage } from "./data-background-script.js";
import { getSettingsData } from "./settings.js";

let nativeThemes;
let categories;

async function getAllThemes() {
  if (!nativeThemes) {
    nativeThemes = await loadJSON("background-scripts/data/themes.json");
  }
  let customThemes = await getAllCustomThemes();
  let themes = { ...nativeThemes, ...customThemes };
  return themes;
}

export async function getThemeCategories(
  includeEmpty = false,
  includeHidden = false
) {
  let allCategories = await getAllThemeCategories();
  console.log(allCategories);
  if (!includeHidden) {
    let hiddenThemeKeys = await getThemeCategory("hidden");
    Object.keys(categories).forEach((category) => {
      console.log(categories[category]);
      categories[category].forEach((theme) => {
        if (hiddenThemeKeys.includes(theme)) delete categories[category][theme];
      });
    });
  }
  if (!includeEmpty) {
    Object.keys(categories).forEach((category) => {
      if (!categories[category] || !categories[category][0])
        delete categories[category];
    });
  }
  return allCategories;
}

export async function getAllThemeCategories() {
  if (!categories) {
    categories = await loadJSON(
      "background-scripts/data/theme-categories.json"
    );
  }
  categories.custom = await getCustomCategory();
  categories.quickSettings = await getQuickSettingsThemes();
  return categories;
}

export async function getFirstThemeInCategory(category, includeHidden) {
  let themeNames = await getThemeCategory(category);
  console.log(category, themeNames);
  if (!themeNames[0]) return "error";
  return themeNames[0];
}

async function getQuickSettingsThemes() {
  let data = await getSettingsData();
  return data.appearance.quickSettingsThemes;
}

async function getThemeCategory(category) {
  let categories = await getAllThemeCategories();
  return categories[category];
}

export async function getThemes(
  categories: string[] = ["all"],
  includeHidden = false,
  mustMatchAllCategories = false
) {
  let themes = await getAllThemes();
  if (categories.includes("all")) return themes;

  let allowedThemeKeys = await Promise.all(
    categories.map((category) => getThemeCategory(category))
  );
  console.log(allowedThemeKeys);
  if (mustMatchAllCategories) {
    allowedThemeKeys = allowedThemeKeys[0].filter((themeKey) =>
      allowedThemeKeys.every((arr) => arr.includes(themeKey))
    );
  } else {
    allowedThemeKeys = allowedThemeKeys.flat();
  }

  if (!includeHidden) {
    let hiddenThemeKeys = await getThemeCategory("hidden");
    allowedThemeKeys = allowedThemeKeys.filter(
      (themeKey) => !hiddenThemeKeys.includes(themeKey)
    );
  }
  const filteredThemes = Object.fromEntries(
    Object.entries(themes).filter(([key]) => allowedThemeKeys.includes(key))
  );
  return filteredThemes;
}

export async function getTheme(name) {
  let allThemes = await getAllThemes();
  let theme = allThemes[name];
  if (theme != undefined) {
    return theme;
  } else {
    console.error(`Invalid theme requested:"${name}", sent "error" theme`);
    return allThemes["error"];
  }
}

async function getAllCustomThemes() {
  const result = await browser.storage.local.get("customThemes");
  return result.customThemes || {};
}

async function getCustomCategory() {
  const customThemes = await getAllCustomThemes();
  let customCategory = Object.keys(customThemes);
  return customCategory;
}

export async function saveCustomTheme(data, id = undefined) {
  if (id === undefined) id = crypto.randomUUID();

  const customThemes = await getAllCustomThemes();
  customThemes[id] = data;
  await browser.storage.local.set({ customThemes });
  return id;
}

export async function removeCustomTheme(id) {
  const customThemes = await getAllCustomThemes();
  delete customThemes[id];
  await removeImage(id);
  await browser.storage.local.set({ customThemes });
}
