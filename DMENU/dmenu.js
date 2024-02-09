const dmenu_config_template = {
  centered: { type: "bool", default_value: true },
  flip_shift_key: { type: "bool", default_value: false },
}

var lock_dmenu = false;
var command_list = [];
var end_func = undefined; var open = false;
var selected = -1;
var user_text = "";
var no_type = true;

var dconfig_cache = undefined;

function dconfig_menu() {
  let conf = get_dconfig();
  const template = dmenu_config_template;
  let cmd_list = Object.keys(template);
  for (let i = 0; i < cmd_list.length; i++) {
    cmd_list[i] += " (" + conf[cmd_list[i]] + ")"
  }
  dmenu(cmd_list, function (cmd, shift) {
    let settingname = cmd.substring(0, cmd.lastIndexOf(" "));
    console.log(settingname);
    let type = template[settingname].type;
    let options = [];
    if (type == "bool") {
      options = ["true", "false"]
    }
    template[settingname] = dmenu(options, function (val, shift) {
      if (type == "bool") {
        conf[settingname] = Boolean(val);
      } else {
        conf[settingname] = val;
      }
      set_dconfig(conf);
    }, "value(" + conf[settingname] + "):")
  }, "dconfig: ");

}

function default_dconfig() {
  let keys = Object.keys(dmenu_config_template);
  let config = {}
  for (let i = 0; i < keys.length; i++) {
    config[keys[i]] = dmenu_config_template[keys[i]].default_value;
  }

  return config;
}

//TODO: should probably not be in here
function get_config() {
  let conf = JSON.parse(window.localStorage.getItem("settingsdata"));
  if (conf == undefined) {
    conf = default_settings;
  }
  return conf
}
//TODO: should probably not be in here
function set_config(config) {
  window.localStorage.setItem("settingsdata", JSON.stringify(config));
  apply();
}
function get_dconfig() {
  if (dconfig_cache !== undefined) {
    return dconfig_cache;
  }
  let conf = get_config();
  if (conf == undefined || conf.dmenu == undefined) {
    return default_dconfig();
  }
  dconfig_cache = conf.dmenu;
  return conf.dmenu;
}
function set_dconfig(config) {
  let conf = get_config();
  conf.dmenu = config;
  set_config(conf);
  dconfig_cache = config;
}

function dmenu(params, onselect, name = "dmenu:") {
  if (open) {
    return;
  }
  open = true;
  no_type = true;
  selected = -1;
  command_list = [];
  end_func = onselect;
  user_text = "";
  let dconfig = get_dconfig();
  let dmenu = document.getElementById("dmenu");
  dmenu.getElementsByClassName("dmenu-label")[0].innerText = name;
  dmenu.classList.remove("dmenu-hidden");

  if (dconfig.centered) {
    if (!dmenu.classList.contains("dmenu-centered")) {
      dmenu.classList.add("dmenu-centered");
    }
  } else {
    dmenu.classList.remove("dmenu-centered");
  }

  let autocompletelist = dmenu.getElementsByClassName("autocomplete")[0];
  autocompletelist.innerHTML = "";
  for (let i = 0; i < params.length; i++) {
    const cmd = params[i].toLowerCase();
    command_list.push(cmd);
    let thing = document.createElement("div");
    thing.innerText = cmd;
    autocompletelist.appendChild(thing);
  }

  let input = dmenu.getElementsByTagName("input")[0];
  input.focus();
  input.value = ""

}
function dmenu_close() {
  if (lock_dmenu) {
    return;
  }
  open = false;
  let dmenu = document.getElementById("dmenu");
  dmenu.classList.add("dmenu-hidden");
  return dmenu.getElementsByTagName("input")[0].value;
}

function get_match_count(str, match) {
  let match_count = 0;
  let largest_match = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] == match[match_count]) {
      match_count += 1;
      if (largest_match < match_count) {
        largest_match = match_count;
      }
    } else {
      match_count = 0;
    }
  }
  return largest_match;
}

function select(index) {
  if (index < -1) {
    return;
  }
  if (selected === index) {
    return;
  }
  let dmenu = document.getElementById("dmenu");
  let input = dmenu.getElementsByTagName("input")[0];
  let autocompletelist = dmenu.getElementsByClassName("autocomplete")[0];
  if (autocompletelist.childNodes.length <= index) {
    return;
  }
  let old_sel = autocompletelist.childNodes[selected];
  if (old_sel != undefined) {
    old_sel.classList.remove("selected");
  }

  if (index == -1) {
    selected = -1;
    input.value = user_text;
    user_text = "";
    return;
  }
  let new_sel = autocompletelist.childNodes[index];
  new_sel.classList.add("selected");
  new_sel.scrollIntoView();
  if (user_text == "") {
    user_text = input.value;
  }
  input.value = new_sel.innerText;

  selected = index;
}

function dmenu_update_search(command) {
  select(-1);
  let dmenu = document.getElementById("dmenu");
  let input = dmenu.getElementsByTagName("input")[0];
  let autocompletelist = dmenu.getElementsByClassName("autocomplete")[0];

  let nodes = autocompletelist.childNodes;
  let largest_match_count = 0;
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    let mcount = get_match_count(node.innerText, command);
    if (mcount == 0 && command != "") {
      node.classList.add("hidden");
      autocompletelist.insertBefore(node, nodes[-1]);
    } else {
      node.classList.remove("hidden");
    }
    if (largest_match_count < mcount) {
      largest_match_count = mcount;
      autocompletelist.insertBefore(node, nodes[0]);
    }
  }

}
function dmenu_select_next(prev = false) {
  let dmenu = document.getElementById("dmenu");
  let autocompletelist = dmenu.getElementsByClassName("autocomplete")[0];

  let inc = (prev * -2) + 1;
  let nodes = autocompletelist.childNodes;
  for (let i = selected + inc; i > -2 && i < nodes.length; i += inc) {
    const node = nodes[i];
    if (i == -1 || !node.classList.contains("hidden")) {
      select(i);
      return;
    }
  }
}

function init_dmenu() {
  let dconfig = get_dconfig();
  let old_dmenu = document.getElementById("dmenu");
  if (old_dmenu != undefined) {
    old_dmenu.remove();
  }
  let dmenu = document.createElement("div");
  dmenu.id = "dmenu";
  dmenu.classList.add("dmenu");
  dmenu.classList.add("dmenu-hidden");
  dmenu.innerHTML = "<div class='top'><label class='dmenu-label'>dmenu:</label><input class='dmenu-input' type='text'></div><div class='autocomplete'></div>";
  document.body.insertBefore(dmenu, document.body.childNodes[-1]);
  let input = dmenu.getElementsByTagName("input")[0]
  input.addEventListener("focusout", function (e) {
    dmenu_close();
  });
  input.addEventListener("keydown", function (e) {
    if (e.key == ":" && no_type) {
      e.preventDefault();
      return;
    }


    let command = e.target.value;
    if (e.key == "Enter") {
      lock_dmenu = false;
      dmenu_close();
      if (end_func != undefined && command !== "") {
        let shift = e.shiftKey;
        if (dconfig.flip_shift_key) {
          shift = !shift;
        }
        end_func(command, shift);
      }
      return;
    } else if (e.key == "Escape") {
      dmenu_close();
      return;
    } else if ((e.key == "Tab" && e.shiftKey) || e.key == "ArrowUp") {
      dmenu_select_next(true);
      e.preventDefault();
      return;
    } else if ((e.key == "Tab" && !e.shiftKey) || e.key == "ArrowDown") {
      dmenu_select_next(false);
      e.preventDefault();
      return;
    }
    else if (e.key == "Backspace") {
      if (command == "" && no_type) {
        dmenu_close();
        return;
      }
      user_text = e.target.value;
    }
  });
  input.addEventListener("keyup", function (e) {
    if (e.key != "Shift" && e.key != "Control" && e.key != "Tab" && e.key != "ArrowUp" && e.key != "ArrowDown") {
      let command = e.target.value;
      dmenu_update_search(command);
      no_type = false;
    }
  });

}


init_dmenu();
