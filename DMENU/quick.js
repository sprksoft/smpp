let quicks = quick_load();

let links=[];
fetch_links();

let vakken=[]
fetch_vakken();

let goto_items=[]
scrape_goto();

function quick_cmd_list(){
  let cmd_list=[]
  for (let i = 0; i < quicks.length; i++) {
    cmd_list.push({value: quicks[i].name, meta: "quick: "+quicks[i].url})
  }
  return cmd_list;
}

function add_quick(name, url) {
  let quick = { name: name.toLowerCase(), url: url };
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
  let response = await fetch("/links/api/v1/")
  if (response.ok){
    let response_data = await response.json();
    for (let i = 0; i < response_data.length; i++) {
      links.push({url: response_data[i].url, value: response_data[i].name.toLowerCase(), meta: "link"});
    }
  }else{
    console.log("Fetching links failed ("+responce.status+" http code)")
    links=[];
  }
}

async function fetch_vakken(){
  vakken = []
  let response = await fetch("/Topnav/getCourseConfig")
  if (response.ok){
    let response_data = await response.json();
    for (let i = 0; i < response_data.own.length; i++) {
      let vak = response_data.own[i]
      let meta = "vak";
      if (vak.descr != ""){
        meta+="  [ "+vak.descr+" ]"
      }
      vakken.push({url: vak.url, value: vak.name.toLowerCase(), meta: meta});
    }
  }else{
    console.log("Fetching vakken failed ("+responce.status+" http code)")
    vakken=[];
  }

}

function scrape_goto(){
  goto_items=[]
  let goto_items_html = document.querySelectorAll(".js-shortcuts-container > a");
  for (let i = 0; i < goto_items_html.length; i++) {
    const item = goto_items_html[i];
    goto_items.push({url: item.href, value: item.innerText.toLowerCase().trim(), meta: "goto" })
  }
}


function do_qm(open_key="") {
  let cmd_list = quick_cmd_list().concat(goto_items).concat(vakken).concat(links.concat(["dmenu config", "quick add", "quick remove", "config", "toggle fancy scores", "lock dmenu", "unbloat", "clearsettings", "discord"]));

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
        open_url("https://discord.com/invite/qCHZYepDqZ", shift);
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
        open_url(quick.url, true);
        return;
      }
    }
    for (let i = 0; i < links.length; i++) {
      if (links[i].value == cmd){
        open_url(links[i].url, true);
      }
    }
    for (let i = 0; i < goto_items.length; i++) {
      if (goto_items[i].value == cmd){
        open_url(goto_items[i].url, shift);
      }
    }
    for (let i = 0; i < vakken.length; i++) {
      if (vakken[i].value == cmd){
        open_url(vakken[i].url, shift);
      }
    }

  }, "quick:", open_key=open_key);
}

document.addEventListener("keyup", function (e) {
  if (e.target != undefined && e.target.tagName === "INPUT") {
    return
  }
  if (e.key == ':') {
    do_qm(":");
  }
});

const quickButton = document.createElement("button");
quickButton.id = "dmenutooltip" //TODO: change this to something more meaningful
quickButton.className="topnav__btn"
quickButton.innerText="[qm]"
quickButton.addEventListener("click", function(){
  do_qm(quickButton);
})

const topNav = document.querySelector("nav.topnav")
const secondItem = topNav.childNodes[2];
topNav.insertBefore(quickButton, secondItem);
