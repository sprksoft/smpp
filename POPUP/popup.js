//popupjs

document.addEventListener("DOMContentLoaded", function () {
  let profileSelect = document.getElementById("profileSelector");
  let background = document.getElementById("background");
  let halte = document.getElementById("halt");
  let button = document.getElementById("button");
  let location = document.getElementById("location");
  let ovloc = document.getElementById("ovloc");
  function refresh() {

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      // Chrome
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
      });
    } else if (typeof browser !== 'undefined' && browser.tabs) {
      // Firefox
      browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        browser.tabs.reload(tabs[0].id);
      });
    }
  };

  chrome.storage.local.get("current_profile", function (store) {
    profileSelect.value = store.current_profile;
  });

  chrome.storage.local.get("local_background", function (store) {
    background.value = store.local_background;
  });

  profileSelect.addEventListener("change", function () {
    var selectedProfile = document.getElementById("profileSelector").value;

    chrome.storage.local.set({
      current_profile: selectedProfile,
    });
    refresh()

    console.log("set profile to " + selectedProfile);
  });

  background.addEventListener("change", function () {
    var background = document.getElementById("background").value;
    chrome.storage.local.set({
      local_background: background,
    });
    refresh()

    console.log("set background to " + background);
  });
  location.addEventListener("change", function () {
    var location = document.getElementById("location").value;
    chrome.storage.local.set({
      location: location,
    });
    refresh()

    console.log("set location to " + location);
  });
  halte.addEventListener("change", function () {
    var halte = document.getElementById("halt").value;
    chrome.storage.local.set({
      current_id: halte,
    });
    refresh()

    console.log("set halte to " + halte);
  });
  button.addEventListener("change", function () {
    var button = document.getElementById("button").checked;
    chrome.storage.local.set({
      buttonstate: button,
    });
    refresh()

    console.log("set button to " + button);
  });
  ovloc.addEventListener("change", function () {
    var ovloc = document.getElementById("ovloc").checked;
    chrome.storage.local.set({
      ovlocstate: ovloc,
    });
    refresh()
    console.log("set ovloc to " + ovloc);
  });
  chrome.storage.local.get("current_id", function (store) {
    halte.value = store.current_id;
  });
  chrome.storage.local.get("location", function (store) {
    location.value = store.location;
  });
  chrome.storage.local.get("buttonstate", function (store) {
    button.checked = store.buttonstate;
  });
  chrome.storage.local.get("ovlocstate", function (store) {
    ovloc.checked = store.ovlocstate;
  });
  const slider = document.getElementById('mySlider');
  const output = document.getElementById('sliderValue');

  // Display the default slider value
  output.textContent = slider.value;

  // Update the current slider value when the slider is moved
  slider.addEventListener('input', function () {
    output.textContent = this.value;
    blurvalue = this.value;
    chrome.storage.local.set({
      blurvalue: blurvalue
    });
    console.log("set blurvalue to " + blurvalue);
  });
  chrome.storage.local.get("blurvalue", function (store) {
    slider.value = store.blurvalue;
    output.textContent = store.blurvalue;
    console.log("set blurvalue to " + store.blurvalue);
  });
});

