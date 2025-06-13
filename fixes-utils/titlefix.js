if (browser == undefined) {
  // Because this is the first file
  var browser = chrome;
}
let manifest = browser.runtime.getManifest();
const liteMode = manifest.lite_mode;

function vak_prefix(page) {
  switch (page) {
    case "news":
      return "Vaknieuws";

    case "course":
      return "Online les";

    case "documents":
      return "Documenten";

    case "uploadzone":
      return "Uploadzone";

    case "exercises":
      return "Oefeningen";

    case "lpaths":
      return "Leerpaden";

    case "weblinks":
      return "Weblinks";

    case "tasks":
      return "Taken";

    case "cooperate":
      return "Samenwerken";

    case "classmates":
      return "Studiegenoten";

    case "forum":
      return "Forum";

    case "survey":
      return "Enquêtes";

    case "wiki":
      return "Wiki";

    default:
      break;
  }
}

function title_prefix() {
  let subdomain =
    location.host.split(".")[0].charAt(0).toUpperCase() +
    location.host.split(".")[0].slice(1);
  let url = location.pathname;
  let qstr = new URLSearchParams(location.search);
  let module = qstr.get("module");

  let page = url.split("/")[1].toLowerCase();
  if (module !== null) {
    page = module.toLowerCase();
  }

  switch (page) {
    case "planner":
      return "Planner";
    case "photos":
      return "Photos";
    case "agenda":
      return "Agenda";
    case "results":
      return "Resultaten";
    case "messages":
      return "Berichten";
    case "mydoc":
      return "Mijn documenten";
    case "forms":
      return "Formulieren";
    case "studentcard":
      return "Mijn leerlingfiche";
    case "manual":
      return "Handleiding";
    case "timetable":
      return "Lesrooster";
    case "intradesk":
      return "Intradesk";
    case "online-session":
      return "Online sessies";
    case "lvs":
      return "Leerlingvolgsysteem";
    case "":
      return "Start - " + subdomain;
    default:
      break;
  }

  let topnav_title = document.querySelector(".topnav__title");
  if (topnav_title) {
    topnav_title = topnav_title.innerText;
  }
  let prefix = vak_prefix(page);
  if (prefix != undefined) {
    if (topnav_title) {
      return prefix + " - " + topnav_title;
    } else {
      return prefix;
    }
  }
}

let prepend = title_prefix();
if (prepend != undefined) {
  let title = document.querySelector("head > title");
  title.innerText = prepend + " - Smartschool";
}
