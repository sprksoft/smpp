//java script komt hier je weet wel
//ok - ldev
//oke logis - andere ldev

function unbloat() {
  document.body.innerHTML = '';
}

//WARNING: garbage
try{
  document.getElementsByClassName("js-btn-logout")[0].innerHTML = "Logout -->";
  document.getElementById("notifsToggleLabel").innerHTML = "Toon pop-ups"
}catch(e){}
//END Garbage

document.addEventListener("keyup", function(e){
  //console.log(e);
  if (e.key == ':'){
    dmenu(["unbloat", "didit", "digitale methode", "planner", "set theme"], function (cmd) {
      switch (cmd) {
        case "unbloat":
          unbloat();
        case "set theme":


        default:
          break;
      }
    }, "quick:");
  }
});




chrome.storage.local.get('current_profile', function (store) {
  selected_profile = store.current_profile;
  console.log("set profile to " + store.current_profile);

  switch (selected_profile) {
    case 'xgames':
      document.documentElement.style.setProperty('--color-accent', '#ffd5a0');
      document.documentElement.style.setProperty('--color-text', '#C2BAB2');
      document.documentElement.style.setProperty('--color-base00', '#191817');
      document.documentElement.style.setProperty('--color-base01', '#232020');
      document.documentElement.style.setProperty('--color-base02', '#3f3c3b');
      document.documentElement.style.setProperty('--color-base03', '#5b5756');
      break;
    case 'birb':
      document.documentElement.style.setProperty('--color-accent', '#A58AE3');
      document.documentElement.style.setProperty('--color-text', '#cfc8f4');
      document.documentElement.style.setProperty('--color-base00', '#3F3557');
      document.documentElement.style.setProperty('--color-base01', '#5B4C7D');
      document.documentElement.style.setProperty('--color-base02', '#6E5C97');
      document.documentElement.style.setProperty('--color-base03', '##7764A4');
      break;                                                                  
    case 'bjarn':
      document.documentElement.style.setProperty('--color-accent', '#000');
      document.documentElement.style.setProperty('--color-text', '#000');
      document.documentElement.style.setProperty('--color-base00', '#000');
      document.documentElement.style.setProperty('--color-base01', '#000');
      document.documentElement.style.setProperty('--color-base02', '#000');
      document.documentElement.style.setProperty('--color-base03', '#000');
      break;
      case 'comfy':
        document.documentElement.style.setProperty('--color-accent', '#000');
        document.documentElement.style.setProperty('--color-text', '#000');
        document.documentElement.style.setProperty('--color-base00', '#000');
        document.documentElement.style.setProperty('--color-base01', '#000');
        document.documentElement.style.setProperty('--color-base02', '#000');
        document.documentElement.style.setProperty('--color-base03', '#000');
        break;
        case 'cream':
          document.documentElement.style.setProperty('--color-accent', '#000');
          document.documentElement.style.setProperty('--color-text', '#000');
          document.documentElement.style.setProperty('--color-base00', '#000');
          document.documentElement.style.setProperty('--color-base01', '#000');
          document.documentElement.style.setProperty('--color-base02', '#000');
          document.documentElement.style.setProperty('--color-base03', '#000');
          break;
    // Add more cases for other profiles as needed
    default:
    // Handle default case or do nothing if no match found
  }
});

console.log("Done");
