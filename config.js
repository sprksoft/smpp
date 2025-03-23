if (browser == undefined) { var browser = chrome };
let manifest = browser.runtime.getManifest()
const liteMode = manifest.lite_mode
console.log(manifest.liteMode)

const default_settings = !liteMode ? {
  quicks: [],
  profile: "birb",
  halte: true,
  overwrite_theme: 0,
  location: "keerbergen",
  weatherSelection: 0,
  blur: "2",
  weatherAmount: 0,
  shownews: true,
  showsnake: false,
  showflappy: false,
  backgroundlink: "none",
  backgroundfile: "none",
  show_scores: false,
  isbig: true,
  showplanner: true,
  name_override: null,
  show_plant: true,
  smpp_logo: true,
  enableanimations: true
} : {
  quicks: [],
  profile: "birb",
  halte: true,
  overwrite_theme: 0,
  location: "keerbergen",
  blur: "2",
  shownews: true,
  backgroundlink: "none",
  backgroundfile: "none",
  show_scores: false,
  isbig: true,
  showplanner: true,
  name_override: null,
  smpp_logo: true,
  enableanimations: true
};

function get_config() {
  let conf = window.localStorage.getItem("settingsdata");
  if (typeof conf !== "string") {
    console.error("config is undefined. setting to default")
    conf = default_settings;
    set_config(conf)
    return conf
  }
  return JSON.parse(conf)
}
function set_config(config) {
  window.localStorage.setItem("settingsdata", JSON.stringify(config));
}
