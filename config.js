const default_settings = {
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
  smpp_logo: true
};
link_element = document.querySelector('link[rel="icon"]')

if (link_element) {
  if (smpp_logo) {
    link_element.href = "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/icon128.png";
  } else {
    link_element.href = "https://static1.smart-school.net/smsc/svg/favicon/favicon.svg";
  }
}

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
