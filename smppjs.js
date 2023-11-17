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
