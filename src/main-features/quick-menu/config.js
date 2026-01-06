function gatherOptions(template, name) {
  let options = [];
  for (let keyName of Object.keys(template)) {
    const key = template[keyName];
    const newName = (name ? name + "." : "") + keyName;
    if (typeof key == "object" && !Array.isArray(key)) {
      options = options.concat(gatherOptions(template[keyName], newName));
    } else if (key == "array") {
      // we don't support arrays yet so just hide array options from the menu
      //TODO: maybe add array support
    } else {
      options.push({ meta: "config", value: newName });
    }
  }
  return options;
}

/// Returns an array with settings for dmenu
export async function getDMenuOptionsForSettings(toplevel) {
  const template = await browser.runtime.sendMessage({
    action: "getSettingsTemplate",
  });
  let options = [];
  for (let cat of Object.keys(template)) {
    options = options.concat(
      gatherOptions(template[cat], toplevel ? "config" : null)
    );
  }
  return options;
}

/// Get the full option path from a beautified option path.
// dmenu.itemScore => other.dmenu.itemScore
// config.dmenu.itemScore => other.dmenu.itemScore
function getFullOptPath(template, optName) {
  if (optName.startsWith("config.")) {
    optName = optName.substring("config.".length);
  }
  const first = optName.split(".")[0];
  for (let key of Object.keys(template)) {
    if (template[key][first] !== undefined) {
      return key + "." + optName;
    }
  }
  console.error(
    `Was not able to convert the optName '${optName}' to full because it was not found in the template json (returning an option with no category)`
  );
  return optName;
}

async function setSettingByPath(path, value) {
  await browser.runtime.sendMessage({
    action: "setSetting",
    name: path,
    data: value,
  });
  await apply();
}

export async function dmenuEditConfig(path) {
  const templates = await browser.runtime.sendMessage({
    action: "getSettingsTemplate",
  });
  configPath = getFullOptPath(templates, path);
  const template = getByPath(templates, configPath);

  let optionValue = await browser.runtime.sendMessage({
    action: "getSetting",
    name: configPath,
  });
  if (optionValue.error) {
    console.error("error from service worker: " + optionValue.error);
    optionValue = "worker error";
  }

  const label = path + " (" + optionValue + "): ";
  if (template == "boolean") {
    dmenu(
      ["true", "false"],
      function (cmd, shift) {
        if (cmd == "true") {
          setSettingByPath(configPath, true);
        } else if (cmd == "false") {
          setSettingByPath(configPath, false);
        }
      },
      label
    );
  } else if (template == "number") {
    dmenu(
      [],
      function (cmd, shift) {
        if (configPath == "appearance.background.blur" && cmd == "song 2") {
          openURL("https://www.youtube.com/watch?v=Bz4l9_bzfZM", true);
          return;
        }
        setSettingByPath(configPath, new Number(cmd));
      },
      label
    );
  } else if (Array.isArray(template)) {
    dmenu(
      template,
      function (cmd, shift) {
        setSettingByPath(configPath, cmd);
      },
      label
    );
  } else {
    if (template !== "string") {
      console.error(
        "Invalid template type: '" +
          template +
          "' Falling back to 'string' template type"
      );
    }
    dmenu(
      [],
      function (cmd, shift) {
        setSettingByPath(configPath, cmd);
      },
      label
    );
  }
}
