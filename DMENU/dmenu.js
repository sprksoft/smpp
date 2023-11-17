const dmenu_centerd=true;
var command_list=[];
var end_func=undefined;
var open = false;

function dmenu(params, onselect) {
  if (open){
    return;
  }
  open = true;
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
  open = false;
  let dmenu = document.getElementById("dmenu");
  dmenu.classList.add("dmenu-hidden");
  return dmenu.getElementsByTagName("input")[0].value;
}

function dmenu_update_search() {
  let dmenu = document.getElementById("dmenu");
  let input = dmenu.getElementsByTagName("input")[0];
  let autocompletelist = dmenu.getElementsByClassName("autocomplete")[0];
  let command = input.value;
  for (let i = 0; i < command_list.length; i++) {
    const cmd = command_list[i];
    if (cmd.startsWith(command)){
      let thing = document.createElement("div");
      thing.innerHTML = cmd;
      autocompletelist.appendChild(thing);
    }
  }

}
function dmenu_autocomplete() {
  let dmenu = document.getElementById("dmenu");
  let input = dmenu.getElementsByTagName("input")[0];
  let autocomplete = dmenu.getElementsByClassName("autocomplete")[0].childNodes[0].innerText;
  input.value = autocomplete;
}

function init_dmenu(){
  let dmenu = document.createElement("div");
  dmenu.id="dmenu";
  dmenu.classList.add("dmenu");
  dmenu.classList.add("dmenu-hidden");
  dmenu.innerHTML="<div class='top'><label class='dmenu-label'>dmenu:</label><input class='dmenu-input' type='text'></div><div class='autocomplete'></div>";
  document.body.insertBefore(dmenu, document.body.childNodes[-1]);
  dmenu.getElementsByTagName("input")[0].addEventListener("keydown", function(e)
    {
      let command = e.target.value;
      if (e.key == "Enter"){
        dmenu_close();
        if (end_func != undefined && command !== ""){
          end_func(command);
        }
      }else if (e.key == "Escape"){
        dmenu_close();
      }else if (e.key == "Backspace" && command === ""){
        dmenu_close();
      }else if (e.key == "Tab"){
        dmenu_autocomplete();
        e.preventDefault();
      }
      dmenu_update_search();
    });

}


init_dmenu();
