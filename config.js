const default_settings = {
  profile: "default",
  halte: true,
  overwrite_theme: 0,
  location: "keerbergen",
  blur: "2",
  snow: "0",
  shownews: true,
  showsnake: false,
  backgroundlink: "none",
  backgroundfile: "none",
  show_scores: false,
  isbig: true
};
link_element = document.querySelector('link[rel="icon"]')
if (link_element) {
  link_element.href = "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/icon128.png";
}

function get_config() {
  let conf = window.localStorage.getItem("settingsdata");
  if (conf == null) {
    console.log("conf is undefined")
    conf = default_settings;
    set_config(conf)
  }
  return JSON.parse(conf)
}
function set_config(config) {
  window.localStorage.setItem("settingsdata", JSON.stringify(config));
}
