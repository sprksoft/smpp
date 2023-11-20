//popupjs
document.addEventListener("DOMContentLoaded", function () {
  let profileSelect=document.getElementById("profileSelector");
  let input=document.getElementById("input");
  chrome.storage.local.get("current_profile", function (store) {
    profileSelect.value=store.current_profile;
  })
  chrome.storage.local.get("local_background", function (store) {
    input.value=store.local_background;
  })

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
      local_background: background
    });
    
    console.log("set backround to " + background);
  });
});
