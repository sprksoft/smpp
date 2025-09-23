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
async function getDMenuOptionsForSettings(toplevel) {
  const template = await browser.runtime.sendMessage({
    action: "getSettingsOptions",
  });
  let options = [];
  for (let cat of Object.keys(template)) {
    options = options.concat(gatherOptions(template[cat], toplevel ? "config" : null));
  }
  return options;
}

/// Get the full option path from a beautified option path.
// dmenu.item_score => other.dmenu.item_score
// config.dmenu.item_score => other.dmenu.item_score
function getFullOptPath(template, optName) {
  if (optName.startsWith("config.")) {
    optName = optName.substring("config.".length);
  }
  const first = optName.split(".")[0];
  for (let key of Object.keys(template)) {
    if (template[key][first] !== undefined) {
      return key+"."+optName;
    }
  }
  console.error(`Was not able to convert the optName '${optName}' to full because it was not found in the template json (returning an option with no category)`);
  return optName;
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
  await browser.runtime.sendMessage({
    action: "setSettingsCategory",
    category: path,
    data: value,
  });
  await apply();
}

async function dmenuEditConfig(path) {
  const templates = await browser.runtime.sendMessage({
    action: "getSettingsOptions",
  });
  configPath = getFullOptPath(templates, path);
  const template = getByPath(templates, configPath);

  let optionValue = await browser.runtime.sendMessage({
    action: "getSettingsCategory",
    category: configPath,
  });

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
