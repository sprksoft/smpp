// Voeg een nieuw inputveld toe zonder de originele inhoud te verwijderen (   thx voor de geen info lukas >:(   )
var container = document.getElementById("smscMainBlockContainer");
container?.insertAdjacentHTML('beforeend', '<div id=inputVakContainter><input type="text" color="red" id="inputVak" placeholder="Custom name"></div>')

let config = get_config();
if (config.username_override == undefined){
  config.username_override = null;
  set_config(config);
}
let username_override = config.username_override;
if (username_override == "null"){ 
  username_override = null;
}

let full_unheading = true; 


function change_lname(new_name) {
  let name_element = document.querySelector(".js-btn-profile .hlp-vert-box span");
  if (name_element !== null){
    let orig_name = name_element.innerText;
    if (new_name !== null){
      name_element.innerText = new_name;
    }
    return orig_name;
  }
  return "Mr. Unknown";
}

function try_attach_messages_observer(orig_name, new_name) {
  let messages_list = document.getElementById("msglist");
  if (messages_list == null){
    return;
  }
  const observer = new MutationObserver(function(muts, observer){
    let in_send_messages_page = document.querySelector(".msgcell__head__title").innerText == "Verzonden";
    for (const mut of muts){
      for(const msg of mut.addedNodes){
        if (msg.nodeName == "#text"){continue;} 
        let name_el = msg.querySelector(".modern-message__name");
        if (name_el == null){ continue; }
    
        let name_is_user = name_el.innerText.startsWith(orig_name);
        if (name_is_user){
          if (new_name !== null){
            name_el.innerText = new_name;
          }
        }
        if (name_is_user || in_send_messages_page){
          msg.querySelector(".modern-message__image img").style = "display: none;";
        }
      }
    }
  });
  observer.observe(messages_list, {attributes: false, childList: true, subtree: false});
}

function unhead_fully(){
  let style_el = document.createElement("style");
  style_el.innerText = `
    .studentPicture, .rounded_profile_photo, .square_photo_64 {
      display: none;
    }
  `;
  document.head.appendChild(style_el);
}

let orig_name = change_lname(username_override, null);
try_attach_messages_observer(orig_name, username_override);

if (full_unheading){
  unhead_fully();
}

let input_vak = document.getElementById("inputVak")
input_vak?.addEventListener('input', function() {
  var inputValue = input_vak.value;
  inputValue = inputValue == "" ? null : inputValue;
  config.username_override = inputValue;
  set_config(config);
  if (inputValue == null){inputValue=orig_name}
  change_lname(inputValue);
})
