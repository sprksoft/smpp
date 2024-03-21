let quicks = quick_load();
let links=undefined;

function quick_cmd_list(){
  let cmd_list=[]
  for (let i = 0; i < quicks.length; i++) {
    cmd_list.push({value: quicks[i].name, meta: "quick: "+quicks[i].url})
  }
  return cmd_list;
}

function add_quick(name, url) {
  let quick = { name: name, url: url };
  for (let i = 0; i < quicks.length; i++) {
    if (quicks[i].name == name){
      quicks[i] = quick
      quick_save();
      return;
    }
  }
  quicks.push(quick);
  quick_save();
}
function remove_quick(name) {
  for (let i = 0; i < quicks.length; i++) {
    if (quicks[i].name == name) {
      quicks.splice(i, 1);
      quick_save();
      return;
    }
  }
}

function quick_load(){
  let quicks = window.localStorage.getItem("quicks");
  if (quicks == undefined){
    return []
  }
  quicks = JSON.parse(quicks);
  if (quicks == undefined){
    return []
  }
  return quicks
}

function quick_save(){
  window.localStorage.setItem("quicks", JSON.stringify(quicks));
}

function add_quick_interactive(){
  let cmd_list = quick_cmd_list();
  dmenu(cmd_list, function(name, shift){
    value_list=[]
    for (let i = 0; i < quicks.length; i++) {
      if (quicks[i].name == name){
        value_list = [{value: quicks[i].url}]
          break;
      }
    }
    dmenu(value_list, function(value, shift){
      add_quick(name, value);
    }, "value:")
  }, "name:");

}

function remove_quick_interactive() {
  let cmd_list = quick_cmd_list();
  dmenu(cmd_list, function(name, shift) {
    remove_quick(name);
  }, "name:")
}


//TODO: make this better
function config_menu() {
  let conf = get_config();
  let cmd_list = Object.keys(conf);
  dmenu(cmd_list, function (cmd, shift) {
    conf[cmd] = dmenu([], function (val, shift) {
      conf[cmd] = val;
      set_config(conf);
    }, "value:")
  }, "config: ");
}

async function fetch_links() {
  links = []
  let responce = await fetch("/links/api/v1/")
  if (responce.ok){
    let response_data = await responce.json();
    for (let i = 0; i < response_data.length; i++) {
      links.push({value: response_data[i].name.toLowerCase(), meta: "link: "+response_data[i].url});
    }
  }else{
    links=undefined;
  }
}


async function handleDMenu() {
  if (links == undefined){
    await fetch_links();
  }

  let cmd_list =quick_cmd_list().concat(links.concat(Object.keys(vakken).concat(Object.keys(goto_items).concat(["dmenu config", "quick add", "quick remove", "config", "toggle fancy scores", "lock dmenu", "unbloat", "clearsettings", "discord"]))));

  dmenu(cmd_list, function (cmd, shift) {
    switch (cmd) {
      case "lock dmenu":
        lock_dmenu = !lock_dmenu;
        return;
      case "unbloat":
        unbloat();
        return;
      case "set background":
        dmenu([], function (url) {
          set_background(url);
          store_background(url);
        }, "bg url:");
        return;
      case "config":
        config_menu();
        return;
      case "toggle fancy scores":
        settingData = get_config()
        if (settingData.show_scores) {
          settingData.show_scores = false
          console.log("Turned show scores off")
        } else {
          settingData.show_scores = true
          console.log("Turned show scores on")
        }
        set_config(settingData)
        return;
      case "dmenu config":
        dconfig_menu();
        return;
      case "quick add":
        add_quick_interactive();
        return;
      case "quick remove":
        remove_quick_interactive();
        return;
      case "discord":
        open_url("https://discord.gg/TCBgGxUP", shift);
        return;
      case "clearsettings":
        clearsettings();
        return;
      default:
        break;
    }
    for (let i = 0; i < quicks.length; i++) {
      const quick = quicks[i];
      if (quick.name == cmd) {
        open_url(quick.url, shift);
        return;
      }
    }

    let got_url = goto_items[cmd]
    if (got_url != null) {
      open_url(got_url, shift);
      return;
    }
    let vakken_url = vakken[cmd];
    if (vakken_url != null) {
      open_url(vakken_url, shift);
      return;
    }



  }, "quick:");
}

document.addEventListener("keyup", function (e) {
  if (e.target != undefined && e.target.tagName === "INPUT") {
    return
  }
  if (e.key == ':') {
    handleDMenu();
  }
});

const firstItem = document.querySelector('.topnav > *:first-child');
if (firstItem) {
  firstItem.insertAdjacentHTML('afterend', `<button id="dmenutooltip" class=topnav__btn>Quick-Menu</button>`);
}
const dMenuButton = document.getElementById('dmenutooltip');
if (dMenuButton) {
  dMenuButton.addEventListener('click', handleDMenu);
}
