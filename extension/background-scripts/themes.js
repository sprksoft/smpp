import { loadJSON } from "./json-loader.js";

let themes;
let categories;

async function getAllThemes() {
  if (!themes) {
    themes = await loadJSON("background-scripts/data/themes.json");
  }
  return themes;
}

async function getAllThemeCategories() {
  if (!categories) {
    categories = await loadJSON(
      "background-scripts/data/theme-categories.json"
    );
  }
  return categories;
}

async function getThemeCategory(category) {
  let categories = await getAllThemeCategories();
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
