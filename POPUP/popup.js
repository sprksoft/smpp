//popupjs
document.addEventListener("DOMContentLoaded", function () {
  let profileSelect=document.getElementById("profileSelector");
  let input=document.getElementById("input");
  chrome.storage.local.get("current_profile", function (store) {
    profileSelect.value=store.current_profile;
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
      background_local: background
    });
    
    console.log("set backround to " + background);
  });
});
