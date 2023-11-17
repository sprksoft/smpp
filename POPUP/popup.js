//popupjs
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("profileSelector").addEventListener("change", function () {
    var selectedProfile = document.getElementById("profileSelector").value;
    console.log("Chosen profile: " + selectedProfile);

    chrome.storage.local.set({
      key1: selectedProfile
    });
    
    console.log("Sent message to background script");
  });
});