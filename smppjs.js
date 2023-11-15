//tjafa scrieptje komt hier je weet wel
//ok - ldev

function unbloat() {
  document.body.innerHTML = '';
}


function dmenu(params) {
  let dmenu = document.getElementById("dmenu");
  dmenu.classList.remove("dmenu-hidden");
  dmenu.getElementsByTagName("input")[0].focus();
  console.log("dmenu");
}

function init_dmenu(){
  let dmenu = document.createElement("div");
  dmenu.id="dmenu";
  dmenu.classList.add("dmenu");
  dmenu.classList.add("dmenu-hidden");
  dmenu.innerHTML="<input type='text'>";
  document.body.insertBefore(dmenu, document.body.childNodes[-1]);
  dmenu.getElementsByTagName("input")[0].attachEventListener("keydown", function(e)
    {
      
    });

}

init_dmenu();

document.addEventListener("keyup", function(e){
  console.log(e);
  if (e.key == ':'){
    dmenu(["unbloat"]);
  }
});
