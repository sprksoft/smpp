async function loadJSON(path) {
  const url = chrome.runtime.getURL(path);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load JSON: ${path}`);
  }
  return response.json();
}

export async function initGlobals() {
  const [
    themes,
    settingsOptions,
    defaultSettings,
    defaultPlantData,
    fallbackColorData,
  ] = await Promise.all([
    loadJSON("background-scripts/data/themes.json"),
    loadJSON("background-scripts/data/settings-options.json"),
    loadJSON("background-scripts/data/default-settings.json"),
    loadJSON("background-scripts/data/default-plant-data.json"),
    loadJSON("background-scripts/data/delijn-kleuren.json"),
  ]);

  // Expand themes in settings
  settingsOptions.appearance.theme = Object.keys(themes);

  // Attach to globalThis so they're everywhere
  Object.assign(globalThis, {
    themes,
    settingsOptions,
    defaultSettings,
    defaultPlantData,
    fallbackColorData,
  });
  let globalsInitialized = true;
  Object.assign(globalThis, { globalsInitialized });

  console.log("JSON data loaded");
}
