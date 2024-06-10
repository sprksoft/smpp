const default_settings = {
  quicks: [],
  profile: "birb",
  halte: true,
  overwrite_theme: 0,
  location: "keerbergen",
  weatherSelection: 0,
  blur: "2",
  weatherAmount: "0",
  shownews: true,
  showsnake: false,
  showflappy: false,
  backgroundlink: "none",
  backgroundfile: "none",
  show_scores: false,
  isbig: true,
  showplanner: true,
  name_override: null,
  show_plant: true
};
link_element = document.querySelector('link[rel="icon"]')
if (link_element) {
  link_element.href = "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/icon128.png";
}

function get_config() {
  let conf = window.localStorage.getItem("settingsdata");
  if (typeof conf !== "string") {
    console.log("conf is undefined. setting to default")
    conf = default_settings;
    set_config(conf)
    return conf
  }
  return JSON.parse(conf)
}
function set_config(config) {
  window.localStorage.setItem("settingsdata", JSON.stringify(config));
}
