//popupjs
document.addEventListener("DOMContentLoaded", function () {
  let profileSelect = document.getElementById("profileSelector");
  let input = document.getElementById("input");
  let haltes = document.getElementById("halt"); // Fix: Change "haltes" to "halt"
  let idSelect = document.getElementById("idSelector");

  chrome.storage.local.get("current_profile", function (store) {
    profileSelect.value = store.current_profile;
  });

  chrome.storage.local.get("local_background", function (store) {
    input.value = store.local_background;
  });

  profileSelect.addEventListener("change", function () {
    var selectedProfile = document.getElementById("profileSelector").value;

    chrome.storage.local.set({
      current_profile: selectedProfile,
    });

    console.log("set profile to " + selectedProfile);
  });

  input.addEventListener("change", function () {
    var background = document.getElementById("input").value;
    chrome.storage.local.set({
      local_background: background,
    });

    console.log("set background to " + background);
  });

  chrome.storage.local.get("current_id", function (store) {
    idSelect.value = store.current_id;
  });

  chrome.storage.local.get("local_id", function (store) {
    haltes.value = store.local_id; // Fix: Change "haltes" to "halt"
  });

  haltes.addEventListener("change", function () {
    var selectedId = document.getElementById("idSelector").value;

    chrome.storage.local.set({
      current_id: selectedId,
    });

    console.log("set bus id to " + selectedId);
  });

  haltes.addEventListener("change", function () {
    var halte = document.getElementById("halt").value; // Fix: Change "haltes" to "halt"
    chrome.storage.local.set({
      local_id: halte,
    });
  });
});

