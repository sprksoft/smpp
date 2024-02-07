const default_settings = {
  profile: "default",
  background: "none",
  halte: true,
  overwrite_theme: false,
  location: "keerbergen",
  blur: "2",
  snow: "0",
  shownews: true,
  showsnake: false
};
function get_config() {
  let conf = JSON.parse(window.localStorage.getItem("settingsdata"));
  if (conf == undefined) {
    conf = default_settings;
  }
  return conf
}
function set_config(config) {
  window.localStorage.setItem("settingsdata", JSON.stringify(config));
  apply();
}
