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



chrome.storage.local.get('current_profile', function(store) {
  console.log("set profile to "+store.current_profile)
});

console.log("Done");
