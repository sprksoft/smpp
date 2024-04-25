// Changes local name and decapitates (un-heads)
// TODO: the unheadding is currently not fully moved to this file

let config = get_config();
if (config.username_override == undefined){
  config.username_override = null;
  set_config(config);
}
let username_override=config.username_override;
// for quickmenu/config to be able to set it back to null
if (username_override == "null"){ 
  username_override = null;
}

let full_unheading=true; // Unhead everywhere (also in lvs and profile)

//Returns: original name
function change_lname(new_name) {
  let name_element = document.querySelector(".js-btn-profile .hlp-vert-box span");
  if (name_element !== null){
    let orig_name = name_element.innerText;
    if (new_name !== null){
      name_element.innerText=new_name;
    }
    return orig_name;
  }
  return "Mr. Unknown"

}

function try_attach_messages_observer(orig_name, new_name) {
  let messages_list = document.getElementById("msglist");
  if (messages_list == null){
    return
  }
  const observer = new MutationObserver(function(muts, observer){
    for (const mut of muts){
      for(const msg of mut.addedNodes){
        if (msg.nodeName == "#text"){continue}; // SmartSchool added a random space character to their code

        let name_el = msg.querySelector(".modern-message__name");
        if (name_el == null){ continue }; // Name is not present on messages from things like BookWidgets

        if (name_el.innerText.startsWith(orig_name)){
          if (new_name !== null){
            name_el.innerText=new_name;
          }
          msg.querySelector(".modern-message__image img").style="display: none;";
        }
      }
    }
  });
  observer.observe(messages_list, {attributes: false, childList: true, subtree: false});
}

function unhead_fully(){
  let style_el = document.createElement("style");
  style_el.innerText=`
    .studentPicture, .rounded_profile_photo, .square_photo_64{
      display:none;
    }
  `
  document.head.appendChild(style_el);
}

let orig_name = change_lname(username_override);
console.log("oname"+orig_name)
try_attach_messages_observer(orig_name, username_override)

if (full_unheading){
  unhead_fully();
}


