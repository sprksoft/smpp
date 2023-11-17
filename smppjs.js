//java script komt hier je weet wel
//ok - ldev
//oke logis - andere ldev

function unbloat() {
  document.body.innerHTML = '';
}
document.getElementById("notifsToggleLabel").innerHTML = "Toon pop-ups"
document.addEventListener("keyup", function(e){
  console.log(e);
  if (e.key == ':'){
    dmenu(["unbloat"]);
  }
});


document.getElementsByClassName("js-btn-logout")[0].innerHTML = "Logout -->"
//popupjs
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("profileSelector").addEventListener("change", function() {
    var selectedProfile = document.getElementById("profileSelector").value;
    console.log("Chosen profile: " + selectedProfile);
    switch (selectedProfile) {
      case "profile1":
        // Code to set variables for profile 1
        break;
      case "profile2":
        // Code to set variables for profile 2
        break;
      case "profile3":
        // Code to set variables for profile 3
        break;
    }
    location.reload();
  });
});