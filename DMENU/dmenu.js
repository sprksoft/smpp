const dmenu_centerd=true;
var command_list=[];
var end_func=undefined;
var open = false;
var selected=-1;
var user_text="";

function dmenu(params, onselect, name="dmenu:") {
  if (open){
    return;
  }
  open = true;
  selected=-1;
  command_list = params;
  end_func=onselect;
  user_text="";
  let dmenu = document.getElementById("dmenu");
  dmenu.getElementsByClassName("dmenu-label").innerText=name;
  dmenu.classList.remove("dmenu-hidden");

  if (dmenu_centerd && !dmenu.classList.contains("dmenu-centered")){
    dmenu.classList.add("dmenu-centered");
  }

  let autocompletelist = dmenu.getElementsByClassName("autocomplete")[0];
  autocompletelist.innerHTML = "";
  for (let i = 0; i < params.length; i++) {
    const cmd = params[i];
    let thing = document.createElement("div");
    thing.innerHTML = cmd;
    autocompletelist.appendChild(thing);
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

}
function dmenu_select_next(prev=false) {
  let dmenu = document.getElementById("dmenu");
  let input = dmenu.getElementsByTagName("input")[0];
  let autocompletelist = dmenu.getElementsByClassName("autocomplete")[0];
  let old_sel = autocompletelist.childNodes[selected];
  if (old_sel != undefined){
    old_sel.classList.remove("selected");
  }
  if (prev){
    selected-=1;
  }else{
    selected+=1;
  }
  let new_sel = autocompletelist.childNodes[selected];
  if (new_sel == undefined){
    selected = -1;
    input.value = user_text;
    user_text = "";
  }else{
    new_sel.classList.add("selected");
    if (user_text == ""){
      user_text = input.value;
    }
    input.value = new_sel.innerText;
  }
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
      console.log(e);
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
        dmenu_select_next(e.shiftKey);
        e.preventDefault();
      }
      dmenu_update_search();
    });

}


init_dmenu();
