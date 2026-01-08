import { loadJSON } from "./json-loader.js";
import { browser } from "./background-script.js";
import { removeImage } from "./data-background-script.js";

let nativeThemes;
let categories;

async function getAllThemes() {
  if (!nativeThemes) {
    nativeThemes = await loadJSON("background-scripts/data/themes.json");
  }
  let customThemes = await getAllCustomThemes();
  let themes = { ...nativeThemes, ...customThemes };
  console.log("All custom themes:", customThemes);
  console.log("All themes:", themes);
  return themes;
}

export async function getAllThemeCategories() {
  if (!categories) {
    categories = await loadJSON(
      "background-scripts/data/theme-categories.json"
    );
  }
  categories.custom = getCustomCategory();
  return categories;
}

async function getThemeCategory(category) {
  console.log("Getting theme category:", category);
  let categories = await getAllThemeCategories();
  console.log("Gave:", categories);
  return categories[category];
}

export async function getThemes(
  categories = ["all"],
  includeHidden = false,
  mustMatchAllCategories = false
) {
  let themes = await getAllThemes();
  if (categories.includes("all")) return themes;

  let allowedThemeKeys = await Promise.all(
    categories.map((category) => getThemeCategory(category))
  );

  if (mustMatchAllCategories) {
    // don't even ask me whats happening here
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
  console.log(customCategory);
  return customCategory;
}

export async function saveCustomTheme(data, id = undefined) {
  if (id === undefined) {
    id = crypto.randomUUID();
  }
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
