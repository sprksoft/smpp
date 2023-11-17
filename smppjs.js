//java script komt hier je weet wel
//ok - ldev
//oke logis - andere ldev

function unbloat() {
  document.body.innerHTML = '';
}try{
  document.getElementById("notifsToggleLabel").innerHTML = "Toon pop-ups"
}catch(e){}
document.addEventListener("keyup", function(e){
  console.log(e);
  if (e.key == ':'){
    dmenu(["unbloat"]);
  }
});

try{
  document.getElementsByClassName("js-btn-logout")[0].innerHTML = "Logout -->";
}catch(e){};

window.runtime.onMessage.addListener(function(event) {
console.log("Content script received message: " + event);
      console.log("Content script received message: ");
  }
);

var selectedProfile = 
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
console.log("Profile variables set");

console.log("Done");