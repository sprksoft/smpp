const dmenu_config_template = {
  centered: { type: "bool", default_value: true },
  flip_shift_key: { type: "bool", default_value: true },
  item_score: { type: "bool", default_value: false },
  exit_on_focusout: { type: "bool", default_value: false }
}

var lock_dmenu = false;
var command_list = [];
var end_func = undefined; var open = false;
var selected = -1;
var user_text = "";
var no_type = true;
var view_item_score;

var dconfig_cache = undefined;

function dconfig_menu() {
  let conf = get_dconfig();
  const template = dmenu_config_template;
  let cmd_list = Object.keys(template);
  for (let i = 0; i < cmd_list.length; i++) {
    let cmd = cmd_list[i];
    cmd_list[i] = { meta: " (" + conf[cmd_list[i]] + ")", value: cmd }
  }
  dmenu(cmd_list, function (cmd, shift) {
    let type = template[cmd].type;
    let options = [];
    if (type == "bool") {
      options = ["true", "false"]
    }
    dmenu(options, function (val, shift) {
      if (type == "bool") {
        conf[cmd] = (val == "true");
      } else {
        conf[cmd] = val;
      }
      set_dconfig(conf);
    }, "value(" + conf[cmd] + "):")
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
  view_item_score = dconfig.item_score;
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
    let cmd;
    let meta = undefined;
    if (typeof params[i] == "string") {
      cmd = params[i].toLowerCase();
    } else {
      cmd = params[i].value;
      meta = params[i].meta;
    }
    command_list.push(cmd);
    let row = document.createElement("div");
    row.classList.add("autocomplete-row");
    row.innerHTML = '<div class="content"></div><div class="meta"></div><div class="score"></div>'
    row.getElementsByClassName("content")[0].innerText = cmd;
    if (view_item_score) {
      row.getElementsByClassName("score")[0].innerText = "0";
    }
    if (meta != undefined) {
      row.getElementsByClassName("meta")[0].innerText = meta;
    }

    row.addEventListener("click", function (e) {
      if (selected == i) {
        dmenu_accept();
        return;
      }
      select(i);
    })
    autocompletelist.appendChild(row);
  }

  let input = dmenu.getElementsByTagName("input")[0];
  input.focus();
  input.value = ""

}
function dmenu_accept(shift = false) {
  let command = document.querySelector("#dmenu > .top > .dmenu-input").value;
  lock_dmenu = false;
  dmenu_close();
  if (end_func != undefined && command !== "") {
    let dconfig = get_dconfig();
    if (dconfig.flip_shift_key) {
      shift = !shift;
    }
    end_func(command, shift);
  }
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

function match_score(str, match) {
  let score = 0;
  let mi = 0;
  let streak = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] == match[mi]) {
      if (i == mi) {
        score += (streak + 1) * 8;
      } else {
        score += (streak + 1) * 2;
      }
      mi += 1;
      streak += 1;
    } else {
      streak = 0;
    }
  }
  if (mi < match.length) {
    return 0;
  }
  if (score < 0) {
    score = 0;
  }
  return score;
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
  input.value = new_sel.getElementsByClassName("content")[0].innerText;

  selected = index;
}

function dmenu_update_search(command) {
  select(-1);
  let dmenu = document.getElementById("dmenu");
  let input = dmenu.getElementsByTagName("input")[0];
  let autocompletelist = dmenu.getElementsByClassName("autocomplete")[0];

  let i = 0;
  while (true) {
    if (sort(autocompletelist, command, i) || i > 100) {
      break;
    }
    i++;
  }
}

function sort(autocompletelist, command, start_index) {
  let nodes = autocompletelist.childNodes;
  let lscore = 0;
  let lscore_node = null;
  let move_down = [];
  let is_sorted = true;
  for (let i = start_index; i < nodes.length; i++) {
    let node = nodes[i];
    let text;
    text = node.getElementsByClassName("content")[0].innerText;
    let score = match_score(text, command);
    if (view_item_score) {
      node.getElementsByClassName("score")[0].innerText = score;
    }
    if (score == 0 && command != "") {
      node.classList.add("hidden");
      move_down.push(nodes[i]);
    } else {
      node.classList.remove("hidden");
      if (!(lscore < score)) {
        is_sorted = false;
      }
    }
    if (lscore < score) {
      lscore = score;
      lscore_node = nodes[i];
    }
  }
  if (lscore_node !== null) {
    autocompletelist.insertBefore(lscore_node, autocompletelist.childNodes[start_index]);
  }
  for (let i = 0; i < move_down.length; i++) {
    autocompletelist.insertBefore(move_down[i], autocompletelist.lastChild);
  }
  return is_sorted;
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
  dmenu.innerHTML = `<div class='top'>
  <label class='dmenu-label'>dmenu:</label>
  <input class='dmenu-input' type='text'>
</div>
<div class='autocomplete'></div>
`;
  let autocomplete = dmenu.getElementsByClassName("autocomplete")[0];
  document.body.insertBefore(dmenu, document.body.childNodes[-1]);
  let input = dmenu.getElementsByTagName("input")[0]
  document.addEventListener("click", function (e) {
    if (get_dconfig().exit_on_focusout) {
      return;
    }
    if (dmenu.contains(e.target)) {
      return;
    }
    dmenu_close();
  })
  input.addEventListener("focusout", function (e) {
    if (get_dconfig().exit_on_focusout) {
      dmenu_close();
    }
  });
  input.addEventListener("keydown", function (e) {
    if (e.key == ":" && no_type) {
      e.preventDefault();
      return;
    }


    let command = e.target.value;
    if (e.key == "Enter") {
      dmenu_accept(e.shiftKey);
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
      select(-1)
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
