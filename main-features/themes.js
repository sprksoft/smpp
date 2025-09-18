let themes;
let currentTheme;
let customTheme;

async function setTheme(themeName) {
  let style = document.documentElement.style;
  if (themeName != "custom") {
    Object.keys(themes[themeName]).forEach((key) => {
      style.setProperty(key, themes[themeName][key]);
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
  if (currentTheme != "custom") {
    return themes[currentTheme][varName];
  } else {
    return customTheme[varName.replace("--", "").replace("-", "_")];
  }
}

function getThemeQueryString(queryVars = []) {
  let queryString = "";
  if (currentTheme != "custom") {
    queryVars.forEach((queryVar) => {
      themeVar = themes[currentTheme]["--" + queryVar];
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
