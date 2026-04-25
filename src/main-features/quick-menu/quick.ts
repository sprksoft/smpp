// @ts-nocheck
import { dmenu, dmenuConfig } from "./dmenu.js";
import { getDMenuOptionsForSettings, dmenuEditConfig } from "./config.js";
import { clearAllData } from "../../fixes-utils/utils.js";
import { openGlobalChat } from "../globalchat.js";
import { resetPlant } from "../../widgets/plant.js";
import { openURL, browser } from "../../common/utils.ts";

let quicks = [];
let links = [];
let vakken = [];
let goto_items = [];
let favoriteKeys = [];

function normalizeQuick(quick) {
  return {
    name: quick.name.toLowerCase(),
    url: quick.url,
    favorite: quick.favorite ?? false,
  };
}

function makeFavoriteKey(kind, value) {
  return `${kind}:${value.toLowerCase()}`;
}

function isFavoriteKey(favoriteKey) {
  return favoriteKeys.includes(favoriteKey);
}

async function loadFavoriteKeys() {
  const loadedFavoriteKeys = await browser.runtime.sendMessage({
    action: "getSetting",
    name: "other.quickFavorites",
  });
  favoriteKeys = Array.isArray(loadedFavoriteKeys)
    ? loadedFavoriteKeys.map((key) => String(key).toLowerCase())
    : [];
}

async function saveFavoriteKeys() {
  await browser.runtime.sendMessage({
    action: "setSetting",
    name: "other.quickFavorites",
    data: favoriteKeys,
  });
}

function setFavoriteKey(favoriteKey, nextFavorite) {
  const normalizedKey = favoriteKey.toLowerCase();
  const hasKey = favoriteKeys.includes(normalizedKey);

  if (nextFavorite && !hasKey) {
    favoriteKeys.push(normalizedKey);
  }

  if (!nextFavorite && hasKey) {
    favoriteKeys = favoriteKeys.filter((key) => key != normalizedKey);
  }

  void saveFavoriteKeys();
}

function createQuickMenuItem(kind, value, meta, extra = {}) {
  const favoriteKey = makeFavoriteKey(kind, value);
  const favorite = isFavoriteKey(favoriteKey);
  const extraFavoriteToggle = extra.onFavoriteToggle;
  return {
    ...extra,
    value,
    meta,
    favorite,
    favoriteKey,
    onFavoriteToggle: (nextFavorite) => {
      setFavoriteKey(favoriteKey, nextFavorite);
      if (typeof extraFavoriteToggle == "function") {
        extraFavoriteToggle(nextFavorite);
      }
    },
  };
}

if (document.querySelector(".topnav")) {
  fetch_links();
  fetch_vakken();
  scrape_goto();
}

function quick_cmd_list() {
  let cmd_list = [];
  for (let quick of quicks) {
    cmd_list.push(
      createQuickMenuItem("quick", quick.name, "quick", {
        url: quick.url,
      })
    );
  }
  return cmd_list;
}

function add_quick(name, url, favorite = undefined) {
  let quick = { name: name.toLowerCase(), url: url, favorite: favorite ?? false };
  for (let i = 0; i < quicks.length; i++) {
    if (quicks[i].name == name) {
      quick.favorite = favorite ?? quicks[i].favorite ?? false;
      quicks[i] = quick;
      quick_save();
      return;
    }
  }
  quicks.push(quick);
  quick_save();
}
function set_quick_favorite(name, favorite) {
  for (let i = 0; i < quicks.length; i++) {
    if (quicks[i].name == name) {
      quicks[i].favorite = favorite;
      quick_save();
      return;
    }
  }
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

export async function quickLoad() {
  await loadFavoriteKeys();
  const loadedQuicks = await browser.runtime.sendMessage({
    action: "getSetting",
    name: "other.quicks",
  });
  if (!loadedQuicks) {
    quicks = [];
    return [];
  }
  quicks = loadedQuicks.map(normalizeQuick);
  const migratedFavoriteKeys = quicks
    .filter((quick) => quick.favorite)
    .map((quick) => makeFavoriteKey("quick", quick.name));
  const mergedFavoriteKeys = [...new Set([...favoriteKeys, ...migratedFavoriteKeys])];
  if (mergedFavoriteKeys.length !== favoriteKeys.length) {
    favoriteKeys = mergedFavoriteKeys;
    await saveFavoriteKeys();
  }
  quicks = quicks.map((quick) => ({
    ...quick,
    favorite: isFavoriteKey(makeFavoriteKey("quick", quick.name)),
  }));
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
  let cmd_list = quick_cmd_list();
  dmenu(
    cmd_list,
    function (name, shift) {
      let value_list = [];
      for (let i = 0; i < quicks.length; i++) {
        if (quicks[i].name == name) {
          value_list = [{ value: quicks[i].url }];
          break;
        }
      }
      dmenu(
        value_list,
        function (value, shift) {
          if (!value.startsWith("http")) {
            value = "https://" + value;
          }
          add_quick(name, value);
        },
        "value:"
      );
    },
    "name:"
  );
}

function remove_quick_interactive() {
  let cmd_list = quick_cmd_list();
  dmenu(
    cmd_list,
    function (name, shift) {
      remove_quick(name);
    },
    "name:"
  );
}

async function fetch_links() {
  links = [];
  let response = await fetch("/links/api/v1/");
  const contentType = response.headers.get("content-type");
  if (response.ok && contentType && contentType.includes("application/json")) {
    let response_data = await response.json();
    for (let i = 0; i < response_data.length; i++) {
      links.push({
        url: response_data[i].url,
        value: response_data[i].name.toLowerCase(),
        meta: "link",
      });
    }
  } else {
    console.error("Fetching links failed (" + response.status + " http code)");
    links = [];
  }
}

async function fetch_vakken() {
  vakken = [];
  let response = await fetch("/Topnav/getCourseConfig");
  const contentType = response.headers.get("content-type");
  if (response.ok && contentType && contentType.includes("application/json")) {
    let response_data = await response.json();
    for (let i = 0; i < response_data.own.length; i++) {
      let vak = response_data.own[i];
      let meta = "vak";
      if (vak.descr != "") {
        meta += "  [ " + vak.descr + " ]";
      }
      vakken.push({ url: vak.url, value: vak.name.toLowerCase(), meta: meta });
    }
  } else {
    console.error("Fetching vakken failed (" + response.status + " http code)");
    vakken = [];
  }
}

function scrape_goto() {
  goto_items = [];
  let goto_items_html = document.querySelectorAll(".js-shortcuts-container a");
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
  await loadFavoriteKeys();
  let cmd_list = quick_cmd_list()
    .concat(
      goto_items.map((item) =>
        createQuickMenuItem("goto", item.value, item.meta, { url: item.url })
      )
    )
    .concat(
      vakken.map((item) =>
        createQuickMenuItem("vak", item.value, item.meta, { url: item.url })
      )
    )
    .concat(
      links.map((item) =>
        createQuickMenuItem("link", item.value, item.meta, { url: item.url })
      )
    )
    .concat([
      createQuickMenuItem("cmd", "home", "command"),
      createQuickMenuItem("cmd", "quick add", "command"),
      createQuickMenuItem("cmd", "quick remove", "command"),
      createQuickMenuItem("cmd", "unbloat", "command"),
      createQuickMenuItem("cmd", "config", "command"),
      createQuickMenuItem("cmd", "clearsettings", "command"),
      createQuickMenuItem("cmd", "discord", "command"),
      createQuickMenuItem("cmd", "dizzy", "command"),
      createQuickMenuItem("cmd", "breakdmenu", "command"),
      createQuickMenuItem("cmd", "glass", "command"),
      createQuickMenuItem("cmd", "ridge", "command"),
      createQuickMenuItem("cmd", "reset plant", "command"),
      createQuickMenuItem("cmd", "remove current theme", "command"),
      createQuickMenuItem("cmd", "posh text", "command"),
      createQuickMenuItem("cmd", "funny text", "command"),
    ]);

  if (dmenuConfig.toplevelConfig) {
    cmd_list = cmd_list.concat(await getDMenuOptionsForSettings(true));
  }

  dmenu(
    cmd_list,
    async function (cmd) {
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
            function (cmd, shift) {
              dmenuEditConfig(cmd);
            },
            "config: "
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
        case "dizzy":
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
        case "reset plant":
          resetPlant();
          return;
        case "remove current theme":
          let data = await browser.runtime.sendMessage({
            action: "getSettingsData",
          });
          await browser.runtime.sendMessage({
            action: "removeCustomTheme",
            id: data.appearance.theme,
          });
          break;
        case "posh text":
          document.body.style.setProperty(
            "--font-family",
            `"Monsieur La Doulaise", "Montserrat", "Trebuchet MS", sans-serif`
          );
          break;
        case "funny text":
          document.body.style.setProperty(
            "--font-family",
            `"Comic Neue", "Montserrat", "Trebuchet MS", sans-serif`
          );
        default:
          break;
      }
      if (cmd.startsWith("config.")) {
        dmenuEditConfig(cmd);
      }

      for (let i = 0; i < quicks.length; i++) {
        const quick = quicks[i];
        if (quick.name == cmd) {
          openURL(quick.url, true);
          return;
        }
      }
      for (let i = 0; i < links.length; i++) {
        if (links[i].value == cmd) {
          openURL(links[i].url, true);
        }
      }
      for (let i = 0; i < goto_items.length; i++) {
        if (goto_items[i].value == cmd) {
          openURL(goto_items[i].url);
        }
      }
      for (let i = 0; i < vakken.length; i++) {
        if (vakken[i].value == cmd) {
          openURL(vakken[i].url);
        }
      }
    },
    "quick:",
    (opener = opener)
  );
}
