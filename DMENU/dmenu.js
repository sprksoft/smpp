const dmenu_centerd=true;
var command_list=[];
var end_func=undefined;

function dmenu(params, onselect) {
  command_list = params;
  end_func=onselect;
  let dmenu = document.getElementById("dmenu");
  dmenu.classList.remove("dmenu-hidden");

  if (dmenu_centerd && !dmenu.classList.contains("dmenu-centered")){
    dmenu.classList.add("dmenu-centered");
  }
  let input = dmenu.getElementsByTagName("input")[0];
  input.focus();
  input.value = ""

}
function dmenu_close() {
  let dmenu = document.getElementById("dmenu");
  dmenu.classList.add("dmenu-hidden");
  return dmenu.getElementsByTagName("input")[0].value;
}

function init_dmenu(){
  let dmenu = document.createElement("div");
  dmenu.id="dmenu";
  dmenu.classList.add("dmenu");
  dmenu.classList.add("dmenu-hidden");
  dmenu.innerHTML="<div class='top'><label class='dmenu-label'>dmenu:</label><input class='dmenu-input' type='text'></div>";
  document.body.insertBefore(dmenu, document.body.childNodes[-1]);
  dmenu.getElementsByTagName("input")[0].addEventListener("keydown", function(e)
    {
      let command = e.target.value;
      if (e.key == "Enter"){
        dmenu_close();
        if (end_func != undefined){
          end_func(command);
        }
      }else if (e.key == "Escape"){
        dmenu_close();
      }
    });

}

init_dmenu();
