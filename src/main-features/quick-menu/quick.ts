// @ts-nocheck

import { browser, openURL } from "../../common/utils.ts";
import { clearAllData } from "../../fixes-utils/utils.js";
import { resetPlant } from "../../widgets/plant.js";
import { openGlobalChat } from "../globalchat.js";
import { dmenuEditConfig, getDMenuOptionsForSettings } from "./config.js";
import { dmenu, dmenuConfig } from "./dmenu.js";

const quicks = [];
let links = [];
let vakken = [];
let goto_items = [];

if (document.querySelector(".topnav")) {
  fetch_links();
  fetch_vakken();
  scrape_goto();
}

function quick_cmd_list() {
  const cmd_list = [];
  for (let i = 0; i < quicks.length; i++) {
    cmd_list.push({ value: quicks[i].name, meta: `quick: ${quicks[i].url}` });
  }
  return cmd_list;
}

function add_quick(name, url) {
  const quick = { name: name.toLowerCase(), url: url };
  for (let i = 0; i < quicks.length; i++) {
    if (quicks[i].name === name) {
      quicks[i] = quick;
      quick_save();
      return;
    }
  }
  quicks.push(quick);
  quick_save();
}
function remove_quick(name) {
  for (let i = 0; i < quicks.length; i++) {
    if (quicks[i].name === name) {
      quicks.splice(i, 1);
      quick_save();
      return;
    }
  }
}

export async function quickLoad() {
  const quicks = await browser.runtime.sendMessage({
    action: "getSetting",
    name: "other.quicks",
  });
  if (!quicks) {
    return [];
  }
  return quicks;
}

async function quick_save() {
  await browser.runtime.sendMessage({
    action: "setSetting",
    name: "other.quicks",
    data: quicks,
  });
}

function add_quick_interactive() {
  const cmd_list = quick_cmd_list();
  dmenu(
    cmd_list,
    (name, _shift) => {
      value_list = [];
      for (let i = 0; i < quicks.length; i++) {
        if (quicks[i].name === name) {
          value_list = [{ value: quicks[i].url }];
          break;
        }
      }
      dmenu(
        value_list,
        (value, _shift) => {
          if (!value.startsWith("http")) {
            value = `https://${value}`;
          }
          add_quick(name, value);
        },
        "value:",
      );
    },
    "name:",
  );
}

function remove_quick_interactive() {
  const cmd_list = quick_cmd_list();
  dmenu(
    cmd_list,
    (name, _shift) => {
      remove_quick(name);
    },
    "name:",
  );
}

async function fetch_links() {
  links = [];
  const response = await fetch("/links/api/v1/");
  const contentType = response.headers.get("content-type");
  if (response.ok && contentType && contentType.includes("application/json")) {
    const response_data = await response.json();
    for (let i = 0; i < response_data.length; i++) {
      links.push({
        url: response_data[i].url,
        value: response_data[i].name.toLowerCase(),
        meta: "link",
      });
    }
  } else {
    console.error(`Fetching links failed (${response.status} http code)`);
    links = [];
  }
}

async function fetch_vakken() {
  vakken = [];
  const response = await fetch("/Topnav/getCourseConfig");
  const contentType = response.headers.get("content-type");
  if (response.ok && contentType && contentType.includes("application/json")) {
    const response_data = await response.json();
    for (let i = 0; i < response_data.own.length; i++) {
      const vak = response_data.own[i];
      let meta = "vak";
      if (vak.descr !== "") {
        meta += `  [ ${vak.descr} ]`;
      }
      vakken.push({ url: vak.url, value: vak.name.toLowerCase(), meta: meta });
    }
  } else {
    console.error(`Fetching vakken failed (${response.status} http code)`);
    vakken = [];
  }
}

function scrape_goto() {
  goto_items = [];
  const goto_items_html = document.querySelectorAll(".js-shortcuts-container a");
  for (let i = 0; i < goto_items_html.length; i++) {
    const item = goto_items_html[i];
    goto_items.push({
      url: item.href,
      value: item.innerText.toLowerCase().trim(),
      meta: "goto",
    });
  }
}

export function unbloat() {
  document.body.innerHTML = "";
}

export async function do_qm(opener = "") {
  let cmd_list = quick_cmd_list()
    .concat(goto_items)
    .concat(vakken)
    .concat(links)
    .concat([
      "home",
      "quick add",
      "quick remove",
      "unbloat",
      "config",
      "clearsettings",
      "discord",
      "toggle performance mode",
      "dizzy",
      "breakdmenu",
      "glass",
      "ridge",
      "reset plant",
      "remove current theme",
      "test cats",
      "posh text",
      "funny text",
    ]);

  if (dmenuConfig.toplevelConfig) {
    cmd_list = cmd_list.concat(await getDMenuOptionsForSettings(true));
  }

  dmenu(
    cmd_list,
    async (cmd) => {
      switch (cmd) {
        case "unbloat":
          unbloat();
          return;
        case "breakdmenu":
          await browser.runtime.sendMessage({
            action: "setSetting",
            name: "other.dmenu",
            data: {
              itemScore: false,
            },
          });
          return;
        case "config":
          dmenu(
            await getDMenuOptionsForSettings(false),
            (cmd, _shift) => {
              dmenuEditConfig(cmd);
            },
            "config: ",
          );
          return;
        case "quick add":
          add_quick_interactive();
          return;
        case "quick remove":
          remove_quick_interactive();
          return;
        case "discord":
          openURL("https://discord.com/invite/qCHZYepDqZ");
          return;
        case "home":
          openURL("/");
          return;
        case "clearsettings":
          clearAllData();
          return;
        case "ridge":
          document.body.classList.add("ridge");
          return;
        case "gcbeta":
          openGlobalChat(null, true);
          return;
        case "dizzy": {
          const styleEl = document.createElement("style");
          styleEl.innerText = `
                              *{
                                transition: transform 10s !important;
                              }
                              *:hover{
                                transform: rotate(360deg) !important;
                              }`;
          document.body.appendChild(styleEl);
          return;
        }
        case "reset plant":
          resetPlant();
          return;
        case "plant data":
          console.log(
            await browser.runtime.sendMessage({
              action: "getPlantAppData",
            }),
          );
          break;
        case "remove current theme": {
          const data = await browser.runtime.sendMessage({
            action: "getSettingsData",
          });
          await browser.runtime.sendMessage({
            action: "removeCustomTheme",
            id: data.appearance.theme,
          });
          break;
        }
        case "test cats": {
          const themes = await browser.runtime.sendMessage({
            action: "getThemes",
            categories: ["quickSettings"],
            includeHidden: true,
          });
          console.log(themes);
          break;
        }
        case "posh text":
          document.body.style.setProperty(
            "--font-family",
            `"Monsieur La Doulaise", "Montserrat", "Trebuchet MS", sans-serif`,
          );
          break;
        case "funny text":
          document.body.style.setProperty(
            "--font-family",
            `"Comic Neue", "Montserrat", "Trebuchet MS", sans-serif`,
          );
          break;
        default:
          break;
      }
      if (cmd.startsWith("config.")) {
        dmenuEditConfig(cmd);
      }

      for (let i = 0; i < quicks.length; i++) {
        const quick = quicks[i];
        if (quick.name === cmd) {
          openURL(quick.url, true);
          return;
        }
      }
      for (let i = 0; i < links.length; i++) {
        if (links[i].value === cmd) {
          openURL(links[i].url, true);
        }
      }
      for (let i = 0; i < goto_items.length; i++) {
        if (goto_items[i].value === cmd) {
          openURL(goto_items[i].url);
        }
      }
      for (let i = 0; i < vakken.length; i++) {
        if (vakken[i].value === cmd) {
          openURL(vakken[i].url);
        }
      }
    },
    "quick:",
    opener,
  );
}
