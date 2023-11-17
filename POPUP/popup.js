//popupjs
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("profileSelector").addEventListener("change", function () {
    var selectedProfile = document.getElementById("profileSelector").value;
    console.log("Chosen profile: " + selectedProfile);

    window.runtime.sendMessage({
      "action": "init"
  });
    console.log("Sent message to background script");
  });
});