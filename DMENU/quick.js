let quicks = quick_load();

let links = [];
let vakken = []
let goto_items = []

if (document.querySelector(".topnav")) {
  fetch_links();
  fetch_vakken();
  scrape_goto();
}


function quick_cmd_list() {
  let cmd_list = []
  for (let i = 0; i < quicks.length; i++) {
    cmd_list.push({ value: quicks[i].name, meta: "quick: " + quicks[i].url })
  }
  return cmd_list;
}

function add_quick(name, url) {
  let quick = { name: name.toLowerCase(), url: url };
  for (let i = 0; i < quicks.length; i++) {
    if (quicks[i].name == name) {
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

function quick_load() {
  let quicks = get_config().quicks;
  if (quicks == undefined) {
    return []
  }
  if (quicks == undefined) {
    return []
  }
  return quicks
}

function quick_save() {
  let config = get_config();
  config.quicks = quicks;
  set_config(config);
}

function add_quick_interactive() {
  let cmd_list = quick_cmd_list();
  dmenu(cmd_list, function (name, shift) {
    value_list = []
    for (let i = 0; i < quicks.length; i++) {
      if (quicks[i].name == name) {
        value_list = [{ value: quicks[i].url }]
        break;
      }
    }
    dmenu(value_list, function (value, shift) {
      if (!value.startsWith("http")) {
        value = "https://" + value;
      }
      add_quick(name, value);
    }, "value:")
  }, "name:");

}

function remove_quick_interactive() {
  let cmd_list = quick_cmd_list();
  dmenu(cmd_list, function (name, shift) {
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
  const contentType = response.headers.get("content-type");
  if (response.ok && contentType && contentType.includes("application/json")) {
    let response_data = await response.json();
    for (let i = 0; i < response_data.length; i++) {
      links.push({ url: response_data[i].url, value: response_data[i].name.toLowerCase(), meta: "link" });
    }
  } else {
    console.error("Fetching links failed (" + response.status + " http code)")
    links = [];
  }
}

async function fetch_vakken() {
  vakken = []
  let response = await fetch("/Topnav/getCourseConfig")
  const contentType = response.headers.get("content-type");
  if (response.ok && contentType && contentType.includes("application/json")) {
    let response_data = await response.json();
    for (let i = 0; i < response_data.own.length; i++) {
      let vak = response_data.own[i]
      let meta = "vak";
      if (vak.descr != "") {
        meta += "  [ " + vak.descr + " ]"
      }
      vakken.push({ url: vak.url, value: vak.name.toLowerCase(), meta: meta });
    }
  } else {
    console.error("Fetching vakken failed (" + response.status + " http code)")
    vakken = [];
  }

}

function scrape_goto() {
  goto_items = []
  let goto_items_html = document.querySelectorAll(".js-shortcuts-container > a");
  for (let i = 0; i < goto_items_html.length; i++) {
    const item = goto_items_html[i];
    goto_items.push({ url: item.href, value: item.innerText.toLowerCase().trim(), meta: "goto" })
  }
}


function do_qm(open_key = "") {
  let cmd_list = quick_cmd_list().concat(goto_items).concat(vakken).concat(links.concat(["home", "dmenu config", "quick add", "quick remove", "config", "toggle fancy scores", "lock dmenu", "unbloat", "clearsettings", "discord"]));

  dmenu(cmd_list, function (cmd) {
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
        } else {
          settingData.show_scores = true
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
        open_url("https://discord.com/invite/qCHZYepDqZ");
        return;
      case "home":
        open_url("/");
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
      if (links[i].value == cmd) {
        open_url(links[i].url, true);
      }
    }
    for (let i = 0; i < goto_items.length; i++) {
      if (goto_items[i].value == cmd) {
        open_url(goto_items[i].url);
      }
    }
    for (let i = 0; i < vakken.length; i++) {
      if (vakken[i].value == cmd) {
        open_url(vakken[i].url);
      }
    }

  }, "quick:", open_key = open_key);
}

document.addEventListener("keyup", function (e) {
  if (e.target != undefined && e.target.tagName === "INPUT") {
    return
  }
  if (e.key == ':') {
    do_qm(":");
  }
});

const topNav = document.querySelector("nav.topnav")
if (topNav && document.querySelector("#dmenutooltip") == undefined) {
  const quickButton = document.createElement("button");
  quickButton.id = "dmenutooltip" //TODO: change this to something more meaningful
  quickButton.className = "topnav__btn"
  quickButton.innerText = "Quick"
  quickButton.addEventListener("click", function () {
    do_qm(quickButton);
  })

  const goGlChatButton = document.createElement("button");
  goGlChatButton.id = "global_chat_button"
  goGlChatButton.className = "topnav__btn"
  goGlChatButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="3009 50 450 450" class="st1">
  <g>
    <g id="Laag_1">
      <path d="M3436.9,158.5c0-3.6-.4-7-.9-10.8-2.6-20.6-12.9-39.8-29-53.9-16.3-14.2-37-22.1-58.4-22.1h-.3c-56,.2-112.9.2-168,.1-29.2,0-58.3,0-87.5,0-3.9,0-8.1.3-12.9.9-20.5,2.7-39.5,12.9-53.6,28.9-14.2,16.1-22,36.6-21.9,57.6,0,31.4,0,63.4,0,94.3,0,26.1,0,52.2,0,78.3,0,3.8.3,7.6.9,11.5,5.4,33.9,24.4,57.5,56.3,70,6.6,2.6,13.5,3.9,20.7,5.3,2.3.5,4.7.9,7.1,1.4v1.7c0,5.2,0,10.3,0,15.5,0,13.6-.1,27.8.3,41.6.2,5.9,2.4,12.3,5.8,16.7,4.2,5.5,10.2,8.8,16.7,9.2.5,0,1,0,1.5,0,6.7,0,13.2-2.9,18.6-8.3,26.5-26.4,50.9-50.9,74.5-74.7,1.9-1.9,3.5-2.5,6.2-2.5h0c51.1.1,93.2.1,132.5,0,6.7,0,13.5-.7,20.4-2,40.4-7.5,70.9-44.1,71-85.1,0-59.1,0-119.9,0-173.5h0ZM3203.6,344.5c-16.5,14.1-40.7,21.6-70,21.6s-51.3-6.3-66.1-15.2l-2.8-1.7,12.1-43,4.7,2.7c11.8,6.8,32.5,14,54.8,14s38.4-10.1,38.4-27-10.1-23.9-38.8-34c-44.9-15.6-66.8-38.7-66.8-70.6s8.6-37.8,24.1-50.4c15.9-12.9,37.9-19.8,63.7-19.8s34.1,2.6,48.1,7.7c1.2.4,2.4.9,3.9,1.5h.1c0,0,3.5,1.6,3.5,1.6l30.3,13.2,18.8-43.2,39.7,17.2-18.8,43.2,41.4,18-17.2,39.7-41.4-18-18.8,43.2-39.7-17.2,18.8-43.2-19.7-8.6v.5c-.1,0-4.8-2.3-4.8-2.3-9.4-4.8-24.9-10.4-45.3-10.4s-34.5,12.5-34.5,23.3,9.1,21.2,42.3,33.7c43.7,16,63.2,38.2,63.2,71.9s-8.3,38.7-23.4,51.6h0ZM3375.4,308.6c-3.8,11.3-8.8,22.3-14.8,32.6l-2,3.4-2-.9-34.7-15.1-19,43.7-40-17.4,19-43.7-41.9-18.2,17.4-40,41.9,18.2,19-43.7,40,17.4-19,43.7,37.4,16.2-1.3,3.7h0Z"/>
      <path style="fill: var(--color-base01)"d="M3227,292.9c0,20.4-8.3,38.7-23.4,51.6-16.5,14.1-40.7,21.6-70,21.6s-51.3-6.3-66.1-15.2l-2.8-1.7,12.1-43,4.7,2.7c11.8,6.8,32.5,14,54.8,14s38.4-10.1,38.4-27-10.1-23.9-38.8-34c-44.9-15.6-66.8-38.7-66.8-70.6s8.6-37.8,24.1-50.4c15.9-12.9,37.9-19.8,63.7-19.8s34.1,2.6,48.1,7.7c1.2.4,2.4.9,3.9,1.5h.1c0,0,3.5,1.6,3.5,1.6l30.3,13.2,18.8-43.2,39.7,17.2-18.8,43.2,41.4,18-17.2,39.7-41.4-18-18.8,43.2-39.7-17.2,18.8-43.2-19.7-8.6v.5c-.1,0-4.8-2.3-4.8-2.3-9.4-4.8-24.9-10.4-45.3-10.4s-34.5,12.5-34.5,23.3,9.1,21.2,42.3,33.7c43.7,16,63.2,38.2,63.2,71.9h0Z"/>
      <path style="fill: var(--color-base01)"d="M3376.6,304.9l-1.3,3.7c-3.8,11.3-8.8,22.3-14.8,32.6l-2,3.4-2-.9-34.7-15.1-19,43.7-40-17.4,19-43.7-41.9-18.2,17.4-40,41.9,18.2,19-43.7,40,17.4-19,43.7,37.4,16.2h0Z"/>
    </g>
  </g>
</svg>
`
  goGlChatButton.addEventListener("click",open_global_chat)
  const secondItem = topNav.childNodes[2];
  topNav.insertBefore(quickButton, secondItem);
  topNav.insertBefore(goGlChatButton, secondItem);
}

