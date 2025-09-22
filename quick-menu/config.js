function gatherOptions(template, name) {
  let options = [];
  for (let keyName of Object.keys(template)) {
    const key = template[keyName];
    if (typeof key == "object" && !Array.isArray(key)) {
      options = options.concat(
        gatherOptions(template[keyName], name + "." + keyName),
      );
    } else if (key == "array") { // we don't support arrays yet so just hide array options from the menu
      //TODO: maybe add array support
    } else {
      options.push({ meta: "config", value: name + "." + keyName });
    }
  }
  return options;
}

/// Returns an array with settings for dmenu
async function getDMenuOptionsForSettings() {
  const template = await browser.runtime.sendMessage({
    action: "getSettingsOptions",
  });
  return gatherOptions(template, "config");
}

function getByPath(object, path) {
  let ob = object;
  for (let node of path.split(".")) {
    ob = ob[node];
  }
  return ob;
}
function setByPath(object, path, value) {
  let ob = object;
  const pathSplit = path.spli(".");
  for (let i = 0; i < pathSplit.length - 1; i++) {
    ob = ob[pathSplit[i]];
  }
  ob[pathSplit[pathSplit.length - 1]] = value;
}

async function setSettingByPath(path, value) {
  console.log("setting "+path+" to "+value);
  await browser.runtime.sendMessage({
    action: "setSettingsCategory",
    category: path,
    data: value,
  });
}

async function dmenuEditConfig(configPath) {
  configPath = configPath.substring("config.".length);
  const templates = await browser.runtime.sendMessage({
    action: "getSettingsOptions",
  });
  const template = getByPath(templates, configPath);

  let option = await browser.runtime.sendMessage({
    action: "getSettingsCategory",
    category: configPath,
  });
  console.log(option);

  const label = configPath + " (" + option + "): ";
  if (template == "boolean") {
    dmenu(
      ["true", "false"],
      function (cmd, shift) {
        setSettingByPath(configPath, cmd);
      },
      label,
    );
  } else if (template == "number") {
    dmenu(
      [],
      function (cmd, shift) {
        setSettingByPath(configPath, new Number(cmd));
      },
      label,
    );
  } else if (Array.isArray(template)) {
    dmenu(
      template,
      function (cmd, shift) {
        setSettingByPath(configPath, cmd);
      },
      label,
    );
  } else {
    console.error(
      "Invalid template type: '" +
        template +
        "' Falling back to 'string' template type",
    );
    dmenu(
      [],
      function (cmd, shift) {
        setSettingByPath(configPath, cmd);
      },
      label,
    );
  }
}
