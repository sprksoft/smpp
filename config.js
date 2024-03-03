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
  show_scores: false
};
link_element = document.querySelector('link[rel="icon"]')
if (link_element) {
  link_element.href = "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/icon48.png"; 
}
function checkReloading() {
  let lastReloadTime = localStorage.getItem('lastReloadTime');
  lastReloadTime = lastReloadTime ? parseInt(lastReloadTime) : 0;
  let currentTime = new Date().getTime();
  let timeThreshold = 5000; 
  let reloadCount = localStorage.getItem('reloadCount');
  reloadCount = reloadCount ? parseInt(reloadCount) : 0;
  if (currentTime - lastReloadTime < timeThreshold) {
      reloadCount++;
      localStorage.setItem('reloadCount', reloadCount.toString());
  } else {
      reloadCount = 0;
      localStorage.setItem('reloadCount', reloadCount.toString());
  }
  let reloadThreshold = 7;
  if (reloadCount >= reloadThreshold) {
      showAlert();
      localStorage.setItem('reloadCount', '0');
  }
  localStorage.setItem('lastReloadTime', currentTime.toString());
}
function showAlert() {
  if (confirm('Smartschool++ is frequent aan het herladen, we raden op "ok" te drukken zodat local storage gewist word')) {
      localStorage.clear();
      alert('Local storage is gewist!');
  }
}
checkReloading();

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
