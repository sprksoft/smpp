"use strict";
(() => {
  // src/common/utils.ts
  var browser;
  if (browser == void 0) {
    browser = chrome;
  }
  function getByPath(object, path) {
    if (!path) {
      return object;
    }
    let ob = object;
    for (let node of path.split(".")) {
      ob = ob[node];
      if (ob === void 0) {
        throw `getByPath: ${node} did not exist in path ${path}`;
      }
    }
    return ob;
  }
  function setByPath(object, path, value) {
    let ob = object;
    const pathSplit = path.split(".");
    for (let i = 0; i < pathSplit.length - 1; i++) {
      ob = ob[pathSplit[i]];
      if (ob === void 0) {
        throw `setByPath: ${pathSplit[i]} did not exist in path ${path}`;
      }
    }
    ob[pathSplit[pathSplit.length - 1]] = value;
  }
  function fillObjectWithDefaults(object, defaults) {
    if (!object) {
      object = {};
    }
    for (const key of Object.keys(defaults)) {
      if (typeof defaults[key] === "object" && !Array.isArray(defaults[key]) && defaults[key] !== null) {
        object[key] = fillObjectWithDefaults(object[key], defaults[key]);
      }
      if (object[key] === void 0) {
        object[key] = defaults[key];
      }
    }
    return object;
  }

  // src/background-scripts/api-background-script.js
  async function fetchWeatherData(location) {
    const apiKey = "2b6f9b6dbe5064dd770f29d4b229a22c";
    try {
      console.log("Fetching Weather data...");
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching Weather data:", error);
      return {
        cod: 69,
        message: "error code for internal use"
      };
    }
  }
  async function fetchDelijnData(apiUrl) {
    const apiKey = "ddb68605719d4bb8b6444b6871cefc7a";
    try {
      console.log("Fetching Delijn data...");
      const response = await fetch(apiUrl, {
        headers: { "Ocp-Apim-Subscription-Key": apiKey }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching Delijn data:", error);
    }
  }

  // src/background-scripts/json-loader.ts
  async function loadJSON(path) {
    const url = browser.runtime.getURL(path);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${path}`);
    }
    return await response.json();
  }

  // src/background-scripts/data-background-script.js
  function getDefaultCustomThemeData() {
    return {
      color_accent: "#a3a2ec",
      color_base00: "#38313a",
      color_base01: "#826882",
      color_base02: "#ac85b7",
      color_base03: "#c78af0",
      color_text: "#ede3e3"
    };
  }
  var defaultPlantData;
  async function getDefaultPlantData() {
    if (!defaultPlantData) {
      defaultPlantData = await loadJSON(
        "background-scripts/data/default-plant-data.json"
      );
    }
    return defaultPlantData;
  }
  async function getPlantAppData() {
    let data = await browser.storage.local.get("plantAppData");
    let plantAppData = data.plantAppData || getDefaultPlantData();
    return plantAppData;
  }
  async function getCustomThemeData() {
    let data = await browser.storage.local.get("customThemeData");
    return data.customThemeData || getDefaultCustomThemeData();
  }
  var fallBackColorData;
  async function getFallbackColorData() {
    if (!fallBackColorData) {
      fallBackColorData = await loadJSON(
        "background-scripts/data/delijn-kleuren.json"
      );
    }
  }
  async function getDelijnColorData() {
    try {
      let data = await browser.storage.local.get("delijnColorData");
      let delijnColorData;
      if (data.delijnColorData?.kleuren != void 0) {
        delijnColorData = data.delijnColorData;
      } else {
        delijnColorData = await fetchDelijnData(
          "https://api.delijn.be/DLKernOpenData/api/v1/kleuren"
        );
      }
      await browser.storage.local.set({
        delijnColorData
      });
      console.log("Retrieved Delijn Color Data.");
      return delijnColorData;
    } catch (error) {
      console.error("Error retrieving Delijn Color Data:", error);
      return getFallbackColorData;
    }
  }
  async function setImage(id, data) {
    const images = (await browser.storage.local.get("images")).images || {};
    images[id] = data;
    await browser.storage.local.set({ images });
  }
  async function getImage(id) {
    const images = (await browser.storage.local.get("images")).images || {};
    if (!images[id]) return { type: "default", link: null, imageData: null };
    return images[id];
  }
  async function removeImage(id) {
    const images = (await browser.storage.local.get("images")).images || {};
    delete images[id];
    await browser.storage.local.set({ images });
  }

  // src/background-scripts/themes.ts
  var nativeThemes;
  var categories;
  async function getAllThemes() {
    if (!nativeThemes) {
      nativeThemes = await loadJSON("background-scripts/data/themes.json");
    }
    let customThemes = await getAllCustomThemes();
    let themes = { ...nativeThemes, ...customThemes };
    return themes;
  }
  async function getThemeCategories(includeEmpty = false, includeHidden = false) {
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
  async function getAllThemeCategories() {
    if (!categories) {
      categories = await loadJSON(
        "background-scripts/data/theme-categories.json"
      );
    }
    categories.quickSettings = await getQuickSettingsThemes();
    categories.custom = await getCustomCategory();
    return categories;
  }
  async function getFirstThemeInCategory(category, includeHidden) {
    let themeNames = await getThemeCategory(category);
    if (!themeNames[0]) return "error";
    return themeNames[0];
  }
  async function getQuickSettingsThemes() {
    let data = await getSettingsData();
    return data.appearance.quickSettingsThemes;
  }
  async function getThemeCategory(category) {
    let categories2 = await getAllThemeCategories();
    return categories2[category];
  }
  async function getThemes(categories2 = ["all"], includeHidden = false, mustMatchAllCategories = false) {
    let themes = await getAllThemes();
    if (categories2.includes("all")) return themes;
    let allowedThemeKeys = await Promise.all(
      categories2.map((category) => getThemeCategory(category))
    );
    if (mustMatchAllCategories) {
      allowedThemeKeys = allowedThemeKeys[0].filter(
        (themeKey) => allowedThemeKeys.every((arr) => arr.includes(themeKey))
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
  async function getTheme(name) {
    let allThemes = await getAllThemes();
    let theme = allThemes[name];
    if (theme != void 0) {
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
  async function saveCustomTheme(data, id = void 0) {
    if (id === void 0) id = crypto.randomUUID();
    const customThemes = await getAllCustomThemes();
    customThemes[id] = data;
    await browser.storage.local.set({ customThemes });
    return id;
  }
  async function removeCustomTheme(id) {
    const customThemes = await getAllCustomThemes();
    delete customThemes[id];
    await removeImage(id);
    let data = await getSettingsData();
    let quickSettingsThemes = data.appearance.quickSettingsThemes.filter(
      (name) => {
        return name != id;
      }
    );
    setByPath(data, "appearance.quickSettingsThemes", quickSettingsThemes);
    await setSettingsData(data);
    await browser.storage.local.set({ customThemes });
  }

  // src/background-scripts/settings.js
  var settingsTemplate;
  var defaultSettings;
  async function getSettingsTemplate() {
    if (!settingsTemplate) {
      settingsTemplate = await loadJSON(
        "background-scripts/data/settings-template.json"
      );
    }
    settingsTemplate.appearance.theme = Object.keys(await getThemes());
    return settingsTemplate;
  }
  async function getDefaultSettings() {
    if (!defaultSettings) {
      defaultSettings = await loadJSON(
        "background-scripts/data/default-settings.json"
      );
    }
    return defaultSettings;
  }
  async function getSettingsData() {
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
  async function setSettingsData(data) {
    const settings = {};
    for (const category of Object.keys(data)) {
      Object.assign(settings, data[category]);
    }
    await browser.storage.local.set({ settingsData: settings });
  }

  // src/background-scripts/index.ts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sendResponse);
    return true;
  });
  async function handleMessage(message, sendResponse) {
    try {
      if (message.action === "clearLocalStorage") {
        browser.storage.local.clear();
        sendResponse({ success: true });
        console.log("Cleared browser storage");
      }
      if (message.action === "getThemes") {
        let themes = await getThemes(
          message.categories,
          message.includeHidden,
          message.mustMatchAllCategories
        );
        sendResponse(themes);
        console.log(
          `Themes for categories: ${message.categories} sent, including hidden themes: ${message.includeHidden ? true : false}`
        );
        console.log(themes);
      }
      if (message.action === "getTheme") {
        let theme = await getTheme(message.name);
        sendResponse(theme);
        console.log(`Theme ${message.name} sent.`);
      }
      if (message.action == "getThemeCategories") {
        let categories2 = await getThemeCategories(
          message.includeEmpty,
          message.includeHidden
        );
        sendResponse(categories2);
        console.log(`Theme categories sent: ${categories2}`);
      }
      if (message.action == "getFirstThemeInCategory") {
        let categories2 = await getFirstThemeInCategory(
          message.category,
          message.includeHidden
        );
        sendResponse(categories2);
        console.log(`Theme categories sent: ${categories2}`);
      }
      if (message.action === "saveCustomTheme") {
        let id = await saveCustomTheme(message.data, message.id);
        sendResponse(id);
        console.log(`Custom theme ${message.id} saved as:`);
        console.log(message.data);
      }
      if (message.action === "removeCustomTheme") {
        await removeCustomTheme(message.id);
        sendResponse({ success: true });
        console.log(`Theme ${message.id} removed.`);
      }
      if (message.action === "getCustomThemeData") {
        const customThemeData = await getCustomThemeData();
        sendResponse(customThemeData);
        console.log("Custom theme data data sent.");
      }
      if (message.action === "setCustomThemeData") {
        await browser.storage.local.set({ customThemeData: message.data });
        sendResponse({ success: true });
        console.log("Custom theme data saved.");
      }
      if (message.action === "setImage") {
        await setImage(message.id, message.data);
        sendResponse({ success: true });
        console.log(`Image with id:${message.id} saved.`);
      }
      if (message.action === "getImage") {
        const image = await getImage(message.id);
        sendResponse(image || null);
        console.log(`Image with id:${message.id} sent.`);
      }
      if (message.action === "fetchWeatherData") {
        const weatherData = await fetchWeatherData(message.location);
        sendResponse(weatherData);
        console.log("Weather data fetched and sent.");
      }
      if (message.action === "fetchDelijnData") {
        const delijnData = await fetchDelijnData(message.url);
        sendResponse(delijnData);
        console.log("Delijn appdata fetched and sent.");
      }
      if (message.action === "getDelijnColorData") {
        let delijnColorData = await getDelijnColorData();
        sendResponse(delijnColorData);
        console.log("Delijn color data fetched and sent.");
      }
      if (message.action === "setPlantAppData") {
        await browser.storage.local.set({ plantAppData: message.data });
        sendResponse({ success: true });
      }
      if (message.action === "getPlantAppData") {
        const plantAppData = await getPlantAppData();
        sendResponse(plantAppData);
        console.log("Plant appdata sent.");
      }
      if (message.action === "setSetting") {
        const settingsData = await getSettingsData();
        setByPath(settingsData, message.name, message.data);
        await setSettingsData(settingsData);
        console.log(settingsData);
        sendResponse({ success: true });
      }
      if (message.action === "getSetting") {
        const settingsData = await getSettingsData();
        sendResponse(getByPath(settingsData, message.name));
        console.log("Setting " + message.name + "sent");
      }
      if (message.action === "setSettingsData") {
        await setSettingsData(message.data);
        sendResponse({ success: true });
        console.log("Settings data saved.");
      }
      if (message.action === "getSettingsData") {
        let settingsData = await getSettingsData();
        console.log(settingsData);
        sendResponse(settingsData);
        console.log("Settings data sent.");
      }
      if (message.action === "getSettingsTemplate") {
        const settingsTemplate2 = await getSettingsTemplate();
        sendResponse(getByPath(settingsTemplate2, message.name));
        console.log("Settings options sent.");
      }
      if (message.action === "getWidgetLayout") {
        console.log("Loading widget layout...");
        const data = await browser.storage.local.get("widgets");
        sendResponse(data.widgets);
      }
      if (message.action === "setWidgetLayout") {
        console.log("Saving widget layout...");
        await browser.storage.local.set({ widgets: message.layout });
        sendResponse({ success: true });
      }
      if (message.action === "getWidgetData") {
        console.log("Loading widget data...");
        const widgetId = "Game." + message.widget;
        let data = await browser.storage.local.get(widgetId);
        data = data[widgetId];
        sendResponse(data);
      }
      if (message.action === "setWidgetData") {
        console.log("Saving widget data...");
        let data = {};
        data["Game." + message.widget] = message.data;
        await browser.storage.local.set(data);
        sendResponse({ success: true });
      }
      if (message.action === "getDelijnAppData") {
        const delijnAppData = await browser.storage.local.get("delijnAppData");
        await browser.storage.local.remove("delijnAppData");
        sendResponse(delijnAppData);
        console.log("delijnAppData sent.");
      }
      if (message.action === "getWeatherAppData") {
        const weatherAppData = await browser.storage.local.get("weatherAppData");
        await browser.storage.local.remove("weatherAppData");
        sendResponse(weatherAppData);
        console.log("weatherAppData sent.");
      }
      if (message.action === "getBackgroundImage") {
        const backgroundImage = await browser.storage.local.get("backgroundImage");
        await browser.storage.local.remove("backgroundImage");
        sendResponse(backgroundImage);
        console.log("Background image sent.");
      }
      if (message.action === "getRawSettingsData") {
        let rawSettingsData = (await browser.storage.local.get("settingsData")).settingsData;
        sendResponse(rawSettingsData);
        console.log("Raw settings data sent.");
      }
      if (message.action === "setRawSettingsData") {
        console.log("Saving raw settings data...");
        console.log(message.data);
        await browser.storage.local.set({ settingsData: message.data });
        sendResponse({ success: true });
      }
    } catch (err) {
      console.error("Service worker error:", err);
      sendResponse({ error: err.message || String(err) });
    }
  }
})();
