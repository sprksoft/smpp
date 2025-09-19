let currentThemeName;
let currentTheme;
let customTheme;

async function setTheme(themeName) {
  let style = document.documentElement.style;
  currentThemeName = themeName;
  currentTheme = await browser.runtime.sendMessage({
    action: "getTheme",
    theme: themeName,
  });
  if (themeName != "custom") {
    Object.keys(currentTheme).forEach((key) => {
      style.setProperty(key, currentTheme[key]);
    });
  } else {
    const themeData = await browser.runtime.sendMessage({
      action: "getCustomThemeData",
    });
    customTheme = themeData;
    const settingsData = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });
    Object.keys(themeData).forEach((key) => {
      style.setProperty("--" + key.replace("_", "-"), themeData[key]);
    });
    if (settingsData.backgroundSelection == 0) {
      style.setProperty("--loginpage-image", "url(https://about:blank)");
    }
  }
  await widgetSystemNotifyThemeChange();
}
function getThemeVar(varName) {
  if (currentThemeName != "custom") {
    return currentTheme[varName];
  } else {
    return customTheme[varName.replace("--", "").replace("-", "_")];
  }
}

function getThemeQueryString(queryVars = []) {
  let queryString = "";
  if (currentThemeName != "custom") {
    queryVars.forEach((queryVar) => {
      themeVar = currentTheme["--" + queryVar];
      queryString += `&${queryVar}=${
        themeVar.startsWith("#") ? themeVar.substring(1) : themeVar
      }`;
    });
  } else {
    queryVars.forEach((queryVar) => {
      themeVar = customTheme[queryVar.replace("-", "_")];
      queryString += `&${queryVar}=${
        themeVar.startsWith("#") ? themeVar.substring(1) : themeVar
      }`;
    });
  }
  queryString = queryString.substring(1);
  return queryString;
}
