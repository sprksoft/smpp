const dmenu_config_template = {
  centered: { type: "bool", default_value: true },
  item_score: { type: "bool", default_value: false },
};

let dconfig_cache = undefined;

function dconfig_menu() {
  let conf = get_dconfig();
  const template = dmenu_config_template;
  let cmd_list = Object.keys(template);
  for (let i = 0; i < cmd_list.length; i++) {
    let cmd = cmd_list[i];
    cmd_list[i] = { meta: " (" + conf[cmd_list[i]] + ")", value: cmd };
  }
  dmenu(
    cmd_list,
    function (cmd, shift) {
      let type = template[cmd].type;
      let options = [];
      if (type == "bool") {
        options = ["true", "false"];
      }
      dmenu(
        options,
        function (val, shift) {
          if (type == "bool") {
            conf[cmd] = val == "true";
          } else {
            conf[cmd] = val;
          }
          set_dconfig(conf);
        },
        "value(" + conf[cmd] + "):"
      );
    },
    "dconfig: "
  );
}

function default_dconfig() {
  let keys = Object.keys(dmenu_config_template);
  let config = {};
  for (let i = 0; i < keys.length; i++) {
    config[keys[i]] = dmenu_config_template[keys[i]].default_value;
  }

  return config;
}

function get_dconfig() {
  if (dconfig_cache !== undefined) {
    return dconfig_cache;
  }
  let conf = PLEASE_DELETE_ME_WHEN_FIXED();
  if (conf == undefined || conf.dmenu == undefined) {
    return default_dconfig();
  }
  dconfig_cache = conf.dmenu;
  return conf.dmenu;
}
function set_dconfig(config) {
  let conf = PLEASE_DELETE_ME_WHEN_FIXED();
  conf.dmenu = config;
  set_config(conf);
  dconfig_cache = config;
}
