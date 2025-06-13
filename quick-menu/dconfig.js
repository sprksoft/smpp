const dmenu_config_template = {
  centered: { type: "bool", default_value: true },
  item_score: { type: "bool", default_value: false },
};

function defaultDconfig() {
  let keys = Object.keys(dmenu_config_template);
  let config = {};
  for (let i = 0; i < keys.length; i++) {
    config[keys[i]] = dmenu_config_template[keys[i]].default_value;
  }

  return config;
}

let dmenu_config = defaultDconfig();

async function dconfig_menu() {
  let conf = dmenu_config;
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
        },
        "value(" + conf[cmd] + "):"
      );
    },
    "dconfig: "
  );
}

