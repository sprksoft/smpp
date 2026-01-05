export async function loadJSON(path) {
  const url = chrome.runtime.getURL(path);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load JSON: ${path}`);
  }
  return await response.json();
}

export async function initGlobals() {
  const defaultPlantData = await loadJSON(
    "background-scripts/data/default-plant-data.json"
  );
  const fallbackColorData = await loadJSON(
    "background-scripts/data/delijn-kleuren.json"
  );

  // Attach to globalThis so they're everywhere
  Object.assign(globalThis, {
    defaultPlantData,
    fallbackColorData,
  });
  let globalsInitialized = true;
  Object.assign(globalThis, { globalsInitialized });

  console.log("JSON data loaded");
}
