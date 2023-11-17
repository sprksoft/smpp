//popupjs
document.addEventListener("DOMContentLoaded", function () {
  let profileSelect=document.getElementById("profileSelector");
  chrome.storage.local.get("current_profile", function (store) {
    profileSelect.value=store.current_profile;
  })
  profileSelect.addEventListener("change", function () {
    var selectedProfile = document.getElementById("profileSelector").value;

    chrome.storage.local.set({
      current_profile: selectedProfile,
    });
    
  });
});
